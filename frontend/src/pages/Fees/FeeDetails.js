import React, { useEffect, useState, useCallback } from 'react';
import { feeService } from '../../services/feeService';
import { bookingService } from '../../services/bookingService';

const FeeDetails = ({ bookingId, onNavigate }) => {
  const [fees, setFees] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'CREDIT_CARD',
    transactionId: '',
    notes: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingData, feesData] = await Promise.all([
        bookingService.getBookingById(bookingId),
        feeService.getFeesByBooking(bookingId)
      ]);
      setBooking(bookingData);
      setFees(Array.isArray(feesData) ? feesData[0] : feesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchData();
  }, [bookingId, fetchData]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentData.transactionId.trim()) {
      alert('Please enter transaction ID');
      return;
    }

    try {
      setProcessing(true);
      await feeService.processPayment(fees.id, paymentData);
      alert('Payment processed successfully!');
      setShowPaymentForm(false);
      setPaymentData({
        paymentMethod: 'CREDIT_CARD',
        transactionId: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await feeService.generateInvoicePDF(fees.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${fees.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to download PDF: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={styles.center}>Loading fee details...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>Error: {error}</div>;
  if (!fees) return <div style={{ ...styles.center, color: 'orange' }}>No fees found for this booking.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Fee Details</h2>
        <div style={styles.actionButtons}>
          <button 
            onClick={handleDownloadPDF}
            style={styles.iconButton}
            title="Download PDF"
          >
            📥 Download PDF
          </button>
          <button 
            onClick={handlePrint}
            style={styles.iconButton}
            title="Print"
          >
            🖨️ Print
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('BOOKING_LIST')}
            style={styles.backButton}
          >
            ← Back
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Booking Info */}
        {booking && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Booking Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Booking ID:</span>
                <span style={styles.infoValue}>#{booking.id}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Container:</span>
                <span style={styles.infoValue}>{booking.containerNumber}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>User:</span>
                <span style={styles.infoValue}>{booking.userName}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status:</span>
                <span style={getStatusBadgeStyle(booking.status)}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fee Summary */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Fee Summary</h3>
          
          <div style={styles.statusBar}>
            <span style={styles.statusLabel}>Payment Status:</span>
            <span style={getPaymentStatusBadge(fees.status)}>
              {fees.status || 'PENDING'}
            </span>
          </div>

          <div style={styles.feeGrid}>
            <div style={styles.feeCard}>
              <div style={styles.feeName}>Storage Fee</div>
              <div style={styles.feeAmount}>${(fees.storageFee || 0).toFixed(2)}</div>
              <div style={styles.feeDetail}>
                {fees.chargeableDays || 0} days @ ${50}/day
              </div>
            </div>

            <div style={styles.feeCard}>
              <div style={styles.feeName}>Demurrage Fee</div>
              <div style={styles.feeAmount}>${(fees.demurrageFee || 0).toFixed(2)}</div>
              <div style={styles.feeDetail}>
                {fees.overstayDays || 0} days @ ${150}/day
              </div>
            </div>

            <div style={styles.feeCard}>
              <div style={styles.feeName}>Detention Fee</div>
              <div style={styles.feeAmount}>${(fees.detentionFee || 0).toFixed(2)}</div>
              <div style={styles.feeDetail}>Return delay charges</div>
            </div>

            <div style={{...styles.feeCard, borderLeftColor: '#ff9800', backgroundColor: '#fff8e1'}}>
              <div style={styles.feeName}>Total Amount Due</div>
              <div style={{...styles.feeAmount, color: '#ff9800'}}>
                ${(fees.totalFee || 0).toFixed(2)}
              </div>
              <div style={styles.feeDetail}>All charges combined</div>
            </div>
          </div>
        </div>

        {/* Fee Breakdown Table */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Detailed Breakdown</h3>
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Days Stored</td>
                  <td style={styles.tdValue}>{fees.daysStored || '-'} days</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Free Days Allowed</td>
                  <td style={styles.tdValue}>7 days</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Chargeable Days</td>
                  <td style={styles.tdValue}>{fees.chargeableDays || 0} days</td>
                </tr>
                <tr style={{...styles.tr, backgroundColor: '#f5f5f5'}}>
                  <td style={styles.tdLabel}><strong>Storage Fee Rate</strong></td>
                  <td style={styles.tdValue}><strong>$50.00 / day</strong></td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdLabel}>Overstay Days</td>
                  <td style={styles.tdValue}>{fees.overstayDays || 0} days</td>
                </tr>
                <tr style={{...styles.tr, backgroundColor: '#f5f5f5'}}>
                  <td style={styles.tdLabel}><strong>Demurrage Rate</strong></td>
                  <td style={styles.tdValue}><strong>$150.00 / day</strong></td>
                </tr>
                <tr style={{...styles.tr, backgroundColor: '#e8f5e9'}}>
                  <td style={styles.tdLabel}><strong>Total Fees</strong></td>
                  <td style={{...styles.tdValue, color: '#2e7d32', fontWeight: '700', fontSize: '16px'}}>
                    <strong>${(fees.totalFee || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Notes */}
        <div style={styles.notesSection}>
          <h4 style={styles.notesTitle}>Fee Calculation Rules</h4>
          <ul style={styles.notesList}>
            <li>Storage fees apply after <strong>7 free days</strong> from arrival</li>
            <li>Storage rate: <strong>$50 per day</strong> for each chargeable day</li>
            <li>Demurrage fees: <strong>$150 per day</strong> for overstay beyond free period</li>
            <li>Detention fees: Applied if container not returned after delivery date</li>
            <li>All fees are calculated from booking date until container pickup/return</li>
          </ul>
        </div>

        {/* Payment Section */}
        {fees.status !== 'PAID' && (
          <div style={styles.paymentSection}>
            <h3 style={styles.sectionTitle}>Payment</h3>
            
            {!showPaymentForm ? (
              <button 
                onClick={() => setShowPaymentForm(true)}
                style={styles.paymentButton}
              >
                💳 Process Payment
              </button>
            ) : (
              <form onSubmit={handlePayment} style={styles.paymentForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Method</label>
                  <select 
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    style={styles.input}
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Transaction ID <span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                    placeholder="Enter reference or transaction number"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Notes</label>
                  <textarea 
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    placeholder="Any additional payment notes..."
                    style={{...styles.input, minHeight: '80px'}}
                  />
                </div>

                <div style={styles.paymentSummary}>
                  <div style={styles.summaryRow}>
                    <span>Amount Due:</span>
                    <span style={styles.summaryAmount}>${(fees.totalFee || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div style={styles.paymentFormActions}>
                  <button 
                    type="submit"
                    disabled={processing}
                    style={{
                      ...styles.submitButton,
                      opacity: processing ? 0.6 : 1,
                      cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {processing ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Payment History */}
        {fees.paidAmount > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment History</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Amount Paid:</span>
                <span style={{...styles.infoValue, color: '#2e7d32', fontWeight: '700'}}>
                  ${(fees.paidAmount || 0).toFixed(2)}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Paid On:</span>
                <span style={styles.infoValue}>
                  {fees.paidAt ? new Date(fees.paidAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Payment Method:</span>
                <span style={styles.infoValue}>{fees.paymentMethod || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Reference:</span>
                <span style={styles.infoValue}>{fees.transactionId || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusBadgeStyle = (status) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.85em',
  fontWeight: '600',
  backgroundColor: 
    status === 'CONFIRMED' ? '#e3f2fd' :
    status === 'COMPLETED' ? '#e8f5e9' :
    '#fff3e0',
  color: 
    status === 'CONFIRMED' ? '#1565c0' :
    status === 'COMPLETED' ? '#2e7d32' :
    '#e65100',
  display: 'inline-block'
});

const getPaymentStatusBadge = (status) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.85em',
  fontWeight: '600',
  backgroundColor: status === 'PAID' ? '#e8f5e9' : '#fff3e0',
  color: status === 'PAID' ? '#2e7d32' : '#e65100',
  display: 'inline-block'
});

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '20px'
  },
  title: {
    margin: '0',
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px'
  },
  iconButton: {
    padding: '10px 16px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  backButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '30px'
  },
  section: {
    marginBottom: '35px'
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e0e0e0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  infoItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #1976d2'
  },
  infoLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  infoValue: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '25px'
  },
  statusLabel: {
    fontWeight: '600',
    color: '#1a1a1a'
  },
  feeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  feeCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '6px',
    borderLeft: '4px solid #1976d2',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  feeName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '10px'
  },
  feeAmount: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: '8px'
  },
  feeDetail: {
    fontSize: '12px',
    color: '#999',
    lineHeight: '1.5'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tr: {
    borderBottom: '1px solid #e0e0e0'
  },
  tdLabel: {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
    width: '60%'
  },
  tdValue: {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'right'
  },
  notesSection: {
    padding: '20px',
    backgroundColor: '#f0f4ff',
    borderLeft: '4px solid #1976d2',
    borderRadius: '6px',
    marginBottom: '30px'
  },
  notesTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  notesList: {
    margin: '0',
    paddingLeft: '20px',
    lineHeight: '1.8',
    fontSize: '13px',
    color: '#555'
  },
  paymentSection: {
    padding: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #ff9800'
  },
  paymentButton: {
    padding: '12px 24px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  paymentForm: {
    marginTop: '20px'
  },
  formGroup: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: '14px'
  },
  required: {
    color: '#d32f2f'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  paymentSummary: {
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginBottom: '20px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  summaryAmount: {
    fontSize: '18px',
    color: '#ff9800'
  },
  paymentFormActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '16px'
  }
};

export default FeeDetails;
