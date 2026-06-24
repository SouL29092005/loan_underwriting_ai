# AI-Enabled Loan Underwriting Agent

An AI-powered loan underwriting system that helps evaluate loan applications using machine learning and provides transparent approval decisions with confidence scores and explanations.

The project combines a React frontend, FastAPI ML service, and voice-assisted data collection to simplify the loan application process for users with varying levels of digital literacy.

---

## Features

- Loan approval prediction using Machine Learning
- Voice-assisted loan application workflow
- Traditional form-based application workflow
- Confidence score for every prediction
- Human-readable decision explanations
- Hindi and English language support
- REST API built with FastAPI
- Trained and evaluated using multiple ML algorithms
- Automatic feature engineering pipeline
- Hyperparameter tuning and cross-validation

---

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-FF6600?style=for-the-badge&logo=xgboost&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)

### Frontend
- React
- React Router
- JavaScript
- Web Speech API (Speech Recognition)
- Speech Synthesis API

### Backend / ML Service
- Python
- FastAPI
- Pydantic

### Machine Learning
- Scikit-Learn
- XGBoost
- Pandas
- NumPy
- Joblib

---

## Machine Learning Pipeline

### Models Evaluated

- Logistic Regression
- Random Forest Classifier
- XGBoost Classifier

### Training Process

- Data Cleaning
- Feature Engineering
- Train / Validation / Test Split
- Stratified K-Fold Cross Validation
- RandomizedSearchCV Hyperparameter Tuning
- Threshold Optimization using Validation Set
- Final Model Selection based on Cross-Validation F1 Score

### Feature Engineering

Additional features created during training:

- Total Asset Value
- Income per Dependent
- Loan-to-Income Ratio
- Asset-to-Loan Ratio

The training pipeline also includes:

- Missing Value Imputation
- One-Hot Encoding for Categorical Features
- Standard Scaling (for Logistic Regression)

---

## Model Performance

Three machine learning models were trained and compared using Stratified 10-Fold Cross Validation and Randomized Hyperparameter Search.

### Cross Validation Results

| Model | CV F1 Score |
|---------|---------|
| Logistic Regression | 0.9333 |
| Random Forest | 0.9982 |
| XGBoost | 0.9977 |

### Final Test Performance

| Model | Accuracy | Precision | Recall | F1 Score |
|---------|---------|---------|---------|---------|
| Logistic Regression | 0.9215 | 0.9345 | 0.9397 | 0.9371 |
| Random Forest | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| XGBoost | 0.9941 | 0.9907 | 1.0000 | 0.9953 |

### Selected Model

The Random Forest classifier achieved the highest cross-validation F1 score and was selected as the final production model.

Best Hyperparameters:

```text
n_estimators = 500
max_depth = 20
min_samples_split = 10
min_samples_leaf = 2
max_features = log2
decision_threshold = 0.60
```

### Selected Model

**Random Forest Classifier**

Test Set Performance:

| Metric | Score |
|----------|----------|
| Accuracy | 1.0000 |
| Precision | 1.0000 |
| Recall | 1.0000 |
| F1 Score | 1.0000 |

> Note: Perfect performance may indicate that the dataset is highly separable. Additional validation on unseen real-world data would be required before deployment.

---

## System Architecture

```text
React Frontend
       |
       v
FastAPI Prediction API
       |
       v
Trained Random Forest Model
       |
       v
Prediction + Confidence + Explanation
```

---

## API Response Example

```json
{
  "approved": true,
  "confidence": 94.28,
  "explanation": {
    "summary": "Loan approved.",
    "reasons": [],
    "suggestions": []
  }
}
```

---

## Project Structure

```text
loan_underwriting_ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── server.js
│   └── package.json
│
├── ml-services/
│   ├── data/
│   ├── saved_models/
│   ├── app.py
│   ├── train.py
│   └── start.bat
│
└── README.md
```

---


## Running the Project

The application consists of three services:

1. ML Service (FastAPI + Trained Model)
2. Backend Server
3. React Frontend

### Step 1: Start the ML Service

```bash
cd ml-services
.\start.bat
```

This loads the trained model and starts the prediction API on port 8000.

---

### Step 2: Start the Backend Server

Open a new terminal; run this:

```bash
cd backend
npm run start
```

---

### Step 3: Start the Frontend

Open another terminal and run this:

```bash
cd frontend
npm run dev
```

---

### Access the Application

After all services are running, open:

```text
http://localhost:5173
```

in your browser.


---

## Dataset

This project uses the Loan Approval Prediction dataset available on Kaggle.

Dataset Source:
https://www.kaggle.com/datasets/architsharma01/loan-approval-prediction-dataset

Dataset Statistics:
- Total Records: 4,270
- Target Variable: `loan_status`
- Classes:
  - Approved
  - Rejected

Features:
- Number of Dependents
- Education
- Self Employed Status
- Annual Income
- Loan Amount
- Loan Term
- CIBIL Score
- Residential Asset Value
- Commercial Asset Value
- Luxury Asset Value
- Bank Asset Value

---

## Future Improvements

- Real multilingual voice support
- Document verification
- Explainable AI visualizations
- Model monitoring and retraining
- Cloud deployment
- Authentication and user profiles

---

## Author

Souvik Layek  
B.Tech Electronics & Communication Engineering  
IIT (ISM) Dhanbad