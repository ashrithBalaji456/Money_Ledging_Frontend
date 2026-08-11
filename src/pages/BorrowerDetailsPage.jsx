import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PaymentModal from '../components/PaymentModal';
import { ArrowLeft, Phone, MapPin, Award, FileText, Calendar, PlusCircle, RefreshCw, Download } from 'lucide-react';
import { generateBorrowerStatement, generateLoanStatement } from '../services/statementPdf';

const BorrowerDetailsPage = () => {
  const { id } = useParams();
  const [borrower, setBorrower] = useState(null);
  const [loans, setLoans] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({}); // Key: loanId, Value: list of payments
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchBorrowerDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch borrower profile
      const borrowerRes = await api.get(`/api/borrowers/${id}`);
      setBorrower(borrowerRes.data);

      // 2. Fetch loans for this borrower
      const loansRes = await api.get(`/api/loans/borrower/${id}`);
      const borrowerLoans = loansRes.data;
      setLoans(borrowerLoans);

      // 3. Fetch installments for each loan
      const paymentsPromises = borrowerLoans.map(loan => 
        api.get(`/api/payments/loan/${loan.id}`).then(res => ({
          loanId: loan.id,
          payments: res.data
        }))
      );
      
      const paymentsResults = await Promise.all(paymentsPromises);
      const tempPaymentsMap = {};
      paymentsResults.forEach(item => {
        tempPaymentsMap[item.loanId] = item.payments;
      });
      setPaymentsMap(tempPaymentsMap);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch borrower profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowerDetails();
  }, [id]);

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchBorrowerDetails(); // Refresh everything
  };

  if (isLoading && !borrower) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="text-slate-400 font-semibold">Loading details...</p>
      </div>
    );
  }

  if (error || !borrower) {
    return (
      <div className="space-y-4">
        <Link to="/borrowers" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-semibold mb-2 btn-animate">
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Borrowers
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl font-bold">
          {error || 'Borrower not found.'}
        </div>
      </div>
    );
  }

  // Calculate cumulative stats for this borrower
  const totalBorrowed = loans.reduce((acc, curr) => curr.status !== 'CANCELLED' ? acc + curr.principalAmount : acc, 0);
  const totalRemaining = loans.reduce((acc, curr) => curr.status !== 'CANCELLED' ? acc + curr.remainingAmount : acc, 0);
  const totalPaid = loans.reduce((acc, curr) => {
    if (curr.status === 'CANCELLED') return acc;
    return acc + (curr.totalPayableAmount - curr.remainingAmount);
  }, 0);

  return (
    <div className="space-y-8 font-sans animate-slide-up">
      {/* Back button and title */}
      <div className="space-y-2">
        <Link to="/borrowers" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-semibold mb-2 btn-animate">
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Borrowers
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{borrower.fullName}</h2>
            <p className="text-sm text-slate-400 font-semibold mt-0.5">Borrower details and complete loan ledger history.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => generateBorrowerStatement(borrower, loans, paymentsMap)}
              className="inline-flex items-center gap-2 self-start px-4 py-2.5 bg-white/5 border border-white/10 text-slate-200 rounded-xl text-sm font-extrabold hover:bg-white/10 shadow-sm transition-all duration-300 btn-animate cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              Download Statement
            </button>
            <Link
              to="/add-loan"
              className="inline-flex items-center gap-2 self-start px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-xl text-sm font-extrabold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/10 transition-all duration-300 btn-animate cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Give New Loan
            </Link>
          </div>
        </div>
      </div>

      {/* Profile & Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 card-animate">
        
        {/* Profile Card */}
        <div className="glass-card bg-slate-900/35 rounded-2xl border border-white/5 p-6 shadow-xl space-y-5 md:col-span-1">
          <h3 className="font-extrabold text-slate-300 text-xs uppercase tracking-widest border-b border-white/5 pb-2">
            Contact Information
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 text-slate-300">
              <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-amber-400">
                <Phone className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Number</p>
                <p className="font-bold text-slate-100 mt-0.5">{borrower.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-amber-400">
                <MapPin className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Home Address</p>
                <p className="font-semibold text-slate-200 mt-0.5 leading-relaxed">{borrower.address || 'No address added'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-amber-400">
                <Award className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aadhaar Last 4</p>
                <p className="font-bold text-slate-100 mt-0.5">{borrower.aadharLastFourDigits ? `xxxx-xxxx-${borrower.aadharLastFourDigits}` : 'Not provided'}</p>
              </div>
            </div>
            {borrower.notes && (
              <div className="flex items-start gap-3 text-slate-300">
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-amber-400">
                  <FileText className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Notes</p>
                  <p className="text-xs text-slate-400 italic mt-0.5 leading-relaxed">{borrower.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="glass-card bg-slate-900/35 rounded-2xl border border-white/5 p-6 shadow-xl md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-300 text-xs uppercase tracking-widest border-b border-white/5 pb-2">
            Overall Financial Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Borrowed</p>
              <h4 className="text-2xl font-extrabold text-slate-100 mt-1">₹{totalBorrowed.toFixed(2)}</h4>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">Sum of principal loans</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Total Paid Back</p>
              <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalPaid.toFixed(2)}</h4>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">Principal + interest paid</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Total Outstanding</p>
              <h4 className="text-2xl font-extrabold text-amber-400 mt-1">₹{totalRemaining.toFixed(2)}</h4>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">Owed balance remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans & Installment Schedules */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">Active & Historical Loans</h3>
        
        {loans.length === 0 ? (
          <div className="glass-card bg-slate-900/35 rounded-2xl border border-white/5 p-8 text-center text-slate-500 font-medium">
            No loans have been recorded for this borrower yet.
          </div>
        ) : (
          loans.map((loan, index) => {
            const installments = paymentsMap[loan.id] || [];
            return (
              <div key={loan.id} className="glass-card bg-slate-900/35 rounded-2xl border border-white/5 shadow-2xl overflow-hidden space-y-4 card-animate">
                
                {/* Loan Header info */}
                <div className="bg-slate-950/45 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-amber-400">Loan #{index + 1}</h4>
                      <StatusBadge status={loan.status} />
                      <button
                        onClick={() => generateLoanStatement(borrower, loan, index + 1, installments)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[10px] font-bold hover:bg-white/10 btn-animate cursor-pointer"
                        title="Download Loan Statement"
                      >
                        <Download className="h-3 w-3" />
                        Statement
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Started on: {loan.loanStartDate}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Principal Amount</span>
                      <strong className="text-slate-100 font-bold">₹{loan.principalAmount.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Interest Rate</span>
                      <strong className="text-slate-100 font-bold">{loan.interestRate}% ({loan.interestRateType})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Payable</span>
                      <strong className="text-amber-400 font-bold">₹{loan.totalPayableAmount.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Remaining Amount</span>
                      <strong className="text-red-400 font-bold">₹{loan.remainingAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Installment Table */}
                <div className="px-6 pb-6">
                  <h5 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">Repayment Schedule</h5>
                  
                  <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950/20 text-slate-400 font-bold uppercase border-b border-white/5 text-[9px] tracking-wider">
                          <th className="py-2.5 px-4 w-12 text-center">#</th>
                          <th className="py-2.5 px-4">Due Date</th>
                          <th className="py-2.5 px-4">Expected</th>
                          <th className="py-2.5 px-4">Paid</th>
                          <th className="py-2.5 px-4">Remaining</th>
                          <th className="py-2.5 px-4">Paid Date</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {installments.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center text-slate-500 py-4 font-medium">Generating installment list...</td>
                          </tr>
                        ) : (
                          installments.map((pmt) => {
                            const rem = pmt.expectedAmount - pmt.paidAmount;
                            return (
                              <tr key={pmt.id} className="hover:bg-white/2 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-100 text-center">{pmt.installmentNumber}</td>
                                <td className="py-3 px-4 text-slate-200 font-semibold">{pmt.dueDate}</td>
                                <td className="py-3 px-4 text-slate-400 font-medium">₹{pmt.expectedAmount.toFixed(2)}</td>
                                <td className="py-3 px-4 text-emerald-400 font-semibold">₹{pmt.paidAmount.toFixed(2)}</td>
                                <td className="py-3 px-4 text-slate-100 font-bold">
                                  {rem > 0 ? `₹${rem.toFixed(2)}` : '₹0.00'}
                                </td>
                                <td className="py-3 px-4 text-slate-300 font-medium">{pmt.paidDate || '—'}</td>
                                <td className="py-3 px-4">
                                  <StatusBadge status={pmt.status} />
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {rem > 0 ? (
                                    <button
                                      onClick={() => openPaymentModal(pmt)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-lg text-[10px] font-extrabold hover:from-amber-500 hover:to-orange-600 shadow-md shadow-amber-500/10 transition-all btn-animate cursor-pointer"
                                    >
                                      Mark Paid
                                    </button>
                                  ) : (
                                    <span className="text-emerald-400 font-extrabold text-[10px]">Settled</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })
        )}
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

export default BorrowerDetailsPage;
