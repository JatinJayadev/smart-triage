import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data, navigate]);

  if (!data) return null;

  const {
    riskLevel,
    triagePriority,
    severityScore = 0,
    vitalStatus,
    departmentPrimary,
    departmentSecondary,
    contributingFactors = [],
    recommendations = [],
    confidence = 0,
  } = data;

  const confidencePercent = Math.round(confidence * 100);

  // const getRiskClass = (level) => {
  //   switch (level) {
  //     case "High":
  //       return "risk-high";
  //     case "Medium":
  //       return "risk-medium";
  //     case "Low":
  //       return "risk-low";
  //     default:
  //       return "risk-default";
  //   }
  // };

  // const getPriorityClass = (priority) => {
  //   switch (priority) {
  //     case "Immediate":
  //       return "priority-immediate";
  //     case "Urgent":
  //       return "priority-urgent";
  //     case "Routine":
  //       return "priority-routine";
  //     default:
  //       return "";
  //   }
  // };

  return (
    <div className='min-h-screen bg-slate-100 py-10 px-6'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* TOP HEADER BAR */}
        <div className='bg-white border rounded-xl p-6 shadow-sm flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900'>
              Clinical Triage Report
            </h1>
            <p className='text-sm text-slate-500 mt-1'>
              AI-Assisted Emergency Risk Stratification
            </p>
          </div>

          <div className='flex gap-4 items-center'>
            {/* Priority Badge */}
            <div
              className={`
            px-4 py-2 rounded-lg text-sm font-semibold
            ${triagePriority === "Immediate" && "bg-red-100 text-red-700 border border-red-300"}
            ${triagePriority === "Urgent" && "bg-amber-100 text-amber-700 border border-amber-300"}
            ${triagePriority === "Routine" && "bg-green-100 text-green-700 border border-green-300"}
          `}
            >
              {triagePriority} Priority
            </div>

            {/* Risk Badge */}
            <div
              className={`
            px-4 py-2 rounded-lg text-sm font-semibold
            ${riskLevel === "High" && "bg-red-600 text-white"}
            ${riskLevel === "Medium" && "bg-amber-500 text-white"}
            ${riskLevel === "Low" && "bg-green-600 text-white"}
          `}
            >
              {riskLevel} Risk
            </div>
          </div>
        </div>

        {/* SEVERITY SECTION */}
        <div className='bg-white border rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4'>
            Severity Score
          </h2>

          <div className='w-full bg-slate-200 rounded-full h-4 overflow-hidden'>
            <div
              className={`
              h-full transition-all duration-500
              ${riskLevel === "High" && "bg-red-600"}
              ${riskLevel === "Medium" && "bg-amber-500"}
              ${riskLevel === "Low" && "bg-green-600"}
            `}
              style={{ width: `${severityScore}%` }}
            />
          </div>

          <div className='mt-3 text-lg font-semibold text-slate-800'>
            {severityScore}/100
          </div>
        </div>

        {/* METRICS GRID */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Vital Stability */}
          <div className='bg-white border rounded-xl p-6 shadow-sm'>
            <p className='text-xs text-slate-500 uppercase mb-2'>
              Vital Stability
            </p>
            <div
              className={`text-xl font-bold ${
                vitalStatus === "Unstable" ? "text-red-600" : "text-green-600"
              }`}
            >
              {vitalStatus}
            </div>
          </div>

          {/* AI Confidence */}
          <div className='bg-white border rounded-xl p-6 shadow-sm'>
            <p className='text-xs text-slate-500 uppercase mb-2'>
              AI Confidence
            </p>
            <div className='text-xl font-bold text-slate-800'>
              {confidencePercent}%
            </div>
          </div>

          {/* Primary Department */}
          <div className='bg-white border rounded-xl p-6 shadow-sm'>
            <p className='text-xs text-slate-500 uppercase mb-2'>
              Assigned Department
            </p>
            <div className='text-lg font-semibold text-slate-800'>
              {departmentPrimary}
            </div>
            {departmentSecondary && (
              <div className='text-sm text-slate-500 mt-1'>
                Secondary: {departmentSecondary}
              </div>
            )}
          </div>
        </div>

        {/* CLINICAL FACTORS */}
        <div className='bg-white border rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4'>
            Contributing Clinical Factors
          </h2>

          {contributingFactors.length > 0 ? (
            <ul className='space-y-2 text-slate-700 text-sm'>
              {contributingFactors.map((factor, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='mt-1 w-2 h-2 bg-slate-400 rounded-full'></span>
                  {factor}
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-slate-500 text-sm'>
              No contributing factors identified.
            </p>
          )}
        </div>

        {/* RECOMMENDATIONS */}
        <div className='bg-white border rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4'>
            Recommended Clinical Actions
          </h2>

          {recommendations.length > 0 ? (
            <ul className='space-y-2 text-slate-700 text-sm'>
              {recommendations.map((rec, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='mt-1 w-2 h-2 bg-blue-500 rounded-full'></span>
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-slate-500 text-sm'>
              No immediate recommendations provided.
            </p>
          )}
        </div>

        {/* DISCLAIMER */}
        <div className='bg-slate-50 border rounded-xl p-4 text-xs text-slate-600'>
          This AI-assisted triage summary supports — but does not replace —
          licensed clinical judgment.
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={() => navigate("/")}
          className='w-full bg-slate-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition'
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
