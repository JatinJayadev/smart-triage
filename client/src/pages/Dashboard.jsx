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
    try {
      const res = await axios.get("http://localhost:5000/api/triage");
      setData(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
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

  /* ================= CHART OPTIONS ================= */

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  /* ================= RISK CHART ================= */

  const riskChartData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [data.highRisk || 0, data.mediumRisk || 0, data.lowRisk || 0],
        backgroundColor: ["#dc2626", "#f59e0b", "#16a34a"],
      },
    ],
  };

  /* ================= PRIMARY DEPARTMENT ================= */

  const departmentChartData = {
    labels: Object.keys(data.departmentStats || {}),
    datasets: [
      {
        label: "Patients",
        data: Object.values(data.departmentStats || {}),
        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
          "#be123c",
          "#15803d",
          "#9333ea",
          "#0f766e",
        ],
      },
    ],
  };

  /* ================= SECONDARY DEPARTMENT ================= */

  const secondaryDepartmentChartData = {
    labels: Object.keys(data.departmentSecondaryStats || {}),
    datasets: [
      {
        label: "Referrals",
        data: Object.values(data.departmentSecondaryStats || {}),
        backgroundColor: "#64748b",
      },
    ],
  };

  /* ================= SEVERITY TREND ================= */

  const trendData = {
    labels: (data.severityTrend || []).map((t) => t.date),
    datasets: [
      {
        label: "Avg Severity",
        data: (data.severityTrend || []).map((t) => Number(t.avgSeverity)),
        borderColor: "#1e293b",
        backgroundColor: "rgba(30,41,59,0.15)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className='max-w-7xl mx-auto space-y-10'>
      {/* ================= KPI CARDS ================= */}

      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'>
        <Kpi title='Total Patients' value={data.totalPatients} />
        <Kpi title='High Risk' value={data.highRisk} color='red' />
        <Kpi title='Medium Risk' value={data.mediumRisk} color='amber' />
        <Kpi title='Low Risk' value={data.lowRisk} color='green' />
        <Kpi title='Unstable' value={data.unstableCount} color='red' />
        <Kpi title='Avg Severity' value={data.avgSeverity} />
      </div>

      {/* ================= DEPARTMENT SUMMARY ================= */}

      <div>
        <h2 className='text-lg font-semibold mb-4'>Department Overview</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {Object.entries(data.departmentStats || {}).map(([dept, count]) => (
            <div
              key={dept}
              className='bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition'
            >
              <p className='text-xs text-slate-500'>{dept}</p>
              <p className='text-xl font-bold text-slate-900'>{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CHART GRID ================= */}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Risk */}
        <div className='bg-white border rounded-xl p-6 shadow-sm h-[320px]'>
          <h2 className='text-lg font-semibold mb-4'>Risk Distribution</h2>
          <Doughnut data={riskChartData} options={baseChartOptions} />
        </div>

        {/* Primary Dept */}
        <div className='bg-white border rounded-xl p-6 shadow-sm h-[320px]'>
          <h2 className='text-lg font-semibold mb-4'>
            Primary Department Load
          </h2>
          <Bar data={departmentChartData} options={baseChartOptions} />
        </div>

        {/* Secondary Dept */}
        {Object.keys(data.departmentSecondaryStats || {}).length > 0 && (
          <div className='bg-white border rounded-xl p-6 shadow-sm h-[320px]'>
            <h2 className='text-lg font-semibold mb-4'>Secondary Referrals</h2>
            <Bar
              data={secondaryDepartmentChartData}
              options={baseChartOptions}
            />
          </div>
        )}

        {/* Trend */}
        <div className='bg-white border rounded-xl p-6 shadow-sm h-[350px]'>
          <h2 className='text-lg font-semibold mb-4'>7-Day Severity Trend</h2>
          <Line data={trendData} options={baseChartOptions} />
        </div>
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
              <th>Department</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {data.patients.slice(0, 10).map((p) => (
              <tr key={p._id} className='border-b hover:bg-slate-50'>
                <td className='py-2'>{p.name || "N/A"}</td>
                <td>{p.riskLevel}</td>
                <td>{p.triagePriority}</td>
                <td>{p.severityScore}</td>

                <td>
                  <div className='font-medium'>{p.departmentPrimary}</div>
                  {p.departmentSecondary && (
                    <div className='text-xs text-slate-500'>
                      → {p.departmentSecondary}
                    </div>
                  )}
                </td>

                <td>{Math.round((p.confidence || 0) * 100)}%</td>

                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= KPI COMPONENT ================= */

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
