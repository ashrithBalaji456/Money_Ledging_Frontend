import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to draw professional header and footer
const drawHeaderFooter = (doc, titleText, pageNumber, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  // Header background bar (slate-900 style)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11); // Amber-500 (#f59e0b)
  doc.text('LENDING NOTEBOOK', margin, 15);

  // Header Subtitle/Document Type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText.toUpperCase(), pageWidth - margin - doc.getTextWidth(titleText.toUpperCase()), 15);

  // Footer bar line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  // Footer text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Generated automatically by Money Lending Ledger System', margin, pageHeight - 10);
  
  const pageString = `Page ${pageNumber} of ${totalPages}`;
  doc.text(pageString, pageWidth - margin - doc.getTextWidth(pageString), pageHeight - 10);
};

// Helper to format currency
const formatINR = (amount) => {
  return `Rs. ${parseFloat(amount).toFixed(2)}`;
};

export const generateBorrowerStatement = (borrower, loans, paymentsMap) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let y = 35; // Start y position below header

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Borrower Account Statement', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN')}`, margin, y);
  y += 10;

  // --- BORROWER PROFILE BLOCK ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, y, pageWidth - (margin * 2), 40, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('BORROWER DETAILS', margin + 5, y + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600

  // Col 1: Name and Phone
  doc.text(`Full Name:`, margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.fullName, margin + 28, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone:`, margin + 5, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.phoneNumber, margin + 28, y + 20);

  // Col 2: Aadhaar and Address
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Aadhaar Last 4:`, margin + 95, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.aadharLastFourDigits ? `xxxx-xxxx-${borrower.aadharLastFourDigits}` : 'Not provided', margin + 125, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Address:`, margin + 95, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  
  // Wrap address text if it's long
  const addressText = borrower.address || 'No address added';
  const splitAddress = doc.splitTextToSize(addressText, pageWidth - margin - 125 - 5);
  doc.text(splitAddress, margin + 125, y + 20);

  // Notes row
  if (borrower.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Notes:`, margin + 5, y + 32);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(borrower.notes, margin + 28, y + 32);
  }

  y += 48;

  // --- OVERALL FINANCIAL SUMMARY ---
  const activeLoans = loans.filter(l => l.status !== 'CANCELLED');
  const totalBorrowed = activeLoans.reduce((acc, curr) => acc + curr.principalAmount, 0);
  const totalRemaining = activeLoans.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalPaid = activeLoans.reduce((acc, curr) => acc + (curr.totalPayableAmount - curr.remainingAmount), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('FINANCIAL SUMMARY', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Summary boxes
  const boxWidth = (pageWidth - (margin * 2) - 10) / 3;
  
  // Total Borrowed Box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, boxWidth, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL BORROWED', margin + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(totalBorrowed), margin + 4, y + 12);

  // Total Paid Box
  doc.setFillColor(240, 253, 244); // green-50
  doc.rect(margin + boxWidth + 5, y, boxWidth, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(22, 163, 74); // green-600
  doc.text('TOTAL PAID BACK', margin + boxWidth + 9, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(21, 128, 61); // green-700
  doc.text(formatINR(totalPaid), margin + boxWidth + 9, y + 12);

  // Total Outstanding Box
  doc.setFillColor(255, 251, 235); // amber-50
  doc.rect(margin + (boxWidth * 2) + 10, y, boxWidth, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text('TOTAL OUTSTANDING', margin + (boxWidth * 2) + 14, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(formatINR(totalRemaining), margin + (boxWidth * 2) + 14, y + 12);

  y += 28;

  // --- LOANS LIST SECTION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DETAILED REPAYMENT RECORD BY LOAN', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  if (loans.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('No loan records found.', margin, y);
  } else {
    loans.forEach((loan, idx) => {
      // Check if space left on page, if not add a page break
      if (y > 220) {
        doc.addPage();
        y = 35;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      
      const loanHeaderStr = `Loan #${idx + 1} - ${loan.status}`;
      doc.text(loanHeaderStr, margin, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Start Date: ${loan.loanStartDate} | Principal: ${formatINR(loan.principalAmount)} | Interest: ${loan.interestRate}% (${loan.interestRateType}) | Remaining: ${formatINR(loan.remainingAmount)}`, margin, y);
      y += 4;

      // Table for installments of this loan
      const installments = paymentsMap[loan.id] || [];
      const tableRows = installments.map(p => [
        p.installmentNumber,
        p.dueDate,
        formatINR(p.expectedAmount),
        formatINR(p.paidAmount),
        formatINR(p.expectedAmount - p.paidAmount),
        p.paidDate || '—',
        p.status
      ]);

      autoTable(doc, {
        startY: y,
        head: [['#', 'Due Date', 'Expected', 'Paid', 'Remaining', 'Paid Date', 'Status']],
        body: tableRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] }, // slate-800
        alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
        columnStyles: {
          0: { halign: 'center', width: 10 },
          6: { fontStyle: 'bold' }
        },
        didDrawPage: (data) => {
          y = data.cursor.y + 12; // Update y after table
        }
      });
    });
  }

  // Draw headers and footers on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeaderFooter(doc, 'Borrower Ledger Statement', i, totalPages);
  }

  doc.save(`${borrower.fullName.replace(/\s+/g, '_')}_Statement.pdf`);
};

export const generateLoanStatement = (borrower, loan, loanIndex, installments) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let y = 35;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`Loan Statement - #${loanIndex}`, margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN')}`, margin, y);
  y += 10;

  // --- BORROWER PROFILE BLOCK ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('BORROWER DETAILS', margin + 5, y + 5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Full Name:`, margin + 5, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.fullName, margin + 25, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone:`, margin + 5, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.phoneNumber, margin + 25, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Address:`, margin + 95, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const splitAddress = doc.splitTextToSize(borrower.address || 'No address added', pageWidth - margin - 115 - 5);
  doc.text(splitAddress, margin + 115, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Aadhaar Last 4:`, margin + 95, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(borrower.aadharLastFourDigits ? `xxxx-xxxx-${borrower.aadharLastFourDigits}` : 'Not provided', margin + 122, y + 24);

  y += 40;

  // --- LOAN DETAILS GRID ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('LOAN & INTEREST TERMS', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Key-value grid for loan details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  // Column 1
  doc.text('Principal Amount:', margin, y + 2);
  doc.text('Start Date:', margin, y + 8);
  doc.text('Duration:', margin, y + 14);
  doc.text('Interest Rate:', margin, y + 20);

  // Column 1 values
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(loan.principalAmount), margin + 35, y + 2);
  doc.text(loan.loanStartDate, margin + 35, y + 8);
  doc.text(`${loan.durationInMonths} Months`, margin + 35, y + 14);
  doc.text(`${loan.interestRate}% (${loan.interestRateType})`, margin + 35, y + 20);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Interest Charged:', margin + 100, y + 2);
  doc.text('Total Payable Amount:', margin + 100, y + 8);
  doc.text('Monthly Installment:', margin + 100, y + 14);
  doc.text('Remaining Balance:', margin + 100, y + 20);

  // Column 2 values
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(loan.totalInterest), margin + 145, y + 2);
  doc.text(formatINR(loan.totalPayableAmount), margin + 145, y + 8);
  doc.text(formatINR(loan.monthlyInstallment), margin + 145, y + 14);
  doc.setTextColor(220, 38, 38); // Red-600
  doc.text(formatINR(loan.remainingAmount), margin + 145, y + 20);

  y += 28;

  // --- REPAYMENT LIST SECTION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('REPAYMENT SCHEDULE & INSTALLMENT HISTORY', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const tableRows = installments.map(p => [
    p.installmentNumber,
    p.dueDate,
    formatINR(p.expectedAmount),
    formatINR(p.paidAmount),
    formatINR(p.expectedAmount - p.paidAmount),
    p.paidDate || '—',
    p.status
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Due Date', 'Expected', 'Paid', 'Remaining', 'Paid Date', 'Status']],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }, // slate-900
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', width: 12 },
      6: { fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      y = data.cursor.y + 12;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeaderFooter(doc, `Statement - Loan #${loanIndex}`, i, totalPages);
  }

  doc.save(`${borrower.fullName.replace(/\s+/g, '_')}_Loan_${loanIndex}_Statement.pdf`);
};
