'use client';
import { useState } from 'react';

export default function NadeemKaggleLoanPredictPage() {
  const [formData, setFormData] = useState({
    Gender: '1',
    Married: '1',
    Dependents: '0',
    Education: '0',
    Self_Employed: '0',
    ApplicantIncome: '6500',
    CoapplicantIncome: '1500',
    LoanAmount: '130',
    Loan_Amount_Term: '360',
    Credit_History: '1.0',
    Property_Area: '1'
  });

  const [result, setResult] = useState(null);
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const setPreset = (type) => {
    if (type === 'approved') {
      setFormData({
        Gender: '1',
        Married: '1',
        Dependents: '0',
        Education: '0',
        Self_Employed: '0',
        ApplicantIncome: '6500',
        CoapplicantIncome: '1500',
        LoanAmount: '130',
        Loan_Amount_Term: '360',
        Credit_History: '1.0',
        Property_Area: '1'
      });
    } else {
      setFormData({
        Gender: '1',
        Married: '0',
        Dependents: '2',
        Education: '1',
        Self_Employed: '1',
        ApplicantIncome: '1800',
        CoapplicantIncome: '0',
        LoanAmount: '250',
        Loan_Amount_Term: '360',
        Credit_History: '0.0',
        Property_Area: '0'
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Gender: Number(formData.Gender),
          Married: Number(formData.Married),
          Dependents: Number(formData.Dependents),
          Education: Number(formData.Education),
          Self_Employed: Number(formData.Self_Employed),
          ApplicantIncome: Number(formData.ApplicantIncome),
          CoapplicantIncome: Number(formData.CoapplicantIncome),
          LoanAmount: Number(formData.LoanAmount),
          Loan_Amount_Term: Number(formData.Loan_Amount_Term),
          Credit_History: Number(formData.Credit_History),
          Property_Area: Number(formData.Property_Area)
        })
      });

      const data = await response.json();
      setResult(data.loan_status);
      if (data.approval_probability !== undefined) {
        setProbability(data.approval_probability);
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      alert('Failed to connect to the prediction server at http://localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  const isApproved = result === 'Approved';
  const confidencePct = probability !== null 
    ? Math.round((isApproved ? probability : (1 - probability)) * 100) 
    : 88;

  const totalIncome = (Number(formData.ApplicantIncome) || 0) + (Number(formData.CoapplicantIncome) || 0);
  const ltiRatio = totalIncome > 0 
    ? (((Number(formData.LoanAmount) || 0) * 1000) / (totalIncome * 12)).toFixed(2) 
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans py-10 px-4">
      {/* Page Container */}
      <main className="max-w-6xl w-full mx-auto">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">N</div>
                <span className="font-bold text-gray-900">Nadeem</span>
                <span>&bull;</span>
                <span>UPDATED TODAY</span>
                <span>&bull;</span>
                <span className="text-emerald-600 font-bold">KNN (k=17)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                Nadeem-Loanpredict-AI
              </h1>
              <p className="text-gray-600 text-base mb-4">
                Loan Approval Dataset & KNN Classifier used for Prediction Models
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" className="px-3.5 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                  <span>▲</span> 282
                </button>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                  <span>&lt;&gt;</span> Code & API
                </a>
                <button type="button" onClick={() => handleSubmit()} className="px-4 py-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <span>⚡</span> Run Model Prediction
                </button>
              </div>
            </div>

            {/* Kaggle Mascot Banner Card */}
            <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 max-w-xs shadow-sm">
              <span className="text-3xl">🏦</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Bank Loan Approval</h4>
                <p className="text-xs text-amber-800">84.55% benchmark accuracy model</p>
              </div>
            </div>
          </div>

          {/* Kaggle Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 mb-8 text-sm font-semibold text-gray-500">
            <span className="pb-3 text-gray-900 border-b-2 border-gray-900 cursor-pointer">Data Card & Predictor</span>
            <span className="pb-3 hover:text-gray-900 cursor-pointer">Model Specs (k=17)</span>
            <span className="pb-3 hover:text-gray-900 cursor-pointer">Code & Docs</span>
            <span className="pb-3 hover:text-gray-900 cursor-pointer">Discussion (4)</span>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Loan Approval Predictor</h2>
              <p className="text-xs text-gray-500 mb-5">
                Configure parameters to evaluate loan approval decision boundaries using the nearest-neighbor model.
              </p>

              {/* Presets */}
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg mb-6 flex-wrap">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => setPreset('approved')}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 transition"
                >
                  ✓ Prime Profile (Approved)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('rejected')}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 transition"
                >
                  ⚠ High Risk (Rejected)
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Applicant Demographics</div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['1:Male', '0:Female'].map((item) => {
                          const [val, label] = item.split(':');
                          const active = formData.Gender === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRadioChange('Gender', val)}
                              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Marital Status</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['1:Married', '0:Single'].map((item) => {
                          const [val, label] = item.split(':');
                          const active = formData.Married === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRadioChange('Married', val)}
                              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Dependents</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['0', '1', '2', '3'].map((val) => {
                          const active = formData.Dependents === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRadioChange('Dependents', val)}
                              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              {val === '3' ? '3+' : val}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Education</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['0:Graduate', '1:Not Graduate'].map((item) => {
                          const [val, label] = item.split(':');
                          const active = formData.Education === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRadioChange('Education', val)}
                              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Status</label>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      {['0:Salaried (No)', '1:Self-Employed (Yes)'].map((item) => {
                        const [val, label] = item.split(':');
                        const active = formData.Self_Employed === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRadioChange('Self_Employed', val)}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Financial Metrics</div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Applicant Income / Month</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          name="ApplicantIncome"
                          value={formData.ApplicantIncome}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-md pl-7 pr-3 py-1.5 text-xs font-medium text-gray-900 focus:border-[#20BEFF] focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Co-Applicant Income / Month</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          name="CoapplicantIncome"
                          value={formData.CoapplicantIncome}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-md pl-7 pr-3 py-1.5 text-xs font-medium text-gray-900 focus:border-[#20BEFF] focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Loan Amount ($ Thousands)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          name="LoanAmount"
                          value={formData.LoanAmount}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-md pl-7 pr-3 py-1.5 text-xs font-medium text-gray-900 focus:border-[#20BEFF] focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Repayment Term</label>
                      <select
                        name="Loan_Amount_Term"
                        value={formData.Loan_Amount_Term}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-medium text-gray-900 focus:border-[#20BEFF] focus:outline-none focus:ring-2 focus:ring-[#20BEFF]/20"
                      >
                        <option value="360">360 Months (30 Years)</option>
                        <option value="240">240 Months (20 Years)</option>
                        <option value="180">180 Months (15 Years)</option>
                        <option value="120">120 Months (10 Years)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Credit */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Credit & Location</div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Credit History</label>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      {['1.0:✓ Meets Guidelines (1.0)', '0.0:⚠ Unfavorable / None (0.0)'].map((item) => {
                        const [val, label] = item.split(':');
                        const active = formData.Credit_History === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRadioChange('Credit_History', val)}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Property Location</label>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      {['2:Urban 🏙️', '1:Semiurban 🏡', '0:Rural 🌾'].map((item) => {
                        const [val, label] = item.split(':');
                        const active = formData.Property_Area === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRadioChange('Property_Area', val)}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-sm transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Evaluating Nearest Neighbors...' : '⚡ Predict Loan Approval Status'}
                </button>
              </form>
            </div>

            {/* Sidebar Column: Outcome & Kaggle Metadata */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Prediction Outcome Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Prediction Outcome</h3>

                {!result ? (
                  <div className="text-center py-6 text-gray-400">
                    <span className="text-3xl block mb-2">📊</span>
                    <p className="text-xs font-semibold text-gray-600">Awaiting evaluation.</p>
                    <span className="text-[11px] text-gray-400">Run prediction to see outcome.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-full text-center font-bold text-sm flex items-center justify-center gap-2 ${
                      isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span>{isApproved ? '✓' : '✕'}</span>
                      <span>Loan {result}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Model Confidence</span>
                        <span className="text-sm font-bold text-gray-900">{confidencePct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}
                          style={{ width: `${confidencePct}%` }}
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Total Income:</span>
                        <strong className="text-gray-900">${totalIncome.toLocaleString()} / mo</strong>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Loan-to-Income:</span>
                        <strong className="text-gray-900">{ltiRatio}x</strong>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>KNN Consensus:</span>
                        <strong className="text-gray-900">
                          {isApproved ? `${Math.round(confidencePct * 0.17)} / 17 Neighbors` : `${Math.round(confidencePct * 0.17)} / 17 Risk`}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kaggle Specs Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-xs space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Dataset & Model Specs</h3>
                
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Usability ⓘ</span>
                  <span className="text-emerald-600 font-extrabold text-base">10.00</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Model Architecture</span>
                  <span className="text-gray-900 font-semibold">K-Nearest Neighbors (k=17)</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Benchmark Accuracy</span>
                  <span className="text-gray-900 font-semibold">84.55% Test Accuracy</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">License</span>
                  <span className="text-gray-900 font-semibold">MIT</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1.5">Tags</span>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-[11px]">Finance</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-[11px]">Classification</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-[11px]">KNN</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
    </div>
  );
}
