import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Edit3, AlertCircle } from 'lucide-react';
import api from '../services/api';
import CustomDatePicker from './CustomDatePicker';

const PaymentModal = ({ isOpen, onClose, payment, onSuccess }) => {
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set default values when modal opens or payment changes
  useEffect(() => {
    if (payment) {
      const remaining = payment.expectedAmount - payment.paidAmount;
      setPaidAmount(remaining.toFixed(2));
      setPaidDate(new Date().toISOString().split('T')[0]); // Today's date
      setNotes('');
      setError('');
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const remainingExpected = payment.expectedAmount - payment.paidAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const amountNum = parseFloat(paidAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive payment amount.');
      setIsLoading(false);
      return;
    }

    if (amountNum > remainingExpected) {
      setError(`Payment amount cannot exceed outstanding balance of ₹${remainingExpected.toFixed(2)}.`);
      setIsLoading(false);
      return;
    }

    try {
      const isPartial = amountNum < remainingExpected;
      const endpoint = isPartial 
        ? `/api/payments/${payment.id}/partial-payment`
        : `/api/payments/${payment.id}/pay`;

      await api.post(endpoint, {
        paidAmount: amountNum,
        paidDate,
        notes
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to record payment. Please check inputs and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
      <div className="relative bg-[#0d111d] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden font-sans text-slate-100 card-animate">
        
        {/* Header */}
        <div className="bg-slate-950 text-slate-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-amber-400">Record Payment</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Installment #{payment.installmentNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-slate-950/20 rounded-xl p-4 border border-white/5 text-sm space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Borrower:</span>
              <strong className="text-slate-100 font-bold">{payment.borrowerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Installment Total:</span>
              <span className="text-slate-300 font-semibold">₹{payment.expectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Already Paid:</span>
              <span className="text-emerald-400 font-semibold">₹{payment.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
              <span className="text-slate-200">Remaining Balance:</span>
              <span className="text-amber-400">₹{remainingExpected.toFixed(2)}</span>
            </div>
          </div>

          {/* Input: Paid Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Paid Amount (₹)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <span className="text-sm font-semibold">₹</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="block w-full pl-8 glass-input text-slate-100 text-sm focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Adjust amount below ₹{remainingExpected.toFixed(2)} to record a partial payment.
            </span>
          </div>

          {/* Input: Date */}
          <CustomDatePicker
            label="Payment Date"
            value={paidDate}
            onChange={(val) => setPaidDate(val)}
          />

          {/* Input: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-500">
                <Edit3 className="h-4 w-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full pl-9 glass-input text-slate-100 text-sm h-20 resize-none focus:outline-none"
                placeholder="e.g. Cash payment, GPay ID..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 btn-animate cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 btn-animate cursor-pointer shadow-amber-500/10"
            >
              {isLoading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
