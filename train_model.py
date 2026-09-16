import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def load_or_fetch_dataset():
    train_url = "https://raw.githubusercontent.com/shrikant-temburwar/Loan-Prediction-Dataset/master/train.csv"
    train_path = "train.csv"
    
    if os.path.exists(train_path):
        print(f"Loading local {train_path}...")
        df = pd.read_csv(train_path)
    else:
        print(f"Downloading training dataset from {train_url}...")
        df = pd.read_csv(train_url)
        df.to_csv(train_path, index=False)
        print(f"Saved dataset as {train_path}.")
    return df

def preprocess_and_train():
    df = load_or_fetch_dataset()
    print("Dataset shape:", df.shape)
    
    # Drop Loan_ID
    if 'Loan_ID' in df.columns:
        df = df.drop(columns=['Loan_ID'])
        
    # Clean Dependents: '3+' -> 3
    if 'Dependents' in df.columns:
        df['Dependents'] = df['Dependents'].astype(str).str.replace('+', '', regex=False)
        df['Dependents'] = pd.to_numeric(df['Dependents'], errors='coerce')
        
    # Numerical and categorical columns
    num_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History', 'Dependents']
    cat_cols = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
    
    # Impute missing values
    for col in num_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
            
    for col in cat_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0])
            
    # Encode categorical features
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"Mapping for {col}: {dict(zip(le.classes_, range(len(le.classes_))))}")
        
    # Encode Target 'Loan_Status' (Y -> 1, N -> 0)
    target_col = 'Loan_Status'
    df[target_col] = df[target_col].map({'Y': 1, 'N': 0})
    if df[target_col].isnull().any():
        df[target_col] = df[target_col].fillna(df[target_col].mode()[0])
        
    feature_order = [
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
    
    X = df[feature_order]
    y = df[target_col].astype(int)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Hyperparameter tuning for KNN
    param_grid = {'n_neighbors': [3, 5, 7, 9, 11, 13, 15, 17, 19]}
    grid = GridSearchCV(KNeighborsClassifier(), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train_scaled, y_train)
    
    best_k = grid.best_params_['n_neighbors']
    print(f"Optimal n_neighbors (k): {best_k}")
    
    best_knn = KNeighborsClassifier(n_neighbors=best_k)
    best_knn.fit(X_train_scaled, y_train)
    
    y_pred = best_knn.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Test Accuracy: {acc * 100:.2f}%")
    print("Classification Report:\n", classification_report(y_test, y_pred, target_names=["Rejected (0)", "Approved (1)"]))
    
    # Save artifacts
    joblib.dump(best_knn, 'knn_loan_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    print("Saved 'knn_loan_model.pkl' and 'scaler.pkl' successfully!")

if __name__ == "__main__":
    preprocess_and_train()
