import { useLocation, useNavigate } from "react-router-dom";
import "./ResultPage.css";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const getRiskClass = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "badge high";
      case "medium":
        return "badge medium";
      case "low":
        return "badge low";
      default:
        return "badge";
    }
  };

  if (!data) {
    return (
      <div className="center-container">
        <div className="card">
          <h2 className="title">No Data Found</h2>
          <p className="subtitle">
            It looks like no triage result was provided.
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("/")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center-container">
      <div className="card">
        <h2 className="title">AI Triage Result</h2>

        <div className="section">
          <span className={getRiskClass(data.riskLevel)}>
            {data.riskLevel} Risk
          </span>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <p className="label">Department</p>
            <p className="value">{data.department}</p>
          </div>

          <div className="info-box">
            <p className="label">Confidence Score (AI-estimated reasoning strength)</p>
            <p className="value">{data.confidence}</p>
          </div>
        </div>

        <div className="section">
          <h4 className="section-title">Clinical Explanation</h4>
          <ul className="list">
            {data.explanation.map((item, index) => (
              <li key={index} className="list-item">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/")}
        >
          Analyze Another Patient
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
