import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, UserPlus, Eye, Edit, Trash2, AlertCircle, Phone, MapPin, FileText, Info, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomDatePicker from '../components/CustomDatePicker';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#0f172a]/45 border border-white/10 rounded-xl text-slate-200 text-xs px-3 h-9 cursor-pointer focus:outline-none"
      >
        <span className="font-semibold">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-full min-w-[120px] glass-panel bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl card-animate">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BorrowerListPage = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilterType, setDateFilterType] = useState('due'); // 'due' or 'taken'
  const [dateFilterValue, setDateFilterValue] = useState(''); // 'YYYY-MM-DD'

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [aadharLastFour, setAadharLastFour] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBorrowers = async (query = '') => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/borrowers${query ? `?query=${encodeURIComponent(query)}` : ''}`);
      setBorrowers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch borrowers. Please verify database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers(searchQuery);
  }, [searchQuery]);

  const handleOpenAdd = () => {
    setFullName('');
    setPhoneNumber('');
    setAddress('');
    setAadharLastFour('');
    setNotes('');
    setFormError('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (borrower) => {
    setSelectedBorrower(borrower);
    setFullName(borrower.fullName);
    setPhoneNumber(borrower.phoneNumber);
    setAddress(borrower.address || '');
    setAadharLastFour(borrower.aadharLastFourDigits || '');
    setNotes(borrower.notes || '');
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (borrower) => {
    setSelectedBorrower(borrower);
    setIsDeleteOpen(true);
  };

  const handleAddBorrower = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    if (!fullName.trim() || !phoneNumber.trim()) {
      setFormError('Name and Phone Number are required.');
      setIsSaving(false);
      return;
    }

    try {
      await api.post('/api/borrowers', {
        fullName,
        phoneNumber,
        address,
        aadharLastFourDigits: aadharLastFour,
        notes,
      });
      setIsAddOpen(false);
      fetchBorrowers(searchQuery);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to add borrower. Check formatting.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBorrower = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      await api.put(`/api/borrowers/${selectedBorrower.id}`, {
        fullName,
        phoneNumber,
        address,
        aadharLastFourDigits: aadharLastFour,
        notes,
      });
      setIsEditOpen(false);
      fetchBorrowers(searchQuery);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to update borrower.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBorrower = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/api/borrowers/${selectedBorrower.id}`);
      setIsDeleteOpen(false);
      fetchBorrowers(searchQuery);
    } catch (err) {
      console.error(err);
      setError('Failed to delete borrower.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBorrowers = borrowers.filter(borrower => {
    if (dateFilterValue) {
      if (dateFilterType === 'taken') {
        return borrower.loanStartDate === dateFilterValue;
      } else {
        return borrower.nextPaymentDate === dateFilterValue;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Borrowers List
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">Create, edit, and search people who have active loans.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-xl text-sm font-extrabold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/10 transition-all duration-300 btn-animate cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Add Borrower
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 card-animate">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-30">
        {/* Text Search */}
        <div className="lg:col-span-2 glass-card bg-slate-900/35 p-3.5 rounded-2xl border border-white/5 shadow-xl flex items-center gap-3">
          <Search className="text-slate-500 h-5 w-5 shrink-0" />
          <input
            type="text"
            placeholder="Search borrowers by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 p-0 text-slate-100 placeholder-slate-500 focus:ring-0 text-sm focus:outline-none"
          />
        </div>

        {/* Date Filter */}
        <div className="lg:col-span-1 glass-card bg-slate-900/35 p-3.5 rounded-2xl border border-white/5 shadow-xl flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">Date:</span>
          
          <CustomSelect
            value={dateFilterType}
            onChange={setDateFilterType}
            options={[
              { value: 'due', label: 'Due Date' },
              { value: 'taken', label: 'Taken Date' }
            ]}
          />

          <div className="flex-1 min-w-[120px]">
            <CustomDatePicker
              value={dateFilterValue}
              onChange={setDateFilterValue}
              placeholder="dd-mm-yyyy"
            />
          </div>

          {dateFilterValue && (
            <button
              type="button"
              onClick={() => setDateFilterValue('')}
              className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg btn-animate cursor-pointer h-9 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card bg-slate-900/30 rounded-2xl border border-white/5 shadow-2xl overflow-hidden card-animate">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/20 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-white/5">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Phone Number</th>
                <th className="py-3 px-6">Active Loans</th>
                <th className="py-3 px-6">Outstanding Owed</th>
                <th className="py-3 px-6">Loan Taken Date</th>
                <th className="py-3 px-6">Next Due Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading && filteredBorrowers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-slate-500 py-10 font-medium">Loading borrowers...</td>
                </tr>
              ) : filteredBorrowers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-slate-500 py-10 font-medium">
                    No active borrowers found matching your search or date filter.
                  </td>
                </tr>
              ) : (
                filteredBorrowers.map((borrower) => (
                  <tr key={borrower.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-100">
                      <Link to={`/borrowers/${borrower.id}`} className="hover:underline hover:text-amber-400">
                        {borrower.fullName}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        {borrower.phoneNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">
                      {borrower.activeLoans > 0 ? (
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg text-xs border border-blue-500/20 font-bold">
                          {borrower.activeLoans} Active
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-normal">No active loans</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-100 font-bold">
                      {borrower.outstandingAmount > 0 ? (
                        <span className="text-amber-400">₹{borrower.outstandingAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">₹0.00</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">
                      {borrower.loanStartDate ? (
                        <span className="text-slate-300">{borrower.loanStartDate}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">
                      {borrower.nextPaymentDate ? (
                        <span className="text-slate-300">{borrower.nextPaymentDate}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <Link
                        to={`/borrowers/${borrower.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-200 rounded-lg text-xs font-bold hover:bg-white/10 btn-animate"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(borrower)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 btn-animate cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(borrower)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 btn-animate cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Borrower Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="relative bg-[#0d111d] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden card-animate">
            <div className="bg-slate-950 text-slate-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-base font-bold text-amber-400">Add New Borrower</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddBorrower} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 101, Green Heights, Delhi"
                  className="block w-full glass-input text-sm h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar (Last 4 Digits)</label>
                <input
                  type="text"
                  maxLength="4"
                  value={aadharLastFour}
                  onChange={(e) => setAadharLastFour(e.target.value)}
                  placeholder="e.g. 1234 (optional)"
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Trusted customer, references from Suresh"
                  className="block w-full glass-input text-sm h-16 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 btn-animate cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 btn-animate cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isSaving ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Borrower Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="relative bg-[#0d111d] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden card-animate">
            <div className="bg-slate-950 text-slate-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-base font-bold text-amber-400">Edit Borrower Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleEditBorrower} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full glass-input text-sm h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar (Last 4)</label>
                <input
                  type="text"
                  maxLength="4"
                  value={aadharLastFour}
                  onChange={(e) => setAadharLastFour(e.target.value)}
                  className="block w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full glass-input text-sm h-16 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 btn-animate cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 btn-animate cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Borrower Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="relative bg-[#0d111d] w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden p-6 card-animate space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Borrower</h3>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Are you willing to delete the borrower <strong>{selectedBorrower?.fullName}</strong>?
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-400">
              <Info className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                This will soft-delete their profile. Existing loans and financial records will remain saved for tax and repayment history.
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-2 px-3 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 btn-animate cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBorrower}
                disabled={isSaving}
                className="flex-1 py-2 px-3 border border-transparent rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 btn-animate cursor-pointer shadow-lg shadow-red-500/10"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerListPage;
