import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
import "./FormPage.css";

GlobalWorkerOptions.workerSrc = workerSrc;

function FormPage() {
  const navigate = useNavigate();

  // -----------------------------
  // STATES
  // -----------------------------
  const [ehrText, setEhrText] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  // -----------------------------
  // OPTIONS
  // -----------------------------
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

  // -----------------------------
  // HANDLERS
  // -----------------------------
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // EHR FILE PARSER
  // -----------------------------
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

  // -----------------------------
  // SUBMIT
  // -----------------------------
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
      const response = await axios.post("https://smart-triage.onrender.com/", {
        ...formData,
        ehrText,
      });

      navigate("/result", { state: response.data });
    } catch (error) {
      console.error(error);
      alert("Triage assessment failed.");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className='clinical-page'>
      <div className='clinical-form-card'>
        <div className='form-header'>
          <h1>AI Smart Patient Triage</h1>
          <p>Structured + Unstructured EHR-powered clinical intake system</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ---------------- Patient Info ---------------- */}
          <div className='form-section'>
            <h2>Patient Information</h2>
            <div className='form-grid-3'>
              <div className='form-group'>
                <label>Full Name *</label>
                <input
                  type='text'
                  name='name'
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Age *</label>
                <input
                  type='number'
                  name='age'
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Gender *</label>
                <select name='gender' onChange={handleChange} required>
                  <option value=''>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ---------------- Vital Signs ---------------- */}
          <div className='form-section'>
            <h2>Vital Signs</h2>
            <div className='form-grid-3'>
              <div className='form-group'>
                <label>Systolic BP</label>
                <input
                  type='number'
                  name='systolicBP'
                  onChange={handleChange}
                />
              </div>

              <div className='form-group'>
                <label>Diastolic BP</label>
                <input
                  type='number'
                  name='diastolicBP'
                  onChange={handleChange}
                />
              </div>

              <div className='form-group'>
                <label>Heart Rate</label>
                <input type='number' name='heartRate' onChange={handleChange} />
              </div>

              <div className='form-group'>
                <label>Temperature (°C)</label>
                <input
                  type='number'
                  step='0.1'
                  name='temperature'
                  onChange={handleChange}
                />
              </div>

              <div className='form-group'>
                <label>SpO₂ (%)</label>
                <input type='number' name='spo2' onChange={handleChange} />
              </div>

              <div className='form-group'>
                <label>Respiratory Rate</label>
                <input type='number' name='respRate' onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* ---------------- Symptoms ---------------- */}
          <div className='form-section'>
            <h2>Presenting Symptoms</h2>
            <div className='selection-grid'>
              {symptomOptions.map((symptom) => (
                <button
                  type='button'
                  key={symptom}
                  className={
                    formData.symptoms.includes(symptom)
                      ? "selection-btn active"
                      : "selection-btn"
                  }
                  onClick={() => toggleSelection("symptoms", symptom)}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- Conditions ---------------- */}
          <div className='form-section'>
            <h2>Pre-existing Conditions</h2>
            <div className='selection-grid'>
              {conditionOptions.map((condition) => (
                <button
                  type='button'
                  key={condition}
                  className={
                    formData.preExistingConditions.includes(condition)
                      ? "selection-btn active"
                      : "selection-btn"
                  }
                  onClick={() =>
                    toggleSelection("preExistingConditions", condition)
                  }
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- EHR Upload ---------------- */}
          <div className='form-section'>
            <h2>EHR / EMR Upload (Optional)</h2>

            <div className='upload-box'>
              <input
                type='file'
                accept='.pdf,.txt'
                onChange={handleFileUpload}
              />
              <p>Upload medical record (PDF or TXT).</p>
              {uploading && <p className='uploading'>Extracting document...</p>}
            </div>

            {ehrText && (
              <div className='ehr-preview'>
                <h4>Extracted Preview:</h4>
                <textarea value={ehrText.slice(0, 800)} readOnly />
              </div>
            )}
          </div>

          <button type='submit' className='clinical-submit'>
            Run AI Triage Assessment
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormPage;
