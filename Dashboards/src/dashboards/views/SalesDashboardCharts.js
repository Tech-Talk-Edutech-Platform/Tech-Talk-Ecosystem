// Make per agent per country using the link
// https://chatgpt.com/share/698affad-7f20-8011-bc6f-98cabffa9e81
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import Loading from "./Loading";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

const RANGES = {
  week: { label: "Last 7 Days", points: 7, unit: "day" },
  month: { label: "Last 30 Days", points: 30, unit: "day" },
  year: { label: "Last 12 Months", points: 12, unit: "month" }
};

export default function SalesDashboardCharts() {
  const [range, setRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const config = RANGES[range];
      const rows = [];

      for (let i = config.points - 1; i >= 0; i--) {
        const d = new Date();

        if (config.unit === "day") {
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
        } else {
          d.setMonth(d.getMonth() - i, 1);
          d.setHours(0, 0, 0, 0);
        }

        const start = d.toISOString();
        const end = new Date(d);
        config.unit === "day"
          ? end.setHours(23, 59, 59, 999)
          : end.setMonth(end.getMonth() + 1, 0);
        const endISO = end.toISOString();

        const [{ data: calls }, { data: followups }, { data: leads }] =
          await Promise.all([
            supabase.rpc("calls_count", { from_date: start, to_date: endISO }),
            supabase.rpc("followup_completion_rate", { from_date: start, to_date: endISO }),
            supabase.rpc("leads_progressed", { from_date: start, to_date: endISO })
          ]);

        rows.push({
          date:
            config.unit === "month"
              ? d.toLocaleString("default", { month: "short", year: "numeric" })
              : d.toLocaleDateString(),
          calls: calls || 0,
          followupsCompleted: followups?.[0]?.completed || 0,
          followupsDue: followups?.[0]?.due || 0,
          leadsConverted: leads || 0
        });
      }

      setChartData(rows);
      setLoading(false);
    };

    fetchData();
  }, [range]);

  if (loading) return <Loading label="Loading Chart Data..." />;

  return (
    <div className="p-6 space-y-6">
      
      {/* RANGE SWITCH */}
      <div className="flex gap-2">
        {Object.keys(RANGES).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
              range === r
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calls */}
        <ChartCard title={`Calls – ${RANGES[range].label}`}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        {/* Follow-ups */}
        <ChartCard title={`Follow-ups – ${RANGES[range].label}`}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="followupsCompleted" fill="#10b981" />
            <Bar dataKey="followupsDue" fill="#f59e0b" />
          </BarChart>
        </ChartCard>

        {/* Leads */}
        <ChartCard title={`Leads Converted – ${RANGES[range].label}`} wide>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="leadsConverted" stroke="#14b8a6" strokeWidth={2} />
          </LineChart>
        </ChartCard>
      </div>
    </div>
  );
}

/* Small helper */
const ChartCard = ({ title, children, wide }) => (
  <div className={`bg-white p-4 rounded-xl shadow ${wide ? "md:col-span-2" : ""}`}>
    <h3 className="font-bold text-gray-700 mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      {children}
    </ResponsiveContainer>
  </div>
);

// // SalesDashboardCharts.js
// import React, { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import Loading from "./Loading";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar,
//   ResponsiveContainer
// } from "recharts";

// export default function SalesDashboardCharts() {
//   const [loading, setLoading] = useState(true);
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);

//       // Fetch call counts per day last 7 days
//       const days = [];
//       for (let i = 6; i >= 0; i--) {
//         const d = new Date();
//         d.setDate(d.getDate() - i);
//         d.setHours(0, 0, 0, 0);
//         const start = d.toISOString();
//         const endD = new Date(d);
//         endD.setHours(23, 59, 59, 999);
//         const end = endD.toISOString();

//         const calls = await supabase.rpc("calls_count", { from_date: start, to_date: end });
//         const followups = await supabase.rpc("followup_completion_rate", { from_date: start, to_date: end });
//         const leads = await supabase.rpc("leads_progressed", { from_date: start, to_date: end });

//         days.push({
//           date: d.toLocaleDateString(),
//           calls: calls.data || 0,
//           followupsCompleted: followups.data?.[0]?.completed || 0,
//           followupsDue: followups.data?.[0]?.due || 0,
//           leadsConverted: leads.data || 0,
//         });
//       }

//       setChartData(days);
//       setLoading(false);
//     };

//     fetchData();
//   }, []);

//   if (loading) return <Loading label="Loading Chart Data..." />;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
//       {/* Calls Trend */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-bold text-gray-700 mb-2">Calls Last 7 Days</h3>
//         <ResponsiveContainer width="100%" height={250}>
//           <LineChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Follow-ups Completed vs Due */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-bold text-gray-700 mb-2">Follow-ups Last 7 Days</h3>
//         <ResponsiveContainer width="100%" height={250}>
//           <BarChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="followupsCompleted" fill="#10b981" />
//             <Bar dataKey="followupsDue" fill="#f59e0b" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Leads Converted Trend */}
//       <div className="bg-white p-4 rounded-xl shadow md:col-span-2">
//         <h3 className="font-bold text-gray-700 mb-2">Leads Converted Last 7 Days</h3>
//         <ResponsiveContainer width="100%" height={250}>
//           <LineChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="leadsConverted" stroke="#14b8a6" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
