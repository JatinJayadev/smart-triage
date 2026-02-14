const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    systolicBP: Number,
    diastolicBP: Number,
    heartRate: Number,
    temperature: Number,
    spo2: { type: Number, min: 0, max: 100 },
    respRate: Number,

    symptoms: { type: [String], default: [] },
    preExistingConditions: { type: [String], default: [] },

    // Store raw EHR for traceability
    ehrText: { type: String },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    triagePriority: {
      type: String,
      enum: ["Immediate", "Urgent", "Routine"],
    },
    severityScore: { type: Number, min: 0, max: 100 },
    vitalStatus: {
      type: String,
      enum: ["Stable", "Unstable"],
    },
    departmentPrimary: String,
    departmentSecondary: String,
    contributingFactors: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    confidence: { type: Number, min: 0, max: 1 },
  },
  { timestamps: true }
);

patientSchema.index({ riskLevel: 1 });
patientSchema.index({ departmentPrimary: 1 });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Patient", patientSchema);
