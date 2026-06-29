
import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Award,
  Flame,
  Wallet,
  Users,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { supabase } from "../../../supabase";
import StatCard from "../../../components/StatCard";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MarketerDashboard({ currentMarketerId }) {
  const [profile, setProfile] = useState(null);
  const [myConversions, setMyConversions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentMarketerId) fetchMarketerData();
  }, [currentMarketerId]);

  const fetchMarketerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profData, error: profErr } = await supabase
        .from("marketer_profiles")
        .select("*")
        .eq("id", currentMarketerId)
        .single();

      if (profErr || !profData) throw new Error("Marketer not found");
      setProfile(profData);

      const { data: convData, error: convErr } = await supabase
        .from("referral_attributions")
        .select("*, users:lead_or_student_id(full_name)")
        .eq("marketer_id", currentMarketerId)
        .order("created_at", { ascending: false });

      if (convErr) throw convErr;
      setMyConversions(convData || []);

      const { data: leaderboardData } = await supabase
        .from("referral_attributions")
        .select("marketer_id, marketer_profiles(full_name)");

      const counts = (leaderboardData || []).reduce((acc, curr) => {
        const id = curr.marketer_id;
        const name = curr.marketer_profiles?.full_name || "Anonymous";
        if (!acc[id]) acc[id] = { name, count: 0 };
        acc[id].count++;
        return acc;
      }, {});

      setLeaderboard(Object.values(counts).slice(0, 5));
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const copyReferralLink = (code) => {
    const link = `https://www.techtalk-hub.com/book-class?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return <div className="text-center py-20 text-slate-400">Loading dashboard...</div>;

  if (!profile)
    return <div className="text-center py-20 text-red-400">Marketer not found</div>;

  const totalConversions = myConversions.length;
  const totalEarned = myConversions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + Number(c.calculated_commission || 0), 0);
  const pending = myConversions
    .filter((c) => c.status !== "paid")
    .reduce((s, c) => s + Number(c.calculated_commission || 0), 0);
  const eligible = totalConversions >= 4;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 bg-slate-950 text-white min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div>
          <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Marketer Portal</p>
          <h1 className="text-xl font-bold">{profile.full_name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => copyReferralLink(profile.referral_code)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {profile.referral_code}
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 bg-slate-800 text-rose-400 rounded-lg hover:bg-rose-900/30 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Earned" value={`KES ${totalEarned}`} icon={Wallet} />
        <StatCard title="Pending" value={`KES ${pending}`} icon={ArrowUpRight} />
        <StatCard title="Conversions" value={totalConversions} icon={Users} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-sm font-bold flex items-center gap-2">
              <Flame size={14} /> Threshold
            </p>
            <p className="text-xs text-slate-400 mt-1">{totalConversions}/4 required</p>
            <div className="h-2 bg-slate-800 rounded mt-3">
              <div
                className={`h-full ${eligible ? "bg-green-500" : "bg-indigo-500"}`}
                style={{ width: `${Math.min((totalConversions / 4) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs mt-3 text-slate-400">
              {eligible ? "Unlocked payouts" : `Need ${4 - totalConversions} more`}
            </p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="font-bold mb-3 flex items-center gap-2">
              <Award size={14} /> Top Marketers
            </p>
            {leaderboard.map((m, i) => (
              <div key={i} className="flex justify-between text-xs py-2 border-b border-slate-800 last:border-0">
                <span>{m.name}</span>
                <span>{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-bold mb-4">Conversions</h2>
          <div className="space-y-3">
            {myConversions.length === 0 ? (
              <p className="text-slate-400 text-sm">No conversions yet</p>
            ) : (
              myConversions.map((c) => (
                <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between">
                  <div>
                    <p className="text-sm font-bold">{c.users?.full_name || "User"}</p>
                    <p className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-bold text-sm">+KES {c.calculated_commission}</p>
                    <span className={`text-xs px-2 py-1 rounded ${c.status === "paid" ? "bg-green-900 text-green-400" : "bg-amber-900 text-amber-400"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import {
//   Copy,
//   Check,
//   Award,
//   Flame,
//   Wallet,
//   Users,
//   ArrowUpRight,
//   ShieldCheck,
//  LogOut, 

// } from "lucide-react";
// import { supabase } from "../../../supabase";
// import StatCard from "../../../components/StatCard";
// import toast from "react-hot-toast";

// import { useNavigate } from "react-router-dom";
// export default function MarketerDashboard({ currentMarketerId }) {
//   const [profile, setProfile] = useState(null);
//   const [myConversions, setMyConversions] = useState([]);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [copied, setCopied] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (currentMarketerId) fetchMarketerData();
//   }, [currentMarketerId]);

//   const fetchMarketerData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const { data: profData, error: profErr } = await supabase
//         .from("marketer_profiles")
//         .select("*")
//         .eq("id", currentMarketerId)
//         .single();

//       if (profErr || !profData) throw new Error("Marketer not found");
//       setProfile(profData);

//       const { data: convData, error: convErr } = await supabase
//         .from("referral_attributions")
//         .select("*, users:lead_or_student_id(full_name)")
//         .eq("marketer_id", currentMarketerId)
//         .order("created_at", { ascending: false });

//       if (convErr) throw convErr;
//       setMyConversions(convData || []);

//       const { data: leaderboardData } = await supabase
//         .from("referral_attributions")
//         .select("marketer_id, marketer_profiles(full_name)");

//       const counts = (leaderboardData || []).reduce((acc, curr) => {
//         const id = curr.marketer_id;
//         const name = curr.marketer_profiles?.full_name || "Anonymous";
//         if (!acc[id]) acc[id] = { name, count: 0 };
//         acc[id].count++;
//         return acc;
//       }, {});

//       setLeaderboard(Object.values(counts).slice(0, 5));
//     } catch (err) {
//       setError(err.message);
//       toast.error("Failed to load dashboard");
//     } finally {
//       setLoading(false);
//     }
//   };

//     const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/");
//   };

//   const copyReferralLink = (code) => {
//     const link = `https://www.techtalk-hub.com/book-class?ref=${code}`;
 
// // const link = `http://localhost:3001/book-class?ref=${code}`;
//     // const link = `${window.location.origin}/register?ref=${code}`;
//     navigator.clipboard.writeText(link);
//     setCopied(true);
//     toast.success("Referral link copied");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (loading)
//     return (
//       <div className="text-center py-20 text-slate-400">
//         Loading dashboard...
//       </div>
//     );

//   if (!profile)
//     return (
//       <div className="text-center py-20 text-red-400">
//         Marketer not found
//       </div>
//     );

//   const totalConversions = myConversions.length;

//   const totalEarned = myConversions
//     .filter((c) => c.status === "paid")
//     .reduce((s, c) => s + Number(c.calculated_commission || 0), 0);

//   const pending = myConversions
//     .filter((c) => c.status !== "paid")
//     .reduce((s, c) => s + Number(c.calculated_commission || 0), 0);

//   const eligible = totalConversions >= 4;

//   return (
//     <div className="p-6 max-w-[1400px] mx-auto space-y-8 bg-slate-950 text-white min-h-screen">

     
//       {/* HEADER */}
//       <div className="flex justify-between items-center bg-slate-900 p-5 rounded-xl border border-slate-800">
//         <div>
//           <p className="text-xs text-indigo-400 uppercase">Marketer Portal</p>
//           <h1 className="text-xl font-bold">{profile.full_name}</h1>
//         </div>

//         <button
//           onClick={() => copyReferralLink(profile.referral_code)}
//           className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg"
//         >
//           {copied ? <Check size={14} /> : <Copy size={14} />}
//           {profile.referral_code}
//         </button>
//            {/* Logout */}
//         <button 
//           onClick={handleLogout}
//           className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all"
//           title="Logout"
//         >
//           <LogOut size={20} />
//         </button>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-3 gap-4">
//         <StatCard title="Earned" value={`KES ${totalEarned}`} icon={Wallet} />
//         <StatCard title="Pending" value={`KES ${pending}`} icon={ArrowUpRight} />
//         <StatCard title="Conversions" value={totalConversions} icon={Users} />
//       </div>

//       {/* MAIN GRID */}
//       <div className="grid grid-cols-12 gap-6">

//         {/* LEFT */}
//         <div className="col-span-12 lg:col-span-4 space-y-4">

//           <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
//             <p className="text-sm font-bold flex items-center gap-2">
//               <Flame size={14} /> Threshold
//             </p>

//             <p className="text-xs text-slate-400 mt-1">
//               {totalConversions}/4 required
//             </p>

//             <div className="h-2 bg-slate-800 rounded mt-3">
//               <div
//                 className={`h-full ${
//                   eligible ? "bg-green-500" : "bg-indigo-500"
//                 }`}
//                 style={{ width: `${Math.min((totalConversions / 4) * 100, 100)}%` }}
//               />
//             </div>

//             <p className="text-xs mt-3 text-slate-400">
//               {eligible ? "Unlocked payouts" : `Need ${4 - totalConversions} more`}
//             </p>
//           </div>

//           {/* LEADERBOARD */}
//           <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
//             <p className="font-bold mb-3 flex items-center gap-2">
//               <Award size={14} /> Top Marketers
//             </p>

//             {leaderboard.map((m, i) => (
//               <div
//                 key={i}
//                 className="flex justify-between text-xs py-2 border-b border-slate-800"
//               >
//                 <span>{m.name}</span>
//                 <span>{m.count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
//           <h2 className="font-bold mb-4">Conversions</h2>

//           <div className="space-y-3">
//             {myConversions.length === 0 ? (
//               <p className="text-slate-400 text-sm">No conversions yet</p>
//             ) : (
//               myConversions.map((c) => (
//                 <div
//                   key={c.id}
//                   className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between"
//                 >
//                   <div>
//                     <p className="text-sm font-bold">
//                       {c.users?.full_name || "User"}
//                     </p>
//                     <p className="text-xs text-slate-400">
//                       {new Date(c.created_at).toLocaleDateString()}
//                     </p>
//                     <p className="text-xs text-slate-500">
//                       Sale: KES {c.sale_amount}
//                     </p>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-indigo-400 font-bold text-sm">
//                       +KES {c.calculated_commission}
//                     </p>

//                     <span
//                       className={`text-xs px-2 py-1 rounded ${
//                         c.status === "paid"
//                           ? "bg-green-900 text-green-400"
//                           : "bg-amber-900 text-amber-400"
//                       }`}
//                     >
//                       {c.status}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from "react";
// // import { Copy, Check, Award, Flame, Wallet, Users, ArrowUpRight, ShieldCheck } from "lucide-react";
// // import { supabase } from "../../../supabase";
// // import StatCard from "../../../components/StatCard";
// // import toast from "react-hot-toast";

// // export default function MarketerDashboard({ currentMarketerId }) {
// //   const [profile, setProfile] = useState(null);
// //   const [myConversions, setMyConversions] = useState([]);
// //   const [leaderboard, setLeaderboard] = useState([]);
// //   const [copied, setCopied] = useState(false);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (currentMarketerId) {
// //       fetchMarketerData();
// //     }
// //   }, [currentMarketerId]);

// //   // const fetchMarketerData = async () => {
// //   //   try {
// //   //     // 1. Fetch Marketer Profile Info
// //   //     const { data: profData, error: profErr } = await supabase
// //   //       .from("marketer_profiles")
// //   //       .select("*")
// //   //       .eq("id", currentMarketerId)
// //   //       .single();
      
// //   //     if (profErr) throw profErr;
// //   //     setProfile(profData);

// //   //     // 2. Fetch specific conversions routed through this marketer's code
// //   //     const { data: convData, error: convErr } = await supabase
// //   //       .from("referral_attributions")
// //   //       .select("*, users:lead_or_student_id(full_name)")
// //   //       .eq("marketer_id", currentMarketerId)
// //   //       .order("created_at", { ascending: false });

// //   //     if (convErr) throw convErr;
// //   //     setMyConversions(convData || []);

// //   //     // 3. Construct Leaderboard based on total count of approved/paid conversions
// //   //     const { data: leaderboardData, error: leaderErr } = await supabase
// //   //       .from("referral_attributions")
// //   //       .select("marketer_id, marketer_profiles(full_name)");

// //   //     if (leaderErr) throw leaderErr;
      
// //   //     // Group and calculate conversions per marketer dynamically
// //   //     const counts = (leaderboardData || []).reduce((acc, curr) => {
// //   //       const mId = curr.marketer_id;
// //   //       const name = curr.marketer_profiles?.full_name || "Anonymous Node";
// //   //       if (!acc[mId]) acc[mId] = { name, count: 0 };
// //   //       acc[mId].count += 1;
// //   //       return acc;
// //   //     }, {});

// //   //     const sortedLeaderboard = Object.values(counts)
// //   //       .sort((a, b) => b.count - a.count)
// //   //       .slice(0, 5); // Grab top 5 performers

// //   //     setLeaderboard(sortedLeaderboard);
// //   //   } catch (err) {
// //   //     toast.error("Pipeline failure fetching personal marketer matrices.");
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };
// //   const fetchMarketerData = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null); // Reset error state

// //       // 1. Fetch Marketer Profile - Explicit check for existence
// //       const { data: profData, error: profErr } = await supabase
// //         .from("marketer_profiles")
// //         .select("*")
// //         .eq("id", currentMarketerId)
// //         .single();
      
// //       // If error occurs OR no data returned, force an error state
// //       if (profErr || !profData) {
// //         throw new Error("Marketer profile not found in system records.");
// //       }
// //       setProfile(profData);

// //       // 2. Fetch specific conversions
// //       const { data: convData, error: convErr } = await supabase
// //         .from("referral_attributions")
// //         .select("*, users:lead_or_student_id(full_name)")
// //         .eq("marketer_id", currentMarketerId)
// //         .order("created_at", { ascending: false });

// //       if (convErr) throw convErr;
// //       setMyConversions(convData || []);

// //       // 3. Construct Leaderboard
// //       const { data: leaderboardData, error: leaderErr } = await supabase
// //         .from("referral_attributions")
// //         .select("marketer_id, marketer_profiles(full_name)");

// //       if (leaderErr) throw leaderErr;
      
// //       const counts = (leaderboardData || []).reduce((acc, curr) => {
// //         const mId = curr.marketer_id;
// //         const name = curr.marketer_profiles?.full_name || "Anonymous Node";
// //         if (!acc[mId]) acc[mId] = { name, count: 0 };
// //         acc[mId].count += 1;
// //         return acc;
// //       }, {});

// //       const sortedLeaderboard = Object.values(counts)
// //         .sort((a, b) => b.count - a.count)
// //         .slice(0, 5);

// //       setLeaderboard(sortedLeaderboard);
// //     } catch (err) {
// //       console.error("Pipeline failure:", err);
// //       setError(err.message);
// //       toast.error("Data pipeline error: Unable to load marketer matrices.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const copyReferralLink = (code) => {
// //     // Generates a link targeting your main registration landing page
// //     const shareUrl = `${window.location.origin}/register?ref=${code}`;
// //     navigator.clipboard.writeText(shareUrl);
// //     setCopied(true);
// //     toast.success("Referral routing target written to clipboard.");
// //     setTimeout(() => setCopied(false), 2000);
// //   };

// //   if (loading) return <div className="text-center py-20 text-xs font-mono tracking-widest text-slate-500">SYNCHRONIZING PROFILE VECTORS...</div>;
// //   if (!profile) return <div className="text-center py-20 text-xs font-mono text-red-400">MARKETER AUTH MATRIX UNRESOLVED.</div>;

// //   // Compensation threshold verification logic (4 conversions mandatory before payouts)
// //   const totalConversionsCount = myConversions.length;
// //   const eligibleForPayouts = totalConversionsCount >= 4;
  
// //   const totalEarned = myConversions
// //     .filter(c => c.status === "paid")
// //     .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// //   const pendingApproval = myConversions
// //     .filter(c => c.status === "approved" || c.status === "pending_review")
// //     .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// //   return (
// //     <div className="p-6 max-w-[1600px] mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
      
// //       {/* HEADER ROW PROFILE METRICS */}
// //       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[24px]">
// //         <div>
// //           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400 block mb-1">PRO-MARKETER PORTAL</span>
// //           <h2 className="text-xl font-black text-white">{profile.full_name}</h2>
// //         </div>
        
// //         {/* LINK SHARE ACTION BOX */}
// //         <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 justify-between sm:justify-start">
// //           <div className="pl-2">
// //             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">YOUR REFERRAL LINK</p>
// //             <p className="text-xs font-mono font-bold text-indigo-400">{profile.referral_code}</p>
// //           </div>
// //           <button 
// //             onClick={() => copyReferralLink(profile.referral_code)}
// //             className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-all active:scale-95"
// //           >
// //             {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
// //           </button>
// //         </div>
// //       </div>

// //       {/* REVENUE MATRIX ROW */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
// //         <StatCard title="Cleared Disbursed Funds" value={`KES ${totalEarned.toLocaleString()}`} color="green" icon={Wallet} />
// //         <StatCard title="Pipeline Processing" value={`KES ${pendingApproval.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
// //         <StatCard title="Total Client Conversions" value={`${totalConversionsCount} Signups`} color="blue" icon={Users} />
// //       </div>
// // <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //   <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
// //     <p className="text-[10px] text-slate-400">Total Revenue</p>
// //     <p className="text-lg font-bold text-white">
// //       KES {myConversions.reduce((s, c) => s + Number(c.sale_amount || 0), 0).toLocaleString()}
// //     </p>
// //   </div>

// //   <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
// //     <p className="text-[10px] text-slate-400">Avg Commission</p>
// //     <p className="text-lg font-bold text-indigo-400">
// //       KES {(myConversions.reduce((s, c) => s + Number(c.calculated_commission || 0), 0) / (myConversions.length || 1)).toFixed(0)}
// //     </p>
// //   </div>

// //   <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
// //     <p className="text-[10px] text-slate-400">Pending Deals</p>
// //     <p className="text-lg font-bold text-amber-400">
// //       {myConversions.filter(c => c.status !== "paid").length}
// //     </p>
// //   </div>

// //   <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
// //     <p className="text-[10px] text-slate-400">Conversion Rate</p>
// //     <p className="text-lg font-bold text-emerald-400">
// //       {myConversions.length > 0 ? "Active" : "0%"}
// //     </p>
// //   </div>
// // </div>
// //       {/* TRACKING AND BONUS STRUCTURE GRID */}
// //       <div className="grid grid-cols-12 gap-8">
        
// //         {/* LEFT COMPONENT: THRESHOLD MILESTONES & LEADERS */}
// //         <div className="col-span-12 lg:col-span-5 space-y-8">
          
// //           {/* COMPENSATION TARGET PROGRESS */}
// //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl relative overflow-hidden">
// //             <div className="flex justify-between items-start mb-4">
// //               <div>
// //                 <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
// //                   <Flame size={16} className="text-amber-500" /> Compensation Threshold Status
// //                 </h3>
// //                 <p className="text-[11px] text-slate-400 mt-1">4 secured clients required to activate payouts</p>
// //               </div>
// //               {eligibleForPayouts ? (
// //                 <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-1 rounded-md">
// //                   <ShieldCheck size={12} /> ACTIVE
// //                 </span>
// //               ) : (
// //                 <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800 px-2 py-1 rounded-md">
// //                   LOCKED
// //                 </span>
// //               )}
// //             </div>

// //             {/* PROGRESS BAR TRACKING */}
// //             <div className="space-y-2 mt-6">
// //               <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800/80">
// //                 <div 
// //                   className={`h-full rounded-full transition-all duration-500 ${eligibleForPayouts ? 'bg-emerald-500' : 'bg-indigo-500'}`}
// //                   style={{ width: `${Math.min((totalConversionsCount / 4) * 100, 100)}%` }}
// //                 />
// //               </div>
// //               <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
// //                 <span>0 Conversions</span>
// //                 <span className="font-bold text-white">{totalConversionsCount} / 4 Achieved</span>
// //                 <span>Base Target</span>
// //               </div>
// //             </div>

// //             {!eligibleForPayouts && (
// //               <div className="mt-4 p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
// //                 Bring in <strong className="text-amber-400 font-bold">{4 - totalConversionsCount} more</strong> verified customer profiles to clear validation hurdles and trigger your accumulated commission ledger.
// //               </div>
// //             )}
// //           </div>

// //           {/* INTERNAL SYSTEM LEADERBOARD */}
// //           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// //             <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
// //               <Award size={16} className="text-indigo-400" /> Strategic Top Performers
// //             </h3>
// //             <div className="space-y-2">
// //               {leaderboard.map((item, index) => (
// //                 <div key={index} className="p-3 bg-slate-950 border border-slate-800/40 rounded-xl flex justify-between items-center">
// //                   <div className="flex items-center gap-3">
// //                     <span className={`w-5 h-5 flex items-center justify-center font-mono text-[10px] rounded font-bold ${
// //                       index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-400'
// //                     }`}>
// //                       {index + 1}
// //                     </span>
// //                     <p className="text-xs font-semibold text-slate-200">{item.name}</p>
// //                   </div>
// //                   <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
// //                     {item.count} conversions
// //                   </span>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         {/* RIGHT COMPONENT: CONVERSION STREAM TRACKER */}
// //         <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-xl">
// //           <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 pb-3 border-b border-slate-800/60">
// //             Personal Conversion Ledger
// //           </h3>
// //           <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
// //             {myConversions.length === 0 ? (
// //               <p className="text-xs italic text-slate-500 text-center py-16">No tracked link resolutions verified yet.</p>
// //             ) : (
// //               myConversions.map(conv => (
// //                 <div key={conv.id} className="p-4 bg-slate-950 border border-slate-800/60 rounded-xl flex justify-between items-center">
// //                   <div>
// //                     <p className="text-xs font-bold text-white">{conv.users?.full_name || "Enrolled Student"}</p>
// //                     <p className="text-[10px] font-mono text-slate-500 mt-1">
// //                       Processed: {new Date(conv.created_at).toLocaleDateString("en-KE")}
// //                     </p>
// //                   </div>
// //                   <div className="text-right">
// //                     <p className="text-xs font-black text-indigo-400">
// //                       +KES {Number(conv.calculated_commission).toLocaleString()}
// //                     </p>
// //                     <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 mt-1.5 inline-block rounded border ${
// //                       conv.status === 'paid' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
// //                     }`}>
// //                       {conv.status === 'paid' ? 'Disbursed' : 'In Review'}
// //                     </span>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //           </div>
// //         </div>

// //       </div>
// //     </div>
// //   );
// // }
// // // import React, { useState, useEffect } from "react";
// // // import { Copy, Check, Award, Flame, Wallet, Users, ArrowUpRight, ShieldCheck, Sun, Moon } from "lucide-react";
// // // import { supabase } from "../../supabase";
// // // import StatCard from "../../components/StatCard";
// // // import toast from "react-hot-toast";

// // // export default function MarketerDashboard({ currentMarketerId }) {
// // //   const [profile, setProfile] = useState(null);
// // //   const [myConversions, setMyConversions] = useState([]);
// // //   const [leaderboard, setLeaderboard] = useState([]);
// // //   const [copied, setCopied] = useState(false);
// // //   const [loading, setLoading] = useState(true);
// // //   const [darkMode, setDarkMode] = useState(true);

// // //   useEffect(() => {
// // //     if (currentMarketerId) {
// // //       fetchMarketerData();
// // //     }
// // //   }, [currentMarketerId]);

// // //   const fetchMarketerData = async () => {
// // //     try {
// // //       // 1. Fetch Marketer Profile Info
// // //       const { data: profData, error: profErr } = await supabase
// // //         .from("marketer_profiles")
// // //         .select("*")
// // //         .eq("id", currentMarketerId)
// // //         .single();
      
// // //       if (profErr) throw profErr;
// // //       setProfile(profData);

// // //       // 2. Fetch specific conversions routed through this marketer's code
// // //       const { data: convData, error: convErr } = await supabase
// // //         .from("referral_attributions")
// // //         .select("*, users:lead_or_student_id(full_name)")
// // //         .eq("marketer_id", currentMarketerId)
// // //         .order("created_at", { ascending: false });

// // //       if (convErr) throw convErr;
// // //       setMyConversions(convData || []);

// // //       // 3. Construct Leaderboard based on total count of conversions (Limited to 100 rows for memory safety)
// // //       const { data: leaderboardData, error: leaderErr } = await supabase
// // //         .from("referral_attributions")
// // //         .select("marketer_id, marketer_profiles(full_name)")
// // //         .limit(100);

// // //       if (leaderErr) throw leaderErr;
      
// // //       // Group and calculate conversions per marketer dynamically
// // //       const counts = (leaderboardData || []).reduce((acc, curr) => {
// // //         const mId = curr.marketer_id;
// // //         const name = curr.marketer_profiles?.full_name || "Anonymous Node";
// // //         if (!acc[mId]) acc[mId] = { name, count: 0 };
// // //         acc[mId].count += 1;
// // //         return acc;
// // //       }, {});

// // //       const sortedLeaderboard = Object.values(counts)
// // //         .sort((a, b) => b.count - a.count)
// // //         .slice(0, 5); // Grab top 5 performers

// // //       setLeaderboard(sortedLeaderboard);
// // //     } catch (err) {
// // //       toast.error("Pipeline failure fetching personal marketer matrices.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const copyReferralLink = (code) => {
// // //     // Modify URL base layout path here if landing/registration systems live on alternative origins
// // //     const registrationBaseUrl = window.location.origin;
// // //     const shareUrl = `${registrationBaseUrl}/register?ref=${code}`;
// // //     navigator.clipboard.writeText(shareUrl);
// // //     setCopied(true);
// // //     toast.success("Referral routing target written to clipboard.");
// // //     setTimeout(() => setCopied(false), 2000);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className={`text-center py-20 text-xs font-mono tracking-widest min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950 text-slate-500" : "bg-slate-50 text-slate-400"}`}>
// // //         SYNCHRONIZING PROFILE VECTORS...
// // //       </div>
// // //     );
// // //   }
  
// // //   if (!profile) {
// // //     return (
// // //       <div className={`text-center py-20 text-xs font-mono min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950 text-rose-400" : "bg-slate-50 text-rose-600"}`}>
// // //         MARKETER AUTH MATRIX UNRESOLVED.
// // //       </div>
// // //     );
// // //   }

// // //   // Compensation threshold verification logic (4 conversions mandatory before payouts)
// // //   const totalConversionsCount = myConversions.length;
// // //   const eligibleForPayouts = totalConversionsCount >= 4;
  
// // //   const totalEarned = myConversions
// // //     .filter(c => c.status === "paid")
// // //     .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// // //   const pendingApproval = myConversions
// // //     .filter(c => c.status === "approved" || c.status === "pending_review")
// // //     .reduce((acc, curr) => acc + Number(curr.calculated_commission), 0);

// // //   return (
// // //     <div className={`p-6 max-w-[1600px] mx-auto space-y-8 min-h-screen font-sans transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
// // //       {/* HEADER ROW PROFILE METRICS */}
// // //       <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 border p-6 rounded-[24px] ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
// // //         <div className="flex justify-between items-start w-full sm:w-auto">
// // //           <div>
// // //             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-500 dark:text-indigo-400 block mb-1">PRO-MARKETER PORTAL</span>
// // //             <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{profile.full_name}</h2>
// // //           </div>
// // //         </div>
        
// // //         {/* LIGHT / DARK ENGINE TOGGLE & LINK SHARE ACTION BOX */}
// // //         <div className="flex items-center gap-3 self-end sm:self-auto">
// // //           <button 
// // //             onClick={() => setDarkMode(!darkMode)} 
// // //             className={`p-2.5 border rounded-xl transition-all active:scale-95 ${darkMode ? "bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"}`}
// // //             title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
// // //           >
// // //             {darkMode ? <Sun size={15} /> : <Moon size={15} />}
// // //           </button>

// // //           <div className={`border p-2.5 rounded-xl flex items-center gap-3 justify-between ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
// // //             <div className="pl-2">
// // //               <p className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>YOUR REFERRAL LINK</p>
// // //               <p className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">{profile.referral_code}</p>
// // //             </div>
// // //             <button 
// // //               onClick={() => copyReferralLink(profile.referral_code)}
// // //               className={`p-2.5 border rounded-lg transition-all active:scale-95 ${darkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"}`}
// // //             >
// // //               {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* REVENUE MATRIX ROW */}
// // //       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
// // //         <StatCard title="Cleared Disbursed Funds" value={`KES ${totalEarned.toLocaleString()}`} color="green" icon={Wallet} />
// // //         <StatCard title="Pipeline Processing" value={`KES ${pendingApproval.toLocaleString()}`} color="amber" icon={ArrowUpRight} />
// // //         <StatCard title="Total Client Conversions" value={`${totalConversionsCount} Signups`} color="blue" icon={Users} />
// // //       </div>

// // //       {/* TRACKING AND BONUS STRUCTURE GRID */}
// // //       <div className="grid grid-cols-12 gap-8">
        
// // //         {/* LEFT COMPONENT: THRESHOLD MILESTONES & LEADERS */}
// // //         <div className="col-span-12 lg:col-span-5 space-y-8">
          
// // //           {/* COMPENSATION TARGET PROGRESS */}
// // //           <div className={`border p-6 rounded-[24px] shadow-xl relative overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"}`}>
// // //             <div className="flex justify-between items-start mb-4">
// // //               <div>
// // //                 <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
// // //                   <Flame size={16} className="text-amber-500" /> Compensation Threshold Status
// // //                 </h3>
// // //                 <p className={`text-[11px] mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>4 secured clients required to activate payouts</p>
// // //               </div>
// // //               {eligibleForPayouts ? (
// // //                 <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-800 px-2 py-1 rounded-md">
// // //                   <ShieldCheck size={12} /> ACTIVE
// // //                 </span>
// // //               ) : (
// // //                 <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 dark:border-amber-800 px-2 py-1 rounded-md">
// // //                   LOCKED
// // //                 </span>
// // //               )}
// // //             </div>

// // //             {/* PROGRESS BAR TRACKING */}
// // //             <div className="space-y-2 mt-6">
// // //               <div className={`w-full rounded-full h-2.5 border ${darkMode ? "bg-slate-950 border-slate-800/80" : "bg-slate-100 border-slate-200"}`}>
// // //                 <div 
// // //                   className={`h-full rounded-full transition-all duration-500 ${eligibleForPayouts ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
// // //                   style={{ width: `${Math.min((totalConversionsCount / 4) * 100, 100)}%` }}
// // //                 />
// // //               </div>
// // //               <div className={`flex justify-between text-[10px] font-mono pt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
// // //                 <span>0 Conversions</span>
// // //                 <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{totalConversionsCount} / 4 Achieved</span>
// // //                 <span>Base Target</span>
// // //               </div>
// // //             </div>

// // //             {!eligibleForPayouts && (
// // //               <div className={`mt-4 p-3 border border-dashed rounded-xl text-[11px] leading-relaxed ${darkMode ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
// // //                 Bring in <strong className="text-amber-600 dark:text-amber-400 font-bold">{4 - totalConversionsCount} more</strong> verified customer profiles to clear validation hurdles and trigger your accumulated commission ledger.
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* INTERNAL SYSTEM LEADERBOARD */}
// // //           <div className={`border p-6 rounded-[24px] shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"}`}>
// // //             <h3 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
// // //               <Award size={16} className="text-indigo-500 dark:text-indigo-400" /> Strategic Top Performers
// // //             </h3>
// // //             <div className="space-y-2">
// // //               {leaderboard.map((item, index) => (
// // //                 <div key={index} className={`p-3 border rounded-xl flex justify-between items-center ${darkMode ? "bg-slate-950 border-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
// // //                   <div className="flex items-center gap-3">
// // //                     <span className={`w-5 h-5 flex items-center justify-center font-mono text-[10px] rounded font-bold ${
// // //                       index === 0 
// // //                         ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
// // //                         : (darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-600')
// // //                     }`}>
// // //                       {index + 1}
// // //                     </span>
// // //                     <p className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item.name}</p>
// // //                   </div>
// // //                   <span className={`text-[10px] font-mono px-2 py-0.5 border rounded ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}>
// // //                     {item.count} conversions
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* RIGHT COMPONENT: CONVERSION STREAM TRACKER */}
// // //         <div className={`col-span-12 lg:col-span-7 border p-6 rounded-[24px] shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"}`}>
// // //           <h3 className={`text-sm font-black uppercase tracking-wider mb-4 pb-3 border-b ${darkMode ? "text-white border-slate-800/60" : "text-slate-900 border-slate-100"}`}>
// // //             Personal Conversion Ledger
// // //           </h3>
// // //           <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
// // //             {myConversions.length === 0 ? (
// // //               <p className="text-xs italic text-slate-500 text-center py-16">No tracked link resolutions verified yet.</p>
// // //             ) : (
// // //               myConversions.map(conv => (
// // //                 <div key={conv.id} className={`p-4 border rounded-xl flex justify-between items-center ${darkMode ? "bg-slate-950 border-slate-800/60" : "bg-slate-50 border-slate-200/60"}`}>
// // //                   <div>
// // //                     <p className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{conv.users?.full_name || "Enrolled Student"}</p>
// // //                     <p className={`text-[10px] font-mono mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
// // //                       Processed: {new Date(conv.created_at).toLocaleDateString("en-KE")}
// // //                     </p>
// // //                   </div>
// // //                   <div className="text-right">
// // //                     <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
// // //                       +KES {Number(conv.calculated_commission).toLocaleString()}
// // //                     </p>
// // //                     <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 mt-1.5 inline-block rounded border ${
// // //                       conv.status === 'paid' 
// // //                         ? 'bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
// // //                         : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-600')
// // //                     }`}>
// // //                       {conv.status === 'paid' ? 'Disbursed' : 'In Review'}
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