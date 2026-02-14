const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  age: Number,
  gender: String,
  symptoms: [String],
  bloodPressure: String,
  heartRate: Number,
  temperature: Number,
  preExistingConditions: [String],
  riskLevel: String,
  department: String,
  confidence: Number,
  explanation: [String]
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
