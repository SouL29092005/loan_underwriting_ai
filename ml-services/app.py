import joblib
import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel, Field

from pathlib import Path

app = FastAPI()

# Enable CORS for local React frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "saved_models" / "best_model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

BEST_THRESHOLD = 0.60

model = joblib.load(MODEL_PATH)

class LoanRequest(BaseModel):
    no_of_dependents: int = Field(ge=0)
    education: str
    self_employed: str
    income_annum: float = Field(gt=0)
    loan_amount: float = Field(gt=0)
    loan_term: int = Field(gt=0)
    cibil_score: int = Field(ge=300, le=900)
    residential_assets_value: float = Field(ge=0)
    commercial_assets_value: float = Field(ge=0)
    luxury_assets_value: float = Field(ge=0)
    bank_asset_value: float = Field(ge=0)


def explain_decision(data, approved):
    reasons = []
    suggestions = []

    if data["cibil_score"] < 600:
        reasons.append("Low credit score.")
        suggestions.append("Improve your credit score.")

    if data["loan_to_income_ratio"] > 0.5:
        reasons.append("High loan-to-income ratio.")
        suggestions.append("Apply for a smaller loan amount.")

    if approved:
        summary = "Loan approved."
    else:
        summary = "Loan not approved."

    return {
        "summary": summary,
        "reasons": reasons,
        "suggestions": suggestions
    }


@app.get("/")
def root():
    return {"message": "Loan prediction API is running"}

@app.post("/predict")
def predict(request: LoanRequest):

    data = request.model_dump()

    # Clean categorical values to match training data (strip leading/trailing spaces)
    if isinstance(data.get("education"), str):
        data["education"] = data["education"].strip()
    if isinstance(data.get("self_employed"), str):
        data["self_employed"] = data["self_employed"].strip()

    data["total_asset_value"] = (
        data["residential_assets_value"]
        + data["commercial_assets_value"]
        + data["luxury_assets_value"]
        + data["bank_asset_value"]
    )

    data["income_per_dependent"] = (
    data["income_annum"] / max(data["no_of_dependents"] + 1, 1)
)

    data["loan_to_income_ratio"] = (
        data["loan_amount"] / max(data["income_annum"], 1)
    )

    data["asset_to_loan_ratio"] = (
        data["total_asset_value"] / max(data["loan_amount"], 1)
    )

    df = pd.DataFrame([data])


    probability = float(model.predict_proba(df)[0][1])
    prediction = int(probability >= BEST_THRESHOLD)

    explanation = explain_decision(data, prediction == 1)

    return {
        "approved": bool(prediction),
        "confidence": round(probability * 100, 2),
        "explanation": explanation
    }