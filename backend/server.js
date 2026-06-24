import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Loan Underwriting Backend is running",
  });
});

app.post("/api/predict", async (req, res) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Prediction error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        message: "ML service error",
        details: error.response.data,
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "ML service is unavailable",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});