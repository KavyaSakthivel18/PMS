import React, { useEffect, useState } from 'react';
import { feeService } from '../../services/feeService';
import { bookingService } from '../../services/bookingService';

const Invoice = ({ bookingId, onNavigate }) => {
  const [invoice, setInvoice] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingData, invoiceData] = await Promise.all([
        bookingService.getBookingById(bookingId),
        feeService.getInvoice(bookingId)
      ]);
      setBooking(bookingData);
      setInvoice(invoiceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await feeService.generateInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to download PDF: ${err.message}`);
    }
  };

  if (loading) return <div style={styles.center}>Loading invoice...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>Error: {error}</div>;
  if (!invoice) return <div style={{ ...styles.center, color: 'orange' }}>Invoice not found.</div>;

  const subtotal = invoice.storageFee + invoice.demurrageFee + invoice.detentionFee;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div style={styles.pageContainer}>
      {/* Header with Actions */}
      <div style={styles.actionBar}>
        <h1 style={styles.pageTitle}>Invoice #{invoice.invoiceNumber}</h1>
        <div style={styles.actionButtons}>
          <button onClick={handlePrint} style={styles.actionBtn}>
            🖨️ Print
          </button>
          <button onClick={handleDownloadPDF} style={styles.actionBtn}>
            📥 Download PDF
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('FEE_DETAILS', bookingId)}
            style={styles.backBtn}
          >
            ← Back to Fees
          </button>
        </div>
      </div>

      {/* Main Invoice Document */}
      <div style={styles.invoiceDocument}>
        {/* Company Header */}
        <div style={styles.invoiceHeader}>
          <div>
            <h2 style={styles.companyName}>PORT FREIGHT MANAGEMENT SYSTEM</h2>
            <p style={styles.companyInfo}>Port Authority | Port Management Division</p>
            <p style={styles.companyInfo}>Email: billing@portfreight.com | Phone: (555) 123-4567</p>
          </div>
          <div style={styles.invoiceTitle}>
            <h1 style={styles.invoiceTitleText}>INVOICE</h1>
            <p style={styles.invoiceNumber}>INV-{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Info Row */}
        <div style={styles.infoRow}>
          <div style={styles.infoBox}>
            <h4 style={styles.infoBoxTitle}>INVOICE DATE</h4>
            <p style={styles.infoBoxValue}>
              {new Date(invoice.invoiceDate || new Date()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div style={styles.infoBox}>
            <h4 style={styles.infoBoxTitle}>DUE DATE</h4>
            <p style={styles.infoBoxValue}>
              {new Date(invoice.dueDate || new Date(Date.now() + 30*24*60*60*1000)).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div style={styles.infoBox}>
            <h4 style={styles.infoBoxTitle}>BOOKING ID</h4>
            <p style={styles.infoBoxValue}>#{booking?.id}</p>
          </div>
          <div style={styles.infoBox}>
            <h4 style={styles.infoBoxTitle}>STATUS</h4>
            <p style={{...styles.infoBoxValue, color: invoice.status === 'PAID' ? '#2e7d32' : '#e65100'}}>
              {invoice.status || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Bill To Section */}
        <div style={styles.billSection}>
          <div style={styles.billTo}>
            <h4 style={styles.billTitle}>BILL TO:</h4>
            <p style={styles.billName}>{booking?.userName}</p>
            <p style={styles.billText}>{booking?.userEmail || 'N/A'}</p>
            <p style={styles.billText}>Phone: {booking?.userPhone || 'N/A'}</p>
            <p style={styles.billText}>Container: {booking?.containerNumber}</p>
          </div>
          <div style={styles.shipFrom}>
            <h4 style={styles.billTitle}>SHIP FROM:</h4>
            <p style={styles.billName}>Port Facility</p>
            <p style={styles.billText}>Container Yard & Storage Area</p>
            <p style={styles.billText}>Port Authority</p>
          </div>
        </div>

        {/* Items Table */}
        <div style={styles.tableSection}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.thDescription}>DESCRIPTION</th>
                <th style={styles.thQuantity}>QUANTITY</th>
                <th style={styles.thRate}>RATE</th>
                <th style={styles.thAmount}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {/* Storage Fee */}
              <tr style={styles.tableRow}>
                <td style={styles.tdDescription}>
                  <strong>Storage Fee</strong>
                  <p style={styles.itemNote}>
                    Free days: 7 | Chargeable days: {invoice.chargeableDays || 0}
                  </p>
                </td>
                <td style={styles.tdQuantity}>{invoice.chargeableDays || 0} days</td>
                <td style={styles.tdRate}>$50.00</td>
                <td style={styles.tdAmount}>${(invoice.storageFee || 0).toFixed(2)}</td>
              </tr>

              {/* Demurrage Fee */}
              {invoice.demurrageFee > 0 && (
                <tr style={styles.tableRow}>
                  <td style={styles.tdDescription}>
                    <strong>Demurrage Fee</strong>
                    <p style={styles.itemNote}>Overstay charges beyond free period</p>
                  </td>
                  <td style={styles.tdQuantity}>{invoice.overstayDays || 0} days</td>
                  <td style={styles.tdRate}>$150.00</td>
                  <td style={styles.tdAmount}>${(invoice.demurrageFee || 0).toFixed(2)}</td>
                </tr>
              )}

              {/* Detention Fee */}
              {invoice.detentionFee > 0 && (
                <tr style={styles.tableRow}>
                  <td style={styles.tdDescription}>
                    <strong>Detention Fee</strong>
                    <p style={styles.itemNote}>Container retention charges</p>
                  </td>
                  <td style={styles.tdQuantity}>1</td>
                  <td style={styles.tdRate}>$200.00</td>
                  <td style={styles.tdAmount}>${(invoice.detentionFee || 0).toFixed(2)}</td>
                </tr>
              )}

              {/* Empty Row for spacing */}
              <tr style={{height: '20px', borderBottom: 'none'}}>
                <td colSpan="4"></td>
              </tr>

              {/* Subtotal Row */}
              <tr style={styles.subtotalRow}>
                <td colSpan="3" style={styles.subtotalLabel}>SUBTOTAL:</td>
                <td style={styles.subtotalAmount}>${subtotal.toFixed(2)}</td>
              </tr>

              {/* Tax Row */}
              <tr style={styles.taxRow}>
                <td colSpan="3" style={styles.taxLabel}>TAX (10%):</td>
                <td style={styles.taxAmount}>${tax.toFixed(2)}</td>
              </tr>

              {/* Total Row */}
              <tr style={styles.totalRow}>
                <td colSpan="3" style={styles.totalLabel}>TOTAL DUE:</td>
                <td style={styles.totalAmount}>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Status & Details */}
        <div style={styles.detailsSection}>
          <div style={styles.paymentStatus}>
            <h4 style={styles.sectionHeading}>PAYMENT STATUS</h4>
            <div style={styles.statusBox}>
              <p style={{margin: '0 0 10px 0', fontSize: '14px', color: '#666'}}>
                Amount Due: <span style={{fontWeight: '700', color: '#1a1a1a'}}>${total.toFixed(2)}</span>
              </p>
              {invoice.paidAmount > 0 && (
                <>
                  <p style={{margin: '0 0 10px 0', fontSize: '14px', color: '#666'}}>
                    Amount Paid: <span style={{fontWeight: '700', color: '#2e7d32'}}>${invoice.paidAmount.toFixed(2)}</span>
                  </p>
                  <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
                    Balance: <span style={{fontWeight: '700', color: '#1a1a1a'}}>${(total - invoice.paidAmount).toFixed(2)}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div style={styles.notes}>
            <h4 style={styles.sectionHeading}>NOTES & TERMS</h4>
            <ul style={styles.termsList}>
              <li>Payment is due within 30 days of invoice date</li>
              <li>Storage fees apply after 7 free days from container arrival</li>
              <li>Demurrage charges: $150/day for overstay beyond free period</li>
              <li>Detention charges: $200/day if container not returned after delivery</li>
              <li>Late payments may incur additional penalties</li>
              <li>Each container movement must be logged in the system</li>
              <li>HELD containers cannot be moved out of port</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Thank you for your business!</p>
          <p style={styles.footerText}>For payment inquiries, please contact: billing@portfreight.com</p>
          <hr style={styles.footerLine} />
          <p style={styles.footerSmall}>
            This is an electronically generated invoice. For verification, please contact Port Authority.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  pageTitle: {
    margin: '0',
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  actionBtn: {
    padding: '10px 18px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  backBtn: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  invoiceDocument: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '900px',
    margin: '0 auto'
  },
  invoiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '3px solid #1976d2'
  },
  companyName: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1976d2'
  },
  companyInfo: {
    margin: '5px 0',
    fontSize: '12px',
    color: '#666'
  },
  invoiceTitle: {
    textAlign: 'right'
  },
  invoiceTitleText: {
    margin: '0',
    fontSize: '48px',
    fontWeight: '300',
    color: '#1976d2',
    letterSpacing: '3px'
  },
  invoiceNumber: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '40px'
  },
  infoBox: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #1976d2'
  },
  infoBoxTitle: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase'
  },
  infoBoxValue: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  billSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginBottom: '40px'
  },
  billTo: {
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0'
  },
  shipFrom: {
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0'
  },
  billTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase'
  },
  billName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  billText: {
    margin: '5px 0',
    fontSize: '13px',
    color: '#666'
  },
  tableSection: {
    marginBottom: '30px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px'
  },
  tableHead: {
    backgroundColor: '#1976d2',
    color: 'white'
  },
  thDescription: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  thQuantity: {
    padding: '12px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  thRate: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  thAmount: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0'
  },
  tdDescription: {
    padding: '16px 12px',
    fontSize: '13px',
    color: '#1a1a1a'
  },
  itemNote: {
    margin: '5px 0 0 0',
    fontSize: '11px',
    color: '#999',
    fontStyle: 'italic'
  },
  tdQuantity: {
    padding: '16px 12px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#1a1a1a'
  },
  tdRate: {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '13px',
    color: '#1a1a1a'
  },
  tdAmount: {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  subtotalRow: {
    backgroundColor: '#f8f9fa'
  },
  subtotalLabel: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  subtotalAmount: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  taxRow: {
    backgroundColor: '#f8f9fa'
  },
  taxLabel: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  taxAmount: {
    padding: '12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  totalRow: {
    backgroundColor: '#1976d2'
  },
  totalLabel: {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white'
  },
  totalAmount: {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '18px',
    fontWeight: '700',
    color: 'white'
  },
  detailsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  paymentStatus: {
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0'
  },
  statusBox: {
    padding: '15px',
    backgroundColor: '#f0f4ff',
    borderLeft: '4px solid #1976d2',
    borderRadius: '4px'
  },
  notes: {
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0'
  },
  sectionHeading: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase'
  },
  termsList: {
    margin: '0',
    paddingLeft: '20px',
    lineHeight: '1.8',
    fontSize: '12px',
    color: '#666'
  },
  footer: {
    paddingTop: '30px',
    borderTop: '2px solid #e0e0e0',
    textAlign: 'center'
  },
  footerText: {
    margin: '8px 0',
    fontSize: '13px',
    color: '#1a1a1a',
    fontWeight: '600'
  },
  footerLine: {
    margin: '15px 0',
    border: 'none',
    borderTop: '1px solid #e0e0e0'
  },
  footerSmall: {
    margin: '10px 0 0 0',
    fontSize: '11px',
    color: '#999',
    fontStyle: 'italic'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '16px'
  }
};

export default Invoice;
