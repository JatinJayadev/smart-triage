const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      systolicBP,
      diastolicBP,
      heartRate,
      temperature,
      spo2,
      respRate,
      symptoms = [],
      preExistingConditions = [],
      ehrText = "",
    } = req.body;

    const hasManualData = age || systolicBP || heartRate || symptoms.length > 0;

    const hasEHR = ehrText && ehrText.trim().length > 20;

    if (!hasManualData && !hasEHR) {
      return res.status(400).json({
        message: "No sufficient clinical data provided.",
      });
    }

    // Ensure numbers
    const vitals = {
      systolicBP: Number(systolicBP) || null,
      diastolicBP: Number(diastolicBP) || null,
      heartRate: Number(heartRate) || null,
      temperature: Number(temperature) || null,
      spo2: Number(spo2) || null,
      respRate: Number(respRate) || null,
    };

    const prompt = `
You are an AI-powered hospital triage assistant trained in emergency medicine protocols.

Perform structured clinical reasoning.

STRUCTURED PATIENT DATA:
Age: ${age || "Not provided"}
Gender: ${gender || "Not provided"}

Vital Signs:
Systolic BP: ${vitals.systolicBP}
Diastolic BP: ${vitals.diastolicBP}
Heart Rate: ${vitals.heartRate}
Temperature: ${vitals.temperature}
SpO2: ${vitals.spo2}
Respiratory Rate: ${vitals.respRate}

Symptoms:
${symptoms.join(", ") || "None"}

Pre-existing Conditions:
${preExistingConditions.join(", ") || "None"}

UNSTRUCTURED EHR CONTENT:
${hasEHR ? ehrText : "No EHR document provided."}

If EHR contains vitals or symptoms not listed above, incorporate them.
If conflict exists, prioritize most recent or abnormal values.

CLINICAL RULES:
- SpO2 < 90 → High Risk
- SBP < 90 → High Risk
- HR > 130 or < 40 → High Risk
- Temperature > 39°C → Medium/High Risk
- Chest Pain + Heart Disease → High Risk
- Confusion + abnormal vitals → High Risk

TASKS:
1. Determine Risk Level (Low / Medium / High)
2. Assign Triage Priority (Immediate / Urgent / Routine)
3. Provide Severity Score (0-100)
4. Determine Vital Stability (Stable / Unstable)
5. Recommend Primary Department
6. Recommend Secondary Department (if needed)
7. List Top 5 Contributing Clinical Factors
8. Provide 3–5 Recommended Next Clinical Actions
9. Provide Confidence Score (0–1)

Respond ONLY in valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a professional emergency triage nurse providing structured medical reasoning.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "triage_response",
          schema: {
            type: "object",
            properties: {
              riskLevel: { type: "string", enum: ["Low", "Medium", "High"] },
              triagePriority: {
                type: "string",
                enum: ["Immediate", "Urgent", "Routine"],
              },
              severityScore: { type: "number" },
              vitalStatus: {
                type: "string",
                enum: ["Stable", "Unstable"],
              },
              departmentPrimary: { type: "string" },
              departmentSecondary: { type: "string" },
              contributingFactors: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
              confidence: { type: "number" },
            },
            required: [
              "riskLevel",
              "triagePriority",
              "severityScore",
              "vitalStatus",
              "departmentPrimary",
              "contributingFactors",
              "recommendations",
              "confidence",
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    parsed.severityScore = Math.min(
      Math.max(parsed.severityScore || 0, 0),
      100,
    );
    parsed.confidence = Math.min(Math.max(parsed.confidence || 0, 0), 1);

    const newPatient = new Patient({
      name,
      age,
      gender,
      ...vitals,
      symptoms,
      preExistingConditions,
      ehrText: hasEHR ? ehrText : null,
      riskLevel: parsed.riskLevel,
      triagePriority: parsed.triagePriority,
      severityScore: parsed.severityScore,
      vitalStatus: parsed.vitalStatus,
      departmentPrimary: parsed.departmentPrimary,
      departmentSecondary: parsed.departmentSecondary,
      contributingFactors: parsed.contributingFactors,
      recommendations: parsed.recommendations,
      confidence: parsed.confidence,
    });

    await newPatient.save();

    res.json(parsed);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    const totalPatients = patients.length;

    const highRisk = patients.filter(p => p.riskLevel === "High").length;
    const mediumRisk = patients.filter(p => p.riskLevel === "Medium").length;
    const lowRisk = patients.filter(p => p.riskLevel === "Low").length;

    const unstableCount = patients.filter(p => p.vitalStatus === "Unstable").length;

    const avgSeverity =
      totalPatients > 0
        ? (
            patients.reduce((sum, p) => sum + (p.severityScore || 0), 0) /
            totalPatients
          ).toFixed(1)
        : 0;

    const avgConfidence =
      totalPatients > 0
        ? (
            patients.reduce((sum, p) => sum + (p.confidence || 0), 0) /
            totalPatients
          ).toFixed(2)
        : 0;

    // Department distribution
    const departmentStats = {};
    patients.forEach((p) => {
      if (!departmentStats[p.departmentPrimary]) {
        departmentStats[p.departmentPrimary] = 0;
      }
      departmentStats[p.departmentPrimary]++;
    });

    res.json({
      totalPatients,
      highRisk,
      mediumRisk,
      lowRisk,
      unstableCount,
      avgSeverity,
      avgConfidence,
      departmentStats,
      patients,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
