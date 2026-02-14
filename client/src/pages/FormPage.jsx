import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FormPage.css";

function FormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    symptoms: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    preExistingConditions: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // log the values
    console.log(formData);

    try {
      const response = await axios.post("http://localhost:5000/api/triage", {
        ...formData,
        symptoms: formData.symptoms.split(","),
        preExistingConditions: formData.preExistingConditions.split(","),
      });

      navigate("/result", { state: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='page-container'>
      <div className='form-card'>
        <h2 className='form-title'>Smart Patient Triage</h2>

        <form onSubmit={handleSubmit} className='triage-form'>
          <div className='form-group'>
            <label>Age</label>
            <input type='number' name='age' onChange={handleChange} required />
          </div>

          <div className='form-group'>
            <label>Gender</label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Other'>Other</option>
              <option value='Prefer not to say'>Prefer not to say</option>
            </select>
          </div>

          <div className='form-group'>
            <label>Symptoms</label>
            <input
              type='text'
              name='symptoms'
              placeholder='e.g. fever, cough'
              onChange={handleChange}
            />
          </div>

          <div className='form-group'>
            <label>Blood Pressure</label>
            <input
              type='text'
              name='bloodPressure'
              placeholder='e.g. 120/80'
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
            <label>Pre-existing Conditions</label>
            <input
              type='text'
              name='preExistingConditions'
              placeholder='e.g. diabetes, asthma'
              onChange={handleChange}
            />
          </div>

          <button type='submit' className='submit-btn'>
            Analyze Risk
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormPage;
