from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Nadeem Loanpredict AI API",
    description="KNN-based machine learning API for Nadeem Loanpredict AI.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to model artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(os.path.join(BASE_DIR, 'knn_loan_model.pkl')):
    parent_dir = os.path.dirname(BASE_DIR)
    if os.path.exists(os.path.join(parent_dir, 'knn_loan_model.pkl')):
        BASE_DIR = parent_dir
    elif os.path.exists(os.path.join(os.getcwd(), 'knn_loan_model.pkl')):
        BASE_DIR = os.getcwd()

MODEL_PATH = os.path.join(BASE_DIR, 'knn_loan_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')

# Load trained model and scaler
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Define request body structure based on dataset features with documentation
class LoanRequest(BaseModel):
    Gender: int = Field(..., description="0 = Female, 1 = Male")
    Married: int = Field(..., description="0 = No, 1 = Yes")
    Dependents: int = Field(..., description="Number of dependents: 0, 1, 2, 3+")
    Education: int = Field(..., description="0 = Graduate, 1 = Not Graduate")
    Self_Employed: int = Field(..., description="0 = No, 1 = Yes")
    ApplicantIncome: float = Field(..., description="Monthly income of applicant")
    CoapplicantIncome: float = Field(..., description="Monthly income of co-applicant")
    LoanAmount: float = Field(..., description="Loan amount in thousands")
    Loan_Amount_Term: float = Field(..., description="Loan term in months (e.g., 360, 180)")
    Credit_History: float = Field(..., description="1.0 = meets guidelines, 0.0 = does not")
    Property_Area: int = Field(..., description="0 = Rural, 1 = Semiurban, 2 = Urban")

FEATURE_NAMES = [
    'Gender',
    'Married',
    'Dependents',
    'Education',
    'Self_Employed',
    'ApplicantIncome',
    'CoapplicantIncome',
    'LoanAmount',
    'Loan_Amount_Term',
    'Credit_History',
    'Property_Area'
]

from fastapi.responses import HTMLResponse, FileResponse

TEMPLATE_PATH = os.path.join(BASE_DIR, 'templates', 'index.html')
if not os.path.exists(TEMPLATE_PATH):
    alt_template = os.path.join(os.getcwd(), 'templates', 'index.html')
    if os.path.exists(alt_template):
        TEMPLATE_PATH = alt_template

@app.get("/", response_class=HTMLResponse)
def home():
    if os.path.exists(TEMPLATE_PATH):
        return FileResponse(TEMPLATE_PATH)
    return HTMLResponse("<h1>Loan Prediction API is running. UI template not found.</h1>")

@app.get("/api/info")
def api_info():
    return {
        "message": "Nadeem Loanpredict AI API is live!",
        "docs": "/docs",
        "feature_encodings": {
            "Gender": {"0": "Female", "1": "Male"},
            "Married": {"0": "No", "1": "Yes"},
            "Dependents": "0, 1, 2, 3",
            "Education": {"0": "Graduate", "1": "Not Graduate"},
            "Self_Employed": {"0": "No", "1": "Yes"},
            "Credit_History": {"0.0": "Unfavorable", "1.0": "Favorable"},
            "Property_Area": {"0": "Rural", "1": "Semiurban", "2": "Urban"}
        }
    }

@app.post("/predict")
def predict_loan(data: LoanRequest):
    # Extract features into a DataFrame matching training column names
    import pandas as pd
    features_df = pd.DataFrame([[
        data.Gender,
        data.Married,
        data.Dependents,
        data.Education,
        data.Self_Employed,
        data.ApplicantIncome,
        data.CoapplicantIncome,
        data.LoanAmount,
        data.Loan_Amount_Term,
        data.Credit_History,
        data.Property_Area
    ]], columns=FEATURE_NAMES)
    
    # Scale features
    scaled_features = scaler.transform(features_df)
    
    # Predict
    prediction = model.predict(scaled_features)
    result = "Approved" if prediction[0] == 1 else "Rejected"
    
    # Probabilities if supported by model
    response = {"loan_status": result}
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(scaled_features)[0]
        response["approval_probability"] = round(float(probabilities[1]), 4)
        
    return response

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
