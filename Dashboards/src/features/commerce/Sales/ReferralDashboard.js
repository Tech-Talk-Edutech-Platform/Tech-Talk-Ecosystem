import React, { useState, useEffect } from "react";
import { Users2, Ticket, DollarSign, ArrowUpRight, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "../../../supabase";
import StatCard from "../../../components/StatCard";
import toast from "react-hot-toast";

export default function ReferralDashboard() {
  const [marketers, setMarketers] = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMarketer, setSelectedMarketer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, pendingPayouts: 0, activeMarketers: 0 });
const [editingMarketer, setEditingMarketer] = useState(null);
  // Form State
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRate, setNewRate] = useState(10);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // Fetch only necessary data
      const [mRes, aRes, uRes] = await Promise.all([
        supabase.from("marketer_profiles").select("*").order("full_name"),
        supabase.from("referral_attributions").select("*, users(full_name)"),
        supabase.from("users").select("id, full_name") .eq("role", "marketer").order("full_name")
      ]);

      setMarketers(mRes.data || []);
      setAttributions(aRes.data || []);
      // setAllUsers(uRes.data || []);
      const marketerIds = (mRes.data || []).map(m => m.id);

setAllUsers(
  (uRes.data || []).filter(
    user => !marketerIds.includes(user.id)
  )
);

      const totalRevenue = (aRes.data || []).reduce((acc, curr) => acc + Number(curr.sale_amount), 0);
      const pendingComm = (aRes.data || []).filter(a => a.status === "approved").reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

      setStats({
        totalSales: totalRevenue,
        pendingPayouts: pendingComm,
        activeMarketers: (mRes.data || []).length
      });
    } catch (err) {
      toast.error("Data pipeline error.");
    } finally {
      setLoading(false);
    }
  };

  // const generateMarketerCode = async (e) => {
  //   e.preventDefault();
  //   if (!selectedUserId || !newCode) return toast.error("Select user and code.");

  //   const { error } = await supabase.from("marketer_profiles").insert([{
  //     id: selectedUserId,
  //     full_name: allUsers.find(u => u.id === selectedUserId)?.full_name,
  //     referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
  //     commission_rate_pct: newRate
  //   }]);

  //   if (error) return toast.error("Error: User may already be a marketer.");
  //   toast.success("Marketer node activated.");
  //   fetchReferralData();
  // };
  const generateMarketerCode = async (e) => {
  e.preventDefault();

  if (!selectedUserId || !newCode)
    return toast.error("Select user and code.");

  if (editingMarketer) {
    const { error } = await supabase
      .from("marketer_profiles")
      .update({
        referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
        commission_rate_pct: newRate
      })
      .eq("id", editingMarketer);

    if (error) return toast.error(error.message);

    toast.success("Marketer updated.");
  } else {
    const { error } = await supabase
      .from("marketer_profiles")
      .insert([{
        id: selectedUserId,
        full_name: allUsers.find(u => u.id === selectedUserId)?.full_name,
        referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
        commission_rate_pct: newRate
      }]);

    if (error) return toast.error(error.message);

    toast.success("Marketer created.");
  }

  setEditingMarketer(null);
  setSelectedUserId("");
  setNewCode("");
  setNewRate(10);

  fetchReferralData();
};

  const deleteMarketer = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this marketer?")) return;
    await supabase.from("marketer_profiles").delete().eq("id", id);
    if(selectedMarketer?.id === id) setSelectedMarketer(null);
    fetchReferralData();
  };

  const filteredAttributions = selectedMarketer 
    ? attributions.filter(a => a.referral_code_used === selectedMarketer.referral_code)
    : attributions;
const marketerStats = selectedMarketer
  ? {
      totalCustomers: filteredAttributions.length,
      totalSales: filteredAttributions.reduce(
        (sum, a) => sum + Number(a.sale_amount || 0),
        0
      ),
      totalCommission: filteredAttributions.reduce(
        (sum, a) => sum + Number(a.calculated_commission || 0),
        0
      ),
      approvedCommission: filteredAttributions
        .filter(a => a.status === "approved")
        .reduce((sum, a) => sum + Number(a.calculated_commission || 0), 0),
      paidCommission: filteredAttributions
        .filter(a => a.status === "paid")
        .reduce((sum, a) => sum + Number(a.calculated_commission || 0), 0),
    }
  : null;
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen">

<button
  onClick={() => window.history.back()}
  className="mb-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800"
>
  <ArrowLeft size={14} />
  Back
</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Code Revenue" value={`KES ${stats.totalSales.toLocaleString()}`} color="green" icon={DollarSign} />
        <StatCard title="Approved Payout Pool" value={`KES ${stats.pendingPayouts.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
        <StatCard title="Active Marketer Nodes" value={stats.activeMarketers} color="blue" icon={Users2} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
            <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
              <Ticket size={16} className="text-indigo-400" /> Provision Referral Code
            </h3>
            <form onSubmit={generateMarketerCode} className="space-y-4">

              <select
  value={selectedUserId}
  onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white">
              
              {editingMarketer && (
  <option value={selectedUserId}>
    {selectedMarketer?.full_name}
  </option>
)}  
                <option value="">-- Select a User --</option>
                {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
               <input
  value={newCode}
  onChange={e => setNewCode(e.target.value)}
                placeholder="CODE20" className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm uppercase" />
                <input
  value={newRate}
  onChange={e => setNewRate(Number(e.target.value))}
                type="number" placeholder="10" className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm" />
              </div>

              {editingMarketer && (

  <button
    type="button"
    onClick={() => {
      setEditingMarketer(null);
      setSelectedMarketer(null);
      setSelectedUserId("");
      setNewCode("");
      setNewRate(10);
    }}
    className="w-full py-3 bg-slate-800 rounded-xl font-bold text-xs uppercase text-white mb-3"
  >
    ← Back To Create Mode
  </button>
)}
              <button className="w-full py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase text-white">{editingMarketer ? "Update Marketer" : "Commit Node"}</button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
            <h3 className="text-sm font-black uppercase text-white mb-4">Active Marketers (Click to Filter)</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {marketers.map(m => (
                <div key={m.id} onClick={() => {
  setSelectedMarketer(m);

  setEditingMarketer(m.id);
  setSelectedUserId(m.id);
  setNewCode(m.referral_code);
  setNewRate(m.commission_rate_pct);
}}
className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer ${selectedMarketer?.id === m.id ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>
                  <div><p className="text-xs font-bold">{m.full_name}</p><p className="text-[10px] text-indigo-400">{m.referral_code}</p></div>
                  <button onClick={(e) => deleteMarketer(m.id, e)} className="text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            {selectedMarketer && <button onClick={() => setSelectedMarketer(null)} className="mt-4 text-[10px] text-slate-400 underline">Clear Filter</button>}
          </div>
        </div>
         <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
{selectedMarketer && (
  <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Referral Code</p>
      <p className="font-bold">{selectedMarketer.referral_code}</p>
    </div>

    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Commission Rate</p>
      <p className="font-bold">{selectedMarketer.commission_rate_pct}%</p>
    </div>

    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Joined</p>
      <p className="font-bold">
        {new Date(selectedMarketer.created_at).toLocaleDateString()}
      </p>
    </div>

    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Customers</p>
      <p className="font-bold">{marketerStats.totalCustomers}</p>
    </div>

    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Sales Generated</p>
      <p className="font-bold">
        KES {marketerStats.totalSales.toLocaleString()}
      </p>
    </div>

    <div className="bg-slate-950 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400">Commission Earned</p>
      <p className="font-bold text-emerald-400">
        KES {marketerStats.totalCommission.toLocaleString()}
      </p>
    </div>
  </div>
)}
       
          <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-slate-800 pb-3">
            {selectedMarketer ? `Attribution Log: ${selectedMarketer.full_name}` : "All Referral Activity"}
          </h3>
          <div className="space-y-3">
            {filteredAttributions.map(attr => (
              <div key={attr.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div><p className="text-xs font-bold">{attr.users?.full_name || "Direct Conversion"}</p><p className="text-[10px] text-slate-500">Ref Code: {attr.referral_code_used}</p></div>
                <p className="text-xs font-black text-emerald-400">+KES {Number(attr.calculated_commission).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { Users2, Ticket, DollarSign, ArrowUpRight, Plus, Trash2 } from "lucide-react";
// import { supabase } from "../../../supabase";
// import StatCard from "../../../components/StatCard";
// import toast from "react-hot-toast";

// export default function ReferralDashboard() {
//   const [marketers, setMarketers] = useState([]);
//   const [attributions, setAttributions] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [selectedMarketer, setSelectedMarketer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({ totalSales: 0, pendingPayouts: 0, activeMarketers: 0 });

//   // Form State
//   const [selectedUserId, setSelectedUserId] = useState("");
//   const [newCode, setNewCode] = useState("");
//   const [newRate, setNewRate] = useState(10);

//   useEffect(() => {
//     fetchReferralData();
//   }, []);

//   const fetchReferralData = async () => {
//     setLoading(true);
//     try {
//       const [mRes, aRes, uRes] = await Promise.all([
//         supabase.from("marketer_profiles").select("*").order("full_name"),
//         supabase.from("referral_attributions").select("*, users:lead_or_student_id(full_name)"),
//         supabase.from("users").select("id, full_name").order("full_name")
//       ]);

//       setMarketers(mRes.data || []);
//       setAttributions(aRes.data || []);
//       setAllUsers(uRes.data || []);

//       const totalRevenue = (aRes.data || []).reduce((acc, curr) => acc + Number(curr.sale_amount), 0);
//       const pendingComm = (aRes.data || []).filter(a => a.status === "approved").reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

//       setStats({
//         totalSales: totalRevenue,
//         pendingPayouts: pendingComm,
//         activeMarketers: (mRes.data || []).length
//       });
//     } catch (err) {
//       toast.error("Pipeline breakdown.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateMarketerCode = async (e) => {
//     e.preventDefault();
//     if (!selectedUserId || !newCode) return toast.error("Select user and code.");

//     const { error } = await supabase.from("marketer_profiles").insert([{
//       id: selectedUserId,
//       full_name: allUsers.find(u => u.id === selectedUserId)?.full_name,
//       referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
//       commission_rate_pct: newRate
//     }]);

//     if (error) return toast.error("Error: User may already be a marketer.");
//     toast.success("Marketer node activated.");
//     fetchReferralData();
//   };

//   const deleteMarketer = async (id, e) => {
//     e.stopPropagation();
//     if (!window.confirm("Delete this marketer?")) return;
//     await supabase.from("marketer_profiles").delete().eq("id", id);
//     fetchReferralData();
//   };

//   const filteredAttributions = selectedMarketer 
//     ? attributions.filter(a => a.referral_code_used === selectedMarketer.referral_code)
//     : attributions;

//   return (
//     <div className="p-6 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen">
//       {/* Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         <StatCard title="Total Code Revenue" value={`KES ${stats.totalSales.toLocaleString()}`} color="green" icon={DollarSign} />
//         <StatCard title="Approved Payout Pool" value={`KES ${stats.pendingPayouts.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
//         <StatCard title="Active Marketer Nodes" value={stats.activeMarketers} color="blue" icon={Users2} />
//       </div>

//       <div className="grid grid-cols-12 gap-8">
//         {/* Left Column: Create & List */}
//         <div className="col-span-12 lg:col-span-5 space-y-8">
//           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
//             <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
//               <Ticket size={16} className="text-indigo-400" /> Provision Referral Code
//             </h3>
//             <form onSubmit={generateMarketerCode} className="space-y-4">
//               <select onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white">
//                 <option value="">-- Select a User --</option>
//                 {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
//               </select>
//               <div className="grid grid-cols-2 gap-4">
//                 <input onChange={e => setNewCode(e.target.value)} placeholder="CODE20" className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm uppercase" />
//                 <input onChange={e => setNewRate(e.target.value)} type="number" placeholder="10" className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm" />
//               </div>
//               <button className="w-full py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase text-white">Commit Node</button>
//             </form>
//           </div>

//           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
//             <h3 className="text-sm font-black uppercase text-white mb-4">Active Marketers (Click to Filter)</h3>
//             <div className="space-y-2 max-h-[300px] overflow-y-auto">
//               {marketers.map(m => (
//                 <div key={m.id} onClick={() => setSelectedMarketer(m)} className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer ${selectedMarketer?.id === m.id ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>
//                   <div><p className="text-xs font-bold">{m.full_name}</p><p className="text-[10px] text-indigo-400">{m.referral_code}</p></div>
//                   <button onClick={(e) => deleteMarketer(m.id, e)} className="text-red-400"><Trash2 size={14}/></button>
//                 </div>
//               ))}
//             </div>
//             {selectedMarketer && <button onClick={() => setSelectedMarketer(null)} className="mt-4 text-[10px] text-slate-400 underline">Clear Filter</button>}
//           </div>
//         </div>

//         {/* Right Column: Log */}
//         <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
//           <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-slate-800 pb-3">
//             {selectedMarketer ? `Log: ${selectedMarketer.full_name}` : "All Attribution Log"}
//           </h3>
//           <div className="space-y-3">
//             {filteredAttributions.map(attr => (
//               <div key={attr.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
//                 <div><p className="text-xs font-bold">{attr.users?.full_name || "Guest"}</p><p className="text-[10px] text-slate-500">Code: {attr.referral_code_used}</p></div>
//                 <p className="text-xs font-black text-emerald-400">+KES {Number(attr.calculated_commission).toLocaleString()}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from "react";
// // import { Users2, Ticket, DollarSign, ArrowUpRight, Plus, Search } from "lucide-react";
// // import { supabase } from "../../../supabase";
// // import StatCard from "../../../components/StatCard";
// // import toast from "react-hot-toast";

// // export default function ReferralDashboard() {
// //   const [marketers, setMarketers] = useState([]);
// //   const [attributions, setAttributions] = useState([]);
// //   const [allUsers, setAllUsers] = useState([]);
// //   const [stats, setStats] = useState({ totalSales: 0, pendingPayouts: 0, activeMarketers: 0 });
// //   const [loading, setLoading] = useState(true);

// //   // Form State
// //   const [selectedUserId, setSelectedUserId] = useState("");
// //   const [newName, setNewName] = useState("");
// //   const [newCode, setNewCode] = useState("");
// //   const [newRate, setNewRate] = useState(10);

// //   useEffect(() => {
// //     fetchReferralData();
// //   }, []);

// //   const fetchReferralData = async () => {
// //     setLoading(true);
// //     try {
// //       const [marketersRes, attributionsRes, usersRes] = await Promise.all([
// //         supabase.from("marketer_profiles").select("*").order("created_at", { ascending: false }),
// //         supabase.from("referral_attributions").select("*, users:lead_or_student_id(full_name)").order("created_at", { ascending: false }),
// //         supabase.from("users").select("id, full_name").order("full_name")
// //       ]);

// //       setMarketers(marketersRes.data || []);
// //       setAttributions(attributionsRes.data || []);
// //       setAllUsers(usersRes.data || []);

// //       const totalRevenue = (attributionsRes.data || []).reduce((acc, curr) => acc + Number(curr.sale_amount), 0);
// //       const pendingComm = (attributionsRes.data || [])
// //         .filter(attr => attr.status === "approved")
// //         .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// //       setStats({
// //         totalSales: totalRevenue,
// //         pendingPayouts: pendingComm,
// //         activeMarketers: (marketersRes.data || []).filter(m => m.status === "active").length
// //       });
// //     } catch (err) {
// //       toast.error("Data pipeline breakdown.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const generateMarketerCode = async (e) => {
// //     e.preventDefault();
// //     if (!selectedUserId || !newCode) return toast.error("Please select a user and provide a code.");

// //     try {
// //       const { error } = await supabase.from("marketer_profiles").insert([{
// //         id: selectedUserId,
// //         full_name: newName,
// //         referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
// //         commission_rate_pct: newRate
// //       }]);

// //       if (error) throw error;
// //       toast.success("Marketer structural node activated.");
// //       setNewCode(""); 
// //       setSelectedUserId("");
// //       fetchReferralData();
// //     } catch (err) {
// //       toast.error("Error: User may already be a marketer.");
// //     }
// //   };

// //   return (
// //     <div className="p-6 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
// //         <StatCard title="Total Code Revenue" value={`KES ${stats.totalSales.toLocaleString()}`} color="green" icon={DollarSign} />
// //         <StatCard title="Approved Payout Pool" value={`KES ${stats.pendingPayouts.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
// //         <StatCard title="Active Marketer Nodes" value={stats.activeMarketers} color="blue" icon={Users2} />
// //       </div>

// //       <div className="grid grid-cols-12 gap-8">
// //         <div className="col-span-12 lg:col-span-5 space-y-8">
// //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// //             <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
// //               <Ticket size={16} className="text-indigo-400" /> Provision Referral Code
// //             </h3>
// //             <form onSubmit={generateMarketerCode} className="space-y-4">
// //               <div>
// //                 <label className="text-[11px] font-bold text-slate-400 block mb-1">SELECT EXISTING USER</label>
// //                 <select 
// //                   value={selectedUserId} 
// //                   onChange={(e) => {
// //                     setSelectedUserId(e.target.value);
// //                     const user = allUsers.find(u => u.id === e.target.value);
// //                     setNewName(user ? user.full_name : "");
// //                   }}
// //                   className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm text-white"
// //                 >
// //                   <option value="">-- Select a User --</option>
// //                   {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
// //                 </select>
// //               </div>
// //               <div className="grid grid-cols-2 gap-4">
// //                 <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="CODE20" className="p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm uppercase" />
// //                 <input value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder="10" className="p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
// //               </div>
// //               <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs uppercase text-white">Commit Code Node</button>
// //             </form>
// //           </div>

// //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// //             <h3 className="text-sm font-black uppercase text-white mb-4">Active System Marketers</h3>
// //             <div className="space-y-2 max-h-[300px] overflow-y-auto">
// //               {marketers.map(m => (
// //                 <div key={m.id} className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex justify-between items-center">
// //                   <div>
// //                     <p className="text-xs font-bold text-white">{m.full_name}</p>
// //                     <p className="text-[10px] font-mono text-indigo-400">{m.referral_code}</p>
// //                   </div>
// //                   <span className="text-[10px] px-2 py-1 bg-slate-900 border border-slate-800 rounded">{m.commission_rate_pct}% Rate</span>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// //           <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-slate-800/60 pb-3">Real-Time Attribution Log</h3>
// //           <div className="space-y-3">
// //             {attributions.map(attr => (
// //               <div key={attr.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center">
// //                 <div>
// //                   <p className="text-xs font-bold text-white">Brought in {attr.users?.full_name}</p>
// //                   <p className="text-[10px] text-slate-500">Value: KES {Number(attr.sale_amount).toLocaleString()}</p>
// //                 </div>
// //                 <p className="text-xs font-black text-emerald-400">+KES {Number(attr.calculated_commission).toLocaleString()}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // import React, { useState, useEffect } from "react";
// // // import { Users2, Ticket, DollarSign, ArrowUpRight, CheckCircle, Plus, Search } from "lucide-react";
// // // import { supabase } from "../../../supabase";
// // // import StatCard from "../../../components/StatCard";
// // // import toast from "react-hot-toast";

// // // export default function ReferralDashboard() {
// // //   const [marketers, setMarketers] = useState([]);
// // //   const [attributions, setAttributions] = useState([]);
// // //   const [stats, setStats] = useState({ totalSales: 0, pendingPayouts: 0, activeMarketers: 0 });
// // //   const [loading, setLoading] = useState(true);

// // //   // Form State for creating a new marketer code
// // //   const [newName, setNewName] = useState("");
// // //   const [newCode, setNewCode] = useState("");
// // //   const [newRate, setNewRate] = useState(10);

// // //   useEffect(() => {
// // //     fetchReferralData();
// // //   }, []);

// // //   const fetchReferralData = async () => {
// // //     setLoading(false);
// // //     try {
// // //       // Parallel fetch for dashboard data
// // //       const [marketersRes, attributionsRes] = await Promise.all([
// // //         supabase.from("marketer_profiles").select("*").order("created_at", { ascending: false }),
// // //         supabase.from("referral_attributions").select("*, users:lead_or_student_id(full_name)").order("created_at", { ascending: false })
// // //       ]);

// // //       setMarketers(marketersRes.data || []);
// // //       setAttributions(attributionsRes.data || []);

// // //       // Calculate High Level Metrics
// // //       const totalRevenue = (attributionsRes.data || []).reduce((acc, curr) => acc + Number(curr.sale_amount), 0);
// // //       const pendingComm = (attributionsRes.data || [])
// // //         .filter(attr => attr.status === "approved")
// // //         .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// // //       setStats({
// // //         totalSales: totalRevenue,
// // //         pendingPayouts: pendingComm,
// // //         activeMarketers: (marketersRes.data || []).filter(m => m.status === "active").length
// // //       });
// // //     } catch (err) {
// // //       toast.error("Referral subsystem data pipeline breakdown.");
// // //     }
// // //   };

// // //   // const generateMarketerCode = async (e) => {
// // //   //   e.preventDefault();
// // //   //   if (!newName || !newCode) return toast.error("Missing mandatory validation parameters.");

// // //   //   try {
// // //   //     const { error } = await supabase.from("marketer_profiles").insert([{
// // //   //       id: crypto.randomUUID(), // For demo; replace with actual user registration logic if linking to Auth
// // //   //       full_name: newName,
// // //   //       referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
// // //   //       commission_rate_pct: newRate
// // //   //     }]);

// // //   //     if (error) throw error;
// // //   //     toast.success("Marketer structural node activated.");
// // //   //     setNewName(""); setNewCode("");
// // //   //     fetchReferralData();
// // //   //   } catch (err) {
// // //   //     toast.error("Code collision or write fault occurred.");
// // //   //   }
// // //   // };
// // //   // Inside ReferralDashboard.js
// // // const generateMarketerCode = async (e, selectedUserId) => {
// // //   e.preventDefault();
// // //   // Pass the selectedUserId from the user dropdown
// // //   if (!selectedUserId || !newCode) return toast.error("Select a user and code.");

// // //   try {
// // //     const { error } = await supabase.from("marketer_profiles").insert([{
// // //       id: selectedUserId, // Use the real ID from your users table
// // //       full_name: newName,
// // //       referral_code: newCode.toUpperCase().replace(/\s+/g, ""),
// // //       commission_rate_pct: newRate
// // //     }]);

// // //     if (error) throw error;
// // //     toast.success("Marketer profile activated.");
// // //   } catch (err) {
// // //     toast.error("Profile creation failed: User may already be a marketer.");
// // //   }
// // // };

// // //   return (
// // //     <div className="p-6 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
      
// // //       {/* METRIC MATRIX ROW */}
// // //       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
// // //         <StatCard title="Total Code Revenue" value={`KES ${stats.totalSales.toLocaleString()}`} color="green" icon={DollarSign} />
// // //         <StatCard title="Approved Payout Pool" value={`KES ${stats.pendingPayouts.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
// // //         <StatCard title="Active Marketer Nodes" value={stats.activeMarketers} color="blue" icon={Users2} />
// // //       </div>

// // //       <div className="grid grid-cols-12 gap-8">
// // //         {/* LEFT COLUMN: REGISTRATION & ACTIVE CODES */}
// // //         <div className="col-span-12 lg:col-span-5 space-y-8">
          
// // //           {/* GENERATE CODE PANEL */}
// // //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// // //             <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
// // //               <Ticket size={16} className="text-indigo-400" /> Provision Referral Code
// // //             </h3>
// // //             <form onSubmit={generateMarketerCode} className="space-y-4">
// // //               <div>
// // //                 <label className="text-[11px] font-bold text-slate-400 block mb-1">MARKETER FULL NAME</label>
// // //                 <input value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="e.g., Jane Doe" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-sm text-white" />
// // //               </div>
// // //               <div className="grid grid-cols-2 gap-4">
// // //                 <div>
// // //                   <label className="text-[11px] font-bold text-slate-400 block mb-1">PROPOSED CODE</label>
// // //                   <input value={newCode} onChange={e => setNewCode(e.target.value)} type="text" placeholder="JANEDOE20" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-sm text-white uppercase" />
// // //                 </div>
// // //                 <div>
// // //                   <label className="text-[11px] font-bold text-slate-400 block mb-1">COMMISSION RATE (%)</label>
// // //                   <input value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder="10" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-sm text-white" />
// // //                 </div>
// // //               </div>
// // //               <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs tracking-wider uppercase text-white transition-all flex items-center justify-center gap-2">
// // //                 <Plus size={14} /> Commit Code Node
// // //               </button>
// // //             </form>
// // //           </div>

// // //           {/* MARKETER PROFILES CONTAINER */}
// // //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// // //             <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Active System Marketers</h3>
// // //             <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
// // //               {marketers.map(m => (
// // //                 <div key={m.referral_code} className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex justify-between items-center">
// // //                   <div>
// // //                     <p className="text-xs font-bold text-white">{m.full_name}</p>
// // //                     <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{m.referral_code}</p>
// // //                   </div>
// // //                   <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
// // //                     {m.commission_rate_pct}% Rate
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* RIGHT COLUMN: ATTRIBUTION LOG TRACKER */}
// // //         <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// // //           <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-800/60">
// // //             <Search size={16} className="text-emerald-400" /> Real-Time Attribution Routing Log
// // //           </h3>
// // //           <div className="space-y-3 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
// // //             {attributions.length === 0 ? (
// // //               <p className="text-xs italic text-slate-500 text-center py-12">No attribution vectors verified yet.</p>
// // //             ) : (
// // //               attributions.map(attr => (
// // //                 <div key={attr.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
// // //                   <div>
// // //                     <div className="flex items-center gap-2">
// // //                       <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] rounded font-bold">
// // //                         {attr.referral_code_used}
// // //                       </span>
// // //                       <p className="text-xs font-bold text-white">Brought in {attr.users?.full_name || "Guest conversion"}</p>
// // //                     </div>
// // //                     <p className="text-[10px] text-slate-500 mt-1">Transaction value: KES {Number(attr.sale_amount).toLocaleString()}</p>
// // //                   </div>
// // //                   <div className="text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
// // //                     <p className="text-xs font-black text-emerald-400">+KES {Number(attr.calculated_commission).toLocaleString()}</p>
// // //                     <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 mt-1 rounded border ${
// // //                       attr.status === 'paid' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-amber-950/40 border-amber-800 text-amber-400'
// // //                     }`}>
// // //                       {attr.status}
// // //                     </span>
// // //                   </div>
// // //                 </div>
// // //               ))
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }