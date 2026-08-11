import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { DollarSign, Percent, Calendar, Clock, Edit3, ArrowRight, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import CustomDatePicker from '../components/CustomDatePicker';

const CustomDropdown = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between glass-input text-sm text-left focus:outline-none cursor-pointer"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute z-30 mt-1.5 w-full glass-panel bg-slate-950/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto card-animate">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                {placeholder || 'No options available'}
              </div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 text-sm transition-colors hover:bg-white/5 cursor-pointer border-b border-white/2 last:border-b-0 ${
                    String(opt.value) === String(value)
                      ? 'text-amber-400 font-extrabold bg-white/2'
                      : 'text-slate-300 font-medium'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

const AddLoanPage = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('100000');
  const [interestType, setInterestType] = useState('SIMPLE_INTEREST'); // SIMPLE_INTEREST or FIXED_INTEREST
  const [interestRate, setInterestRate] = useState('12');
  const [interestRateType, setInterestRateType] = useState('ANNUAL');
  const [customInterestAmount, setCustomInterestAmount] = useState('10000');
  const [loanStartDate, setLoanStartDate] = useState('');
  const [durationInMonths, setDurationInMonths] = useState('12');
  const [notes, setNotes] = useState('');

  // Preview & Submit States
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Load borrowers and set default date
  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const response = await api.get('/api/borrowers');
        setBorrowers(response.data);
        if (response.data.length > 0) {
          setSelectedBorrowerId(response.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch borrowers list. Make sure database is running.');
      }
    };
    fetchBorrowers();
    setLoanStartDate(new Date().toISOString().split('T')[0]); // Default to today
  }, []);

  // Update preview whenever input parameters change
  useEffect(() => {
    const fetchPreview = async () => {
      setError('');
      const principal = parseFloat(principalAmount);
      const duration = parseInt(durationInMonths);

      if (isNaN(principal) || principal <= 0 || isNaN(duration) || duration <= 0 || !loanStartDate) {
        setPreview(null);
        return;
      }

      // Check fields specific to interest types
      if (interestType === 'SIMPLE_INTEREST') {
        const rate = parseFloat(interestRate);
        if (isNaN(rate) || rate < 0) {
          setPreview(null);
          return;
        }
      } else {
        const fixedAmt = parseFloat(customInterestAmount);
        if (isNaN(fixedAmt) || fixedAmt < 0) {
          setPreview(null);
          return;
        }
      }

      try {
        const payload = {
          borrowerId: selectedBorrowerId || 1,
          principalAmount: principal,
          interestType,
          durationInMonths: duration,
          loanStartDate,
        };

        if (interestType === 'SIMPLE_INTEREST') {
          payload.interestRate = parseFloat(interestRate);
          payload.interestRateType = interestRateType;
        } else {
          payload.interestRate = 0;
          payload.interestRateType = 'ANNUAL';
          payload.customInterestAmount = parseFloat(customInterestAmount);
        }

        const response = await api.post('/api/loans/preview', payload);
        setPreview(response.data);
      } catch (err) {
        console.error(err);
        setPreview(null);
      }
    };

    fetchPreview();
  }, [principalAmount, interestType, interestRate, interestRateType, customInterestAmount, loanStartDate, durationInMonths, selectedBorrowerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    if (!selectedBorrowerId) {
      setError('Please select a borrower.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        borrowerId: parseInt(selectedBorrowerId),
        principalAmount: parseFloat(principalAmount),
        interestType,
        durationInMonths: parseInt(durationInMonths),
        loanStartDate,
        notes,
      };

      if (interestType === 'SIMPLE_INTEREST') {
        payload.interestRate = parseFloat(interestRate);
        payload.interestRateType = interestRateType;
      } else {
        payload.interestRate = 0;
        payload.interestRateType = 'ANNUAL';
        payload.customInterestAmount = parseFloat(customInterestAmount);
      }

      await api.post('/api/loans', payload);

      // Redirect to borrower details page to view the generated schedule
      navigate(`/borrowers/${selectedBorrowerId}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create loan. Please check input parameters.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Convert borrowers list into dropdown options
  const borrowerOptions = borrowers.map((b) => ({
    value: b.id,
    label: `${b.fullName} (${b.phoneNumber})`,
  }));

  const periodOptions = [
    { value: 'ANNUAL', label: 'Annual Rate (e.g. 12% yearly)' },
    { value: 'MONTHLY', label: 'Monthly Rate (e.g. 2% monthly)' },
  ];

  return (
    <div className="space-y-6 font-sans animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Give New Loan
        </h2>
        <p className="text-sm text-slate-400 font-semibold mt-0.5 font-sans">Record a new money lending entry and automatically generate its monthly repayment schedule.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 card-animate">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <form onSubmit={handleSubmit} className="glass-card bg-slate-900/35 rounded-2xl border border-white/5 p-6 shadow-xl space-y-5 lg:col-span-2 card-animate">
          
          {/* Custom Select Borrower Dropdown */}
          <CustomDropdown
            label="Select Borrower"
            value={selectedBorrowerId}
            onChange={(val) => setSelectedBorrowerId(val)}
            options={borrowerOptions}
            placeholder="No active borrowers found. Add one first!"
          />

          {/* Interest Type Segments */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Interest Calculation Scheme</label>
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setInterestType('SIMPLE_INTEREST')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all btn-animate cursor-pointer ${
                  interestType === 'SIMPLE_INTEREST'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                Simple Interest Rate (%)
              </button>
              <button
                type="button"
                onClick={() => setInterestType('FIXED_INTEREST')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all btn-animate cursor-pointer ${
                  interestType === 'FIXED_INTEREST'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                Custom Fixed Interest (₹)
              </button>
            </div>
          </div>

          {/* Principal & Rate Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Principal Amount (₹)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span className="text-sm font-semibold">₹</span>
                </div>
                <input
                  type="number"
                  required
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="block w-full pl-8 glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {interestType === 'SIMPLE_INTEREST' ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interest Rate (%)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Percent className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="e.g. 12"
                    className="block w-full pl-9 glass-input text-sm focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fixed Interest Amount (₹)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <span className="text-sm font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={customInterestAmount}
                    onChange={(e) => setCustomInterestAmount(e.target.value)}
                    placeholder="e.g. 1000"
                    className="block w-full pl-8 glass-input text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Period Type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interestType === 'SIMPLE_INTEREST' ? (
              <CustomDropdown
                label="Interest Rate Period"
                value={interestRateType}
                onChange={(val) => setInterestRateType(val)}
                options={periodOptions}
              />
            ) : (
              <div className="flex flex-col justify-end">
                <span className="text-slate-500 text-xs italic pb-3">Fixed calculation returns fixed principal + custom interest.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration (Months)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  required
                  value={durationInMonths}
                  onChange={(e) => setDurationInMonths(e.target.value)}
                  placeholder="e.g. 3"
                  className="block w-full pl-9 glass-input text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Start Date */}
          <CustomDatePicker
            label="Loan Start Date"
            value={loanStartDate}
            onChange={(val) => setLoanStartDate(val)}
          />

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-500">
                <Edit3 className="h-4 w-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional loan notes/repayment terms..."
                className="block w-full pl-9 glass-input text-sm h-20 resize-none focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || borrowers.length === 0}
            className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 btn-animate shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Creating Loan...' : 'Create Loan & Repayment Schedule'}
          </button>
        </form>

        {/* Live Preview Card */}
        <div className="glass-card bg-slate-900/35 text-slate-100 rounded-2xl p-6 shadow-2xl border border-white/5 space-y-6 h-fit lg:col-span-1 card-animate relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-amber-400">Live Preview</h3>
          </div>

          {preview ? (
            <div className="space-y-4.5 text-sm">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Principal Amount</span>
                <p className="text-xl font-bold text-slate-100">₹{preview.principalAmount.toFixed(2)}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Interest Owed</span>
                <p className="text-xl font-bold text-amber-400">₹{preview.totalInterest.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Payable Amount</span>
                <p className="text-xl font-bold text-emerald-400">₹{preview.totalPayableAmount.toFixed(2)}</p>
              </div>

              <div className="border border-white/5 pt-4 space-y-1 bg-slate-950/20 p-3.5 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Estimated Monthly Payment</span>
                <p className="text-2xl font-extrabold text-amber-400">₹{preview.monthlyInstallment.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">Calculated for {durationInMonths} installments</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">
              Enter valid principal, interest, and duration to see real-time calculation preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLoanPage;
