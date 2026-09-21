import { NextResponse } from 'next/server';
import modelData from '@/model_data.json';

export async function POST(request) {
  try {
    const data = await request.json();

    // Feature order matching training dataset:
    // Gender, Married, Dependents, Education, Self_Employed,
    // ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term,
    // Credit_History, Property_Area
    const rawFeatures = [
      Number(data.Gender) || 0,
      Number(data.Married) || 0,
      Number(data.Dependents) || 0,
      Number(data.Education) || 0,
      Number(data.Self_Employed) || 0,
      Number(data.ApplicantIncome) || 0,
      Number(data.CoapplicantIncome) || 0,
      Number(data.LoanAmount) || 0,
      Number(data.Loan_Amount_Term) || 360,
      Number(data.Credit_History) !== undefined ? Number(data.Credit_History) : 1.0,
      Number(data.Property_Area) || 0
    ];

    // Standardize features using the exact scaler mean & scale
    const scaled = rawFeatures.map((val, i) => (val - modelData.mean[i]) / modelData.scale[i]);

    // Compute Euclidean distance to all 491 training points
    const distances = [];
    for (let i = 0; i < modelData.X_train.length; i++) {
      const pt = modelData.X_train[i];
      let sumSq = 0;
      for (let j = 0; j < scaled.length; j++) {
        const diff = scaled[j] - pt[j];
        sumSq += diff * diff;
      }
      distances.push({ dist: Math.sqrt(sumSq), y: modelData.y_train[i] });
    }

    // Sort by distance ascending
    distances.sort((a, b) => a.dist - b.dist);

    // K-nearest neighbors (k = 17)
    const k = modelData.n_neighbors || 17;
    const topK = distances.slice(0, k);

    // Calculate voting consensus
    const approvedCount = topK.filter(n => n.y === 1).length;
    const probability = approvedCount / k;
    const isApproved = probability >= 0.5;

    return NextResponse.json({
      loan_status: isApproved ? 'Approved' : 'Rejected',
      approval_probability: Math.round(probability * 10000) / 10000,
      neighbors_approved: approvedCount,
      total_neighbors: k
    });
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to process prediction request', details: error.message },
      { status: 500 }
    );
  }
}
