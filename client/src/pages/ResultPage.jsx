import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./ResultPage.css";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  // Redirect if no data (refresh-safe behavior)
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

  const getRiskClass = (level) => {
    switch (level) {
      case "High":
        return "risk-high";
      case "Medium":
        return "risk-medium";
      case "Low":
        return "risk-low";
      default:
        return "risk-default";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Immediate":
        return "priority-immediate";
      case "Urgent":
        return "priority-urgent";
      case "Routine":
        return "priority-routine";
      default:
        return "";
    }
  };

  return (
    <div className="clinical-container">
      <div className="clinical-card">

        {/* HEADER */}
        <div className="clinical-header">
          <div>
            <h1>Clinical Triage Summary</h1>
            <p className={`priority-text ${getPriorityClass(triagePriority)}`}>
              {triagePriority} Priority
            </p>
          </div>

          <div className={`risk-indicator ${getRiskClass(riskLevel)}`}>
            {riskLevel} Risk
          </div>
        </div>

        {/* SEVERITY PROGRESS */}
        <div className="section">
          <h3>Severity Score</h3>
          <div className="progress-bar">
            <div
              className={`progress-fill ${getRiskClass(riskLevel)}`}
              style={{ width: `${severityScore}%` }}
            />
          </div>
          <div className="progress-text">{severityScore}/100</div>
        </div>

        {/* CORE METRICS */}
        <div className="metrics-grid">

          <div className="metric-box">
            <label>Vital Stability</label>
            <div
              className={`vital-status ${
                vitalStatus === "Unstable"
                  ? "vital-unstable"
                  : "vital-stable"
              }`}
            >
              {vitalStatus}
            </div>
          </div>

          <div className="metric-box">
            <label>AI Confidence</label>
            <div className="metric-value">
              {confidencePercent}
              <span>%</span>
            </div>
          </div>

        </div>

        {/* DEPARTMENTS */}
        <div className="section">
          <h3>Assigned Departments</h3>
          <div className="department-list">
            <div className="department-item">
              <strong>Primary:</strong> {departmentPrimary}
            </div>

            {departmentSecondary && (
              <div className="department-item secondary">
                <strong>Secondary:</strong> {departmentSecondary}
              </div>
            )}
          </div>
        </div>

        {/* FACTORS */}
        <div className="section">
          <h3>Contributing Clinical Factors</h3>
          <ul className="clinical-list">
            {contributingFactors.length > 0 ? (
              contributingFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))
            ) : (
              <li>No contributing factors identified.</li>
            )}
          </ul>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="section">
          <h3>Recommended Clinical Actions</h3>
          <ul className="clinical-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))
            ) : (
              <li>No immediate recommendations provided.</li>
            )}
          </ul>
        </div>

        {/* DISCLAIMER */}
        <div className="clinical-disclaimer">
          This AI-assisted triage summary supports — but does not replace —
          licensed clinical judgment.
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/")}
        >
          New Patient Assessment
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
