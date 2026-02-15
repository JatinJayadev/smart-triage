import { useState } from "react";
import axios from "axios";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
import Dashboard from "./Dashboard";

GlobalWorkerOptions.workerSrc = workerSrc;

function FormPage() {
  const [activeTab, setActiveTab] = useState("triage");
  const [resultData, setResultData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [ehrText, setEhrText] = useState("");
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    name: "",
    age: "",
    gender: "",
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    temperature: "",
    spo2: "",
    respRate: "",
    symptoms: [],
    preExistingConditions: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const symptomOptions = [
    "Chest Pain",
    "Shortness of Breath",
    "Headache",
    "Dizziness",
    "Fever",
    "Cough",
    "Nausea",
    "Vomiting",
    "Abdominal Pain",
    "Back Pain",
    "Joint Pain",
    "Fatigue",
    "Confusion",
    "Numbness",
    "Vision Changes",
    "Palpitations",
    "Swelling",
    "Bleeding",
    "Rash",
    "Difficulty Swallowing",
    "Sore Throat",
    "Ear Pain",
    "Wheezing",
    "Loss of Consciousness",
  ];

  const conditionOptions = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Asthma",
    "COPD",
    "Cancer",
    "Kidney Disease",
    "Liver Disease",
    "Stroke History",
    "Epilepsy",
    "Arthritis",
    "Obesity",
    "Depression",
    "Anxiety",
    "Thyroid Disorder",
    "Anemia",
    "HIV/AIDS",
  ];

  const resetAssessment = () => {
    setFormData(initialFormState);
    setEhrText("");
    setUploading(false);
    setResultData(null);
    setAnalyzing(false);
  };

  const toggleSelection = (type, value) => {
    setFormData((prev) => {
      const list = prev[type];
      if (list.includes(value)) {
        return { ...prev, [type]: list.filter((i) => i !== value) };
      }
      return { ...prev, [type]: [...list, value] };
    });
  };

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // TEXT FILE
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = () => {
          setEhrText(reader.result);
          setUploading(false);
        };
        reader.readAsText(file);
      }

      // PDF FILE
      else if (file.type === "application/pdf") {
        const reader = new FileReader();

        reader.onload = async function () {
          try {
            const typedarray = new Uint8Array(this.result);

            const pdf = await getDocument({
              data: typedarray,
              disableFontFace: true,
            }).promise;

            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();

              const pageText = content.items.map((item) => item.str).join(" ");

              extractedText += pageText + "\n\n";
            }

            if (!extractedText.trim()) {
              extractedText =
                "⚠ No selectable text found. This PDF may be scanned (image-based). OCR required.";
            }

            setEhrText(extractedText);
            setUploading(false);
          } catch (error) {
            console.error("PDF parsing error:", error);
            alert("Failed to extract PDF content.");
            setUploading(false);
          }
        };

        reader.readAsArrayBuffer(file);
      } else {
        alert("Unsupported file format. Upload PDF or TXT only.");
        setUploading(false);
      }
    } catch (err) {
      console.error("File Parsing Error:", err);
      alert("Failed to extract document.");
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasManualData =
      formData.age ||
      formData.systolicBP ||
      formData.heartRate ||
      formData.symptoms.length > 0;

    const hasEHR = ehrText && ehrText.trim().length > 20;

    if (!hasManualData && !hasEHR) {
      alert("Please provide patient data or upload an EHR document.");
      return;
    }

    try {
      setAnalyzing(true);

      const response = await axios.post("http://localhost:5000/api/triage", {
        ...formData,
        ehrText,
      });

      setResultData(response.data);
    } catch (error) {
      console.error(error);
      alert("Triage assessment failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const Input = ({ label, name, type = "text", required }) => (
    <div>
      <label className='block text-sm font-medium text-slate-600 mb-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={formData[name] || ""}
        onChange={handleChange}
        className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
      />
    </div>
  );

  const Select = ({ label, name, required }) => (
    <div>
      <label className='block text-sm font-medium text-slate-600 mb-1'>
        {label}
      </label>
      <select
        name={name}
        required={required}
        value={formData[name] || ""}
        onChange={handleChange}
        className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
      >
        <option value=''>Select</option>
        <option value='Male'>Male</option>
        <option value='Female'>Female</option>
        <option value='Other'>Other</option>
      </select>
    </div>
  );

  const SelectionSection = ({ title, options, type }) => (
    <div className='bg-white border rounded-xl p-6 shadow-sm'>
      <h2 className='text-lg font-semibold mb-6 text-slate-800'>{title}</h2>

      <div className='flex flex-wrap gap-3'>
        {options.map((option) => (
          <button
            type='button'
            key={option}
            onClick={() => toggleSelection(type, option)}
            className={`px-4 py-2 text-sm rounded-full border transition ${
              formData[type].includes(option)
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

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
  } = resultData || {};

  const confidencePercent = Math.round((confidence || 0) * 100);

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

  const RiskBar = ({ label, value, total, color }) => {
    const percentage = total ? (value / total) * 100 : 0;

    return (
      <div className='mb-4'>
        <div className='flex justify-between text-sm mb-1'>
          <span>{label}</span>
          <span>
            {value} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className='w-full bg-slate-200 h-3 rounded-full'>
          <div
            className={`${color} h-3 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-slate-100'>
      {/* ================= NAVBAR ================= */}
      <div className='bg-slate-900 text-white px-8 py-6 shadow-md'>
        <div className='max-w-7xl mx-auto flex items-center gap-4'>
          {/* Medical Logo */}
          <div className='bg-white/10 p-3 rounded-xl'>🏥</div>

          <div>
            <h1 className='text-2xl font-bold'>MedTriage AI</h1>
            <p className='text-sm text-slate-300'>
              Intelligent Emergency Risk Stratification System
            </p>
          </div>
        </div>
      </div>

      {/* ================= TAB NAVIGATION ================= */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-8 flex gap-6'>
          <button
            onClick={() => setActiveTab("triage")}
            className={`py-4 font-medium border-b-2 ${
              activeTab === "triage"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500"
            }`}
          >
            Patient Triage
          </button>

          <button
            onClick={() => {
              setActiveTab("dashboard");
            }}
            className={`py-4 font-medium border-b-2 ${
              activeTab === "dashboard"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500"
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* ================= CONTENT AREA ================= */}
      <div className='max-w-7xl mx-auto px-8 py-10'>
        {activeTab === "triage" && (
          <>
            {/* ANALYZING STATE */}
            {analyzing && (
              <div className='bg-white border rounded-xl p-12 text-center shadow-sm'>
                <div className='animate-spin w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full mx-auto mb-6'></div>
                <h2 className='text-lg font-semibold text-slate-800'>
                  Analyzing Patient Data...
                </h2>
                <p className='text-sm text-slate-500 mt-2'>
                  AI engine is evaluating risk factors and vitals.
                </p>
              </div>
            )}

            {/* FORM VIEW */}
            {!analyzing && !resultData && (
              <div>
                {/* 👇 KEEP YOUR EXISTING FORM JSX HERE */}
                {/* The full form layout we built earlier */}
                <div className='max-w-7xl mx-auto'>
                  {/* Header */}
                  {/* <div className='mb-10'>
                    <h1 className='text-3xl font-bold text-slate-900'>
                      MedTriage AI
                    </h1>
                    <p className='text-slate-600 mt-2'>
                      AI-Powered Clinical Intake & Risk Prioritization System
                    </p>
                  </div> */}

                  <div className='grid grid-cols-12 gap-8'>
                    {/* ================= LEFT SIDE ================= */}
                    <div className='col-span-12 lg:col-span-8 space-y-8'>
                      <form onSubmit={handleSubmit} className='space-y-8'>
                        {/* Patient Info */}
                        <div className='bg-white border rounded-xl p-6 shadow-sm'>
                          <h2 className='text-lg font-semibold mb-6 text-slate-800'>
                            Patient Information
                          </h2>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <Input label='Full Name' name='name' required />
                            <Input
                              label='Age'
                              name='age'
                              type='number'
                              required
                            />
                            <Select label='Gender' name='gender' required />
                          </div>
                        </div>

                        {/* Vital Signs */}
                        <div className='bg-white border rounded-xl p-6 shadow-sm'>
                          <h2 className='text-lg font-semibold mb-6 text-slate-800'>
                            Vital Signs
                          </h2>

                          <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                            <Input
                              label='Systolic BP'
                              name='systolicBP'
                              type='number'
                            />
                            <Input
                              label='Diastolic BP'
                              name='diastolicBP'
                              type='number'
                            />
                            <Input
                              label='Heart Rate'
                              name='heartRate'
                              type='number'
                            />
                            <Input
                              label='Temperature (°C)'
                              name='temperature'
                              type='number'
                            />
                            <Input label='SpO₂ (%)' name='spo2' type='number' />
                            <Input
                              label='Resp Rate'
                              name='respRate'
                              type='number'
                            />
                          </div>
                        </div>

                        {/* Symptoms */}
                        <SelectionSection
                          title='Presenting Symptoms'
                          options={symptomOptions}
                          type='symptoms'
                        />

                        {/* Conditions */}
                        <SelectionSection
                          title='Pre-Existing Conditions'
                          options={conditionOptions}
                          type='preExistingConditions'
                        />

                        {/* Submit */}
                        <button
                          type='submit'
                          className='w-full bg-slate-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition'
                        >
                          Run AI Triage Assessment
                        </button>
                      </form>
                    </div>

                    {/* ================= RIGHT SIDE ================= */}
                    <div className='col-span-12 lg:col-span-4'>
                      <div className='sticky top-10 space-y-6'>
                        {/* BRAND PANEL */}
                        <div className='bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-6 shadow-lg'>
                          <div className='flex items-center gap-3 mb-4'>
                            <div className='bg-white/20 p-3 rounded-xl'>
                              {/* Upload Icon */}
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='w-6 h-6'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M12 16V4m0 0l-4 4m4-4l4 4m-9 8h10a2 2 0 002-2v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2a2 2 0 002 2z'
                                />
                              </svg>
                            </div>
                            <div>
                              <h2 className='text-lg font-semibold'>
                                EHR Intelligence
                              </h2>
                              <p className='text-xs text-white/70'>
                                AI-powered document extraction & triage parsing
                              </p>
                            </div>
                          </div>

                          <div className='text-xs text-white/70'>
                            Upload structured or unstructured medical records.
                            Our AI extracts clinical signals automatically.
                          </div>
                        </div>

                        {/* UPLOAD PANEL */}
                        <div className='bg-white border rounded-2xl p-6 shadow-sm'>
                          <h3 className='text-sm font-semibold text-slate-700 mb-4'>
                            Upload Medical Record
                          </h3>

                          <label className='flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-8 cursor-pointer hover:bg-blue-50 transition'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='w-10 h-10 text-blue-500 mb-3'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                              />
                            </svg>

                            <span className='text-sm text-slate-600 font-medium'>
                              Click to Upload PDF or TXT
                            </span>

                            <input
                              type='file'
                              accept='.pdf,.txt'
                              onChange={handleFileUpload}
                              className='hidden'
                            />
                          </label>

                          {uploading && (
                            <div className='mt-4 text-amber-500 text-sm font-medium animate-pulse'>
                              Extracting document...
                            </div>
                          )}

                          {ehrText && (
                            <div className='mt-6'>
                              <h4 className='text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide'>
                                Extracted Preview
                              </h4>
                              <textarea
                                value={ehrText.slice(0, 800)}
                                readOnly
                                className='w-full h-52 text-xs bg-slate-50 border rounded-lg p-3 font-mono'
                              />
                            </div>
                          )}
                        </div>

                        {/* SYSTEM STATUS PANEL */}
                        <div className='bg-slate-50 border rounded-xl p-4 text-xs text-slate-600'>
                          <div className='flex justify-between mb-2'>
                            <span>AI Engine</span>
                            <span className='text-green-600 font-semibold'>
                              Online
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Document Parser</span>
                            <span className='text-green-600 font-semibold'>
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RESULT VIEW */}
            {!analyzing && resultData && (
              <div className='space-y-8'>
                <button
                  onClick={resetAssessment}
                  className='text-sm text-slate-600 hover:text-slate-900'
                >
                  ← New Assessment
                </button>

                {/* 👇 PASTE THE RESULT DASHBOARD UI WE BUILT EARLIER HERE */}
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
                          vitalStatus === "Unstable"
                            ? "text-red-600"
                            : "text-green-600"
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
                    This AI-assisted triage summary supports — but does not
                    replace — licensed clinical judgment.
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    onClick={resetAssessment}
                    className='w-full bg-slate-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition'
                  >
                    Start New Assessment
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "dashboard" && <Dashboard />}
      </div>
    </div>
  );
}

export default FormPage;
