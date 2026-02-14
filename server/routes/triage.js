const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {

    const {
      age,
      gender,
      symptoms,
      bloodPressure,
      heartRate,
      temperature,
      preExistingConditions
    } = req.body;

    // ----------------------------
    // OpenAI Prompt
    // ----------------------------

    const prompt = `
You are an AI-powered hospital triage assistant.

Analyze the patient details below and classify:

1. Risk Level: Low / Medium / High
2. Recommended Department (General Medicine, Cardiology, Neurology, Emergency, etc.)
3. Confidence Score (0 to 1)
4. Explanation (Top 3 medical reasons)

Patient Details:
Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms.join(", ")}
Blood Pressure: ${bloodPressure}
Heart Rate: ${heartRate}
Temperature: ${temperature}
Pre-existing Conditions: ${preExistingConditions.join(", ")}

Respond ONLY in JSON format like:

{
  "riskLevel": "",
  "department": "",
  "confidence": 0,
  "explanation": []
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional emergency triage medical assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const aiResponse = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({
        message: "AI response parsing failed"
      });
    }

    // ----------------------------
    // Save to MongoDB
    // ----------------------------

    const newPatient = new Patient({
      age,
      gender,
      symptoms,
      bloodPressure,
      heartRate,
      temperature,
      preExistingConditions,
      riskLevel: parsed.riskLevel,
      department: parsed.department,
      confidence: parsed.confidence,
      explanation: parsed.explanation
    });

    await newPatient.save();

    // ----------------------------
    // Send to Frontend
    // ----------------------------

    res.json(parsed);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
