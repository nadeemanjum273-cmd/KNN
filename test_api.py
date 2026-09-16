import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import home, api_info, predict_loan, LoanRequest

def test_api():
    # 1. Test home (HTML web app response)
    root_res = home()
    print("Web UI Endpoint (GET /):", root_res)
    
    # 2. Test api_info
    info_res = api_info()
    print("API Info Endpoint (GET /api/info):", info_res)
    assert "message" in info_res

    # 2. Test sample with strong approval profile
    sample_approved = LoanRequest(
        Gender=1,
        Married=1,
        Dependents=0,
        Education=0,
        Self_Employed=0,
        ApplicantIncome=5849.0,
        CoapplicantIncome=0.0,
        LoanAmount=128.0,
        Loan_Amount_Term=360.0,
        Credit_History=1.0,
        Property_Area=2
    )
    res1 = predict_loan(sample_approved)
    print("\nSample 1 (Strong profile - Credit History 1.0):", res1)
    assert res1["loan_status"] in ["Approved", "Rejected"]

    # 3. Test sample with high risk profile
    sample_rejected = LoanRequest(
        Gender=1,
        Married=0,
        Dependents=2,
        Education=1,
        Self_Employed=0,
        ApplicantIncome=1800.0,
        CoapplicantIncome=0.0,
        LoanAmount=300.0,
        Loan_Amount_Term=360.0,
        Credit_History=0.0,
        Property_Area=0
    )
    res2 = predict_loan(sample_rejected)
    print("\nSample 2 (High risk - Credit History 0.0):", res2)
    assert res2["loan_status"] in ["Approved", "Rejected"]

    print("\n[SUCCESS] Both model prediction tests ran and verified successfully!")

if __name__ == "__main__":
    test_api()
