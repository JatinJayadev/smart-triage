/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
);

function Dashboard() {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    const res = await axios.get("https://smart-triage.onrender.com/api/triage");
    setData(res.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) {
    return (
      <div className='bg-white border rounded-xl p-10 text-center'>
        Loading dashboard...
      </div>
    );
  }

  /* ---------------- KPI DATA ---------------- */
  const riskChartData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [data.highRisk, data.mediumRisk, data.lowRisk],
        backgroundColor: ["#dc2626", "#f59e0b", "#16a34a"],
      },
    ],
  };

  const departmentChartData = {
    labels: Object.keys(data.departmentStats),
    datasets: [
      {
        label: "Patients",
        data: Object.values(data.departmentStats),
        backgroundColor: "#1e293b",
      },
    ],
  };

  /* -------- Severity Trend (Last 7 Days) -------- */
  const last7 = data.patients
    .slice(0, 50)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const trendLabels = last7.map((p) =>
    new Date(p.createdAt).toLocaleDateString(),
  );

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Severity Score",
        data: last7.map((p) => p.severityScore),
        borderColor: "#1e293b",
        backgroundColor: "rgba(30,41,59,0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className='space-y-10'>
      {/* ================= KPI CARDS ================= */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'>
        <Kpi title='Total Patients' value={data.totalPatients} />
        <Kpi title='High Risk' value={data.highRisk} color='red' />
        <Kpi title='Medium Risk' value={data.mediumRisk} color='amber' />
        <Kpi title='Low Risk' value={data.lowRisk} color='green' />
        <Kpi title='Unstable' value={data.unstableCount} color='red' />
        <Kpi title='Avg Severity' value={data.avgSeverity} />
      </div>

      {/* ================= CHART ROW ================= */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white border rounded-xl p-6 shadow-sm'>
          <h2 className='text-lg font-semibold mb-4'>Risk Distribution</h2>
          <Doughnut data={riskChartData} />
        </div>

        <div className='bg-white border rounded-xl p-6 shadow-sm'>
          <h2 className='text-lg font-semibold mb-4'>Department Load</h2>
          <Bar data={departmentChartData} />
        </div>
      </div>

      {/* ================= SEVERITY TREND ================= */}
      <div className='bg-white border rounded-xl p-6 shadow-sm'>
        <h2 className='text-lg font-semibold mb-4'>Severity Trend (Recent)</h2>
        <Line data={trendData} />
      </div>

      {/* ================= RECENT TABLE ================= */}
      <div className='bg-white border rounded-xl p-6 shadow-sm overflow-x-auto'>
        <h2 className='text-lg font-semibold mb-6'>Recent Assessments</h2>

        <table className='w-full text-sm'>
          <thead className='text-left border-b'>
            <tr>
              <th className='pb-2'>Name</th>
              <th>Risk</th>
              <th>Priority</th>
              <th>Severity</th>
              <th>Dept</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.patients.slice(0, 10).map((p) => (
              <tr key={p._id} className='border-b'>
                <td className='py-2'>{p.name || "N/A"}</td>
                <td>{p.riskLevel}</td>
                <td>{p.triagePriority}</td>
                <td>{p.severityScore}</td>
                <td>{p.departmentPrimary}</td>
                <td>{Math.round(p.confidence * 100)}%</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Kpi = ({ title, value, color }) => (
  <div className='bg-white border rounded-xl p-6 shadow-sm'>
    <p className='text-xs uppercase text-slate-500 mb-2'>{title}</p>
    <div
      className={`text-2xl font-bold ${
        color === "red"
          ? "text-red-600"
          : color === "green"
            ? "text-green-600"
            : color === "amber"
              ? "text-amber-500"
              : "text-slate-900"
      }`}
    >
      {value}
    </div>
  </div>
);

export default Dashboard;
