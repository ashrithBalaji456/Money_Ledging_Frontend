import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PaymentModal from '../components/PaymentModal';
import { DollarSign, Clock, AlertTriangle, CheckCircle, FileText, ArrowRight, RefreshCw, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [summaryRes, overdueRes, dueSoonRes, recentRes] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/dashboard/overdue'),
        api.get('/api/dashboard/due-soon'),
        api.get('/api/dashboard/recent-payments'),
      ]);

      setSummary(summaryRes.data);
      setOverdue(overdueRes.data);
      setDueSoon(dueSoonRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch dashboard metrics. Please make sure the backend is active.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchDashboardData(); // Refresh all stats
  };

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
        <p className="text-slate-400 font-semibold">Loading ledger records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Ledger Summary
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">Here is the state of your money lending notebook today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 self-start px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 shadow-sm transition-all duration-300 btn-animate cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 card-animate">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold">Database connection error</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 card-animate">
          
          <div className="glass-card bg-slate-900/35 p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Money Lent</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">₹{summary.totalLent.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Total principal given away</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-md">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card bg-slate-900/35 p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-300" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Money Collected</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">₹{summary.totalCollected.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Principal + interest collected</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-md">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card bg-slate-900/35 p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outstanding Receivable</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1">₹{summary.outstanding.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Remaining amount to be paid</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-md">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Urgent Payments: Overdue & Due Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-animate">
        
        {/* Overdue Payments Card */}
        <div className="glass-card bg-slate-900/30 rounded-2xl border border-red-500/15 shadow-2xl overflow-hidden">
          <div className="bg-red-950/20 px-6 py-4 border-b border-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              <h3 className="font-extrabold text-red-400 text-sm uppercase tracking-wider">🔴 Overdue Payments</h3>
            </div>
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {overdue.length} Late
            </span>
          </div>
          
          <div className="p-6 divide-y divide-white/5 max-h-96 overflow-y-auto">
            {overdue.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm font-medium">✓ No overdue payments! Good job.</p>
            ) : (
              overdue.map((payment) => (
                <div key={payment.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-100 text-base">{payment.borrowerName}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="text-red-400 font-bold">Late by {payment.lateDays} days</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-500" /> Due: {payment.dueDate}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-200">
                      Owed: <span className="text-red-400">₹{(payment.expectedAmount - payment.paidAmount).toFixed(2)}</span>{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        (of ₹{payment.expectedAmount.toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openPaymentModal(payment)}
                    className="shrink-0 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/10 hover:from-red-600 hover:to-rose-700 transition-colors btn-animate cursor-pointer"
                  >
                    Collect Pay
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payments Due Soon Card */}
        <div className="glass-card bg-slate-900/30 rounded-2xl border border-amber-500/15 shadow-2xl overflow-hidden">
          <div className="bg-amber-950/20 px-6 py-4 border-b border-amber-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <h3 className="font-extrabold text-amber-400 text-sm uppercase tracking-wider">🟠 Due within 3 Days</h3>
            </div>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {dueSoon.length} Due
            </span>
          </div>

          <div className="p-6 divide-y divide-white/5 max-h-96 overflow-y-auto">
            {dueSoon.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm font-medium">No payments due in the next 3 days.</p>
            ) : (
              dueSoon.map((payment) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)));
                const remainingText = daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `Due in ${daysLeft} days`;
                return (
                  <div key={payment.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 text-base">{payment.borrowerName}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="text-amber-400 font-bold">{remainingText}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-500" /> Due: {payment.dueDate}</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-200">
                        Owed: <span className="text-amber-400">₹{(payment.expectedAmount - payment.paidAmount).toFixed(2)}</span>{' '}
                        <span className="text-[10px] text-slate-500 font-normal">
                          (of ₹{payment.expectedAmount.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openPaymentModal(payment)}
                      className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-xl text-xs font-extrabold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/10 transition-colors btn-animate cursor-pointer"
                    >
                      Collect Pay
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Recent Payments Section */}
      <div className="glass-card bg-slate-900/30 rounded-2xl border border-white/5 shadow-2xl overflow-hidden card-animate">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">🟢 Recent Payments Received</h3>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Latest history</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/20 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-white/5">
                <th className="py-3 px-6">Borrower</th>
                <th className="py-3 px-6">Expected Amount</th>
                <th className="py-3 px-6">Amount Paid</th>
                <th className="py-3 px-6">Received Date</th>
                <th className="py-3 px-6">Installment</th>
                <th className="py-3 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-slate-500 py-8 font-medium">No payments received yet.</td>
                </tr>
              ) : (
                recent.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-100">
                      <Link to={`/borrowers/${payment.borrowerId}`} className="hover:underline hover:text-amber-400">
                        {payment.borrowerName}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">₹{payment.expectedAmount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">₹{payment.paidAmount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{payment.paidDate}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">#{payment.installmentNumber}</td>
                    <td className="py-4 px-6 text-slate-500 italic text-xs max-w-xs truncate">{payment.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Dashboard;
