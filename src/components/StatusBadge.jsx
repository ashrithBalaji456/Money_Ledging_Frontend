import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase() : 'UPCOMING';

  const config = {
    PAID: {
      text: 'PAID',
      style: 'bg-green-50 text-green-700 border-green-200',
    },
    DUE_SOON: {
      text: 'DUE SOON',
      style: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    },
    OVERDUE: {
      text: 'OVERDUE',
      style: 'bg-red-50 text-red-700 border-red-200 font-bold',
    },
    UPCOMING: {
      text: 'UPCOMING',
      style: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    PARTIALLY_PAID: {
      text: 'PARTIAL',
      style: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    ACTIVE: {
      text: 'ACTIVE',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    COMPLETED: {
      text: 'COMPLETED',
      style: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    CANCELLED: {
      text: 'CANCELLED',
      style: 'bg-gray-100 text-gray-500 border-gray-200',
    },
  };

  const current = config[normalized] || config.UPCOMING;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.style}`}>
      {current.text}
    </span>
  );
};

export default StatusBadge;
