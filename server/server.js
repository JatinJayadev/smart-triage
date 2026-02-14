require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const triageRoute = require("./routes/triage");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Local Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

// Routes
app.use("/api/triage", triageRoute);

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
