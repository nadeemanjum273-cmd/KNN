# Loan Approval Prediction API (FastAPI + KNN)

A production-ready machine learning API serving a **K-Nearest Neighbors (KNN)** classifier to predict loan approvals. Built with **FastAPI**, **scikit-learn**, and **Pydantic**, configured with CORS support for seamless integration with modern web frontends (e.g., Next.js, React, Vue).

---

## 📁 Project Structure

```text
KNN/
├── app.py               # FastAPI backend with /predict and / endpoints
├── train_model.py       # Model training & hyperparameter tuning pipeline
├── test_api.py          # API verification and automated test script
├── knn_loan_model.pkl   # Serialized optimal KNN model (k=17, 84.55% accuracy)
├── scaler.pkl           # StandardScaler fitted on the feature matrix
├── train.csv            # Full dataset with Loan_Status (Y/N)
└── loan.csv             # Raw feature dataset
```

---

## 🚀 How to Run the Server

### Option 1: Direct Python Execution
```bash
python app.py
```

### Option 2: Using Uvicorn directly
```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Once running:
- **API Root**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🔌 API Endpoints

### 1. `POST /predict`
Evaluates a loan applicant's details and returns whether their loan is **Approved** or **Rejected**, along with the model's confidence/probability.

#### Request Headers:
```http
Content-Type: application/json
```

#### Feature Encoding Guide:
| Feature | Type | Valid Values & Encoding |
| :--- | :--- | :--- |
| `Gender` | `int` | `0` = Female, `1` = Male |
| `Married` | `int` | `0` = No, `1` = Yes |
| `Dependents` | `int` | `0`, `1`, `2`, `3` (for 3+) |
| `Education` | `int` | `0` = Graduate, `1` = Not Graduate |
| `Self_Employed` | `int` | `0` = No, `1` = Yes |
| `ApplicantIncome` | `float` | Monthly income (e.g. `5849.0`) |
| `CoapplicantIncome` | `float` | Co-applicant monthly income (e.g. `0.0`) |
| `LoanAmount` | `float` | Loan amount in thousands (e.g. `128.0`) |
| `Loan_Amount_Term` | `float` | Term in months (e.g. `360.0` for 30 years) |
| `Credit_History` | `float` | `1.0` = Meets guidelines, `0.0` = Bad/No history |
| `Property_Area` | `int` | `0` = Rural, `1` = Semiurban, `2` = Urban |

#### Sample Request Body (JSON):
```json
{
  "Gender": 1,
  "Married": 1,
  "Dependents": 0,
  "Education": 0,
  "Self_Employed": 0,
  "ApplicantIncome": 5849.0,
  "CoapplicantIncome": 0.0,
  "LoanAmount": 128.0,
  "Loan_Amount_Term": 360.0,
  "Credit_History": 1.0,
  "Property_Area": 2
}
```

#### Sample Response:
```json
{
  "loan_status": "Approved",
  "approval_probability": 0.8824
}
```

---

## 🧪 Testing the API

To verify that your model and API endpoints are functioning properly, run:
```bash
python test_api.py
```
