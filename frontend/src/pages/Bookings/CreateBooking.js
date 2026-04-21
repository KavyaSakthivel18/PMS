import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../services/bookingService';
import { feeService } from '../../services/feeService';
import { containerService } from '../../services/containerService';
import { userService } from '../../services/userService';
import { vesselService } from '../../services/vesselService';

const CreateBooking = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    userId: '',
    containerId: '',
    vesselId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: ''
  });

  const [estimatedFees, setEstimatedFees] = useState(null);
  const [containers, setContainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [containersData, usersData, vesselsData] = await Promise.all([
        containerService.getAllContainers(),
        userService.getAllUsers(),
        vesselService.getAllVessels()
      ]);
      setContainers(containersData);
      setUsers(usersData);
      setVessels(vesselsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateEstimatedFees = useCallback(() => {
    const selectedContainer = containers.find(c => c.id === parseInt(formData.containerId));
    if (!selectedContainer) return;

    const calculatedFees = feeService.calculateFees({
      arrivalDate: formData.bookingDate,
      pickupDate: formData.expectedDeliveryDate || null,
      deliveryDate: formData.expectedDeliveryDate || null,
      isReturned: false,
      containerStatus: selectedContainer.status || 'ACTIVE'
    });

    setEstimatedFees(calculatedFees);
  }, [containers, formData.containerId, formData.bookingDate, formData.expectedDeliveryDate]);

  // Recalculate fees whenever relevant fields change
  useEffect(() => {
    if (formData.containerId && formData.bookingDate) {
      calculateEstimatedFees();
    }
  }, [formData.containerId, formData.bookingDate, calculateEstimatedFees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.containerId || !formData.vesselId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create the booking
      const booking = await bookingService.createBooking(formData);

      // Save calculated fees if available
      if (estimatedFees) {
        try {
          await feeService.calculateAndSaveFees(booking.id, estimatedFees);
        } catch (feeErr) {
          console.warn('Failed to save fees, but booking was created:', feeErr);
        }
      }

      setSuccess(true);
      setFormData({
        userId: '',
        containerId: '',
        vesselId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: ''
      });
      setEstimatedFees(null);

      // Navigate after a short delay
      setTimeout(() => {
        onNavigate && onNavigate('BOOKING_LIST');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading data...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Create New Booking</h2>
        <button 
          onClick={() => onNavigate && onNavigate('BOOKING_LIST')}
          style={styles.backButton}
        >
          ← Back to Bookings
        </button>
      </div>

      {success && (
        <div style={styles.successAlert}>
          ✓ Booking created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div style={styles.errorAlert}>
          ✗ {error}
        </div>
      )}

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Booking Information</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                User <span style={styles.required}>*</span>
              </label>
              <select 
                name="userId" 
                value={formData.userId}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Container <span style={styles.required}>*</span>
              </label>
              <select 
                name="containerId" 
                value={formData.containerId}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="">Select a container...</option>
                {containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.containerNumber} ({container.status})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Vessel <span style={styles.required}>*</span>
              </label>
              <select 
                name="vesselId" 
                value={formData.vesselId}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="">Select a vessel...</option>
                {vessels.map(vessel => (
                  <option key={vessel.id} value={vessel.id}>
                    {vessel.vesselName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Booking Date <span style={styles.required}>*</span>
                </label>
                <input 
                  type="date"
                  name="bookingDate" 
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Expected Delivery Date</label>
                <input 
                  type="date"
                  name="expectedDeliveryDate" 
                  value={formData.expectedDeliveryDate}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes}
                onChange={handleInputChange}
                style={{...styles.input, minHeight: '100px'}}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Fee Calculator Section */}
          {estimatedFees && (
            <div style={styles.feeCalculatorSection}>
              <h3 style={styles.sectionTitle}>Estimated Fees</h3>
              
              <div style={styles.feeGrid}>
                <div style={styles.feeCard}>
                  <div style={styles.feeLabel}>Days Stored</div>
                  <div style={styles.feeValue}>{estimatedFees.daysStored}</div>
                  <div style={styles.feeDetail}>Free Days: {estimatedFees.freeDaysUsed}</div>
                  <div style={styles.feeDetail}>Chargeable: {estimatedFees.chargeableDays}</div>
                </div>

                <div style={styles.feeCard}>
                  <div style={styles.feeLabel}>Storage Fee</div>
                  <div style={styles.feeValue}>${estimatedFees.storageFee.toFixed(2)}</div>
                  <div style={styles.feeDetail}>{estimatedFees.chargeableDays} × $50/day</div>
                </div>

                <div style={styles.feeCard}>
                  <div style={styles.feeLabel}>Demurrage Fee</div>
                  <div style={styles.feeValue}>${estimatedFees.demurrageFee.toFixed(2)}</div>
                  <div style={styles.feeDetail}>{estimatedFees.overstayDays} × $150/day</div>
                </div>

                <div style={styles.feeCard}>
                  <div style={styles.feeLabel}>Detention Fee</div>
                  <div style={styles.feeValue}>${estimatedFees.detentionFee.toFixed(2)}</div>
                  <div style={styles.feeDetail}>If not returned</div>
                </div>
              </div>

              <div style={styles.feeBreakdown}>
                <h4 style={styles.breakdownTitle}>Fee Breakdown</h4>
                {Object.entries(estimatedFees.breakdown).map(([key, value]) => (
                  <div key={key} style={styles.breakdownRow}>
                    <span>{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div style={styles.totalFeeBox}>
                <span style={styles.totalLabel}>Total Estimated Fee:</span>
                <span style={styles.totalAmount}>${estimatedFees.totalFee.toFixed(2)}</span>
              </div>

              <div style={styles.feeNote}>
                <strong>Note:</strong> Storage fees apply after {7} free days from arrival. 
                Demurrage and detention fees will be calculated based on actual dates.
              </div>
            </div>
          )}

          <div style={styles.formActions}>
            <button 
              type="submit"
              disabled={submitting}
              style={{
                ...styles.primaryButton,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
            <button 
              type="button"
              onClick={() => onNavigate && onNavigate('BOOKING_LIST')}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
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
  backButton: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '6px',
    fontSize: '14px',
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
  form: {
    width: '100%'
  },
  formSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e0e0e0'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
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
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  feeCalculatorSection: {
    marginBottom: '40px',
    padding: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px solid #e3f2fd'
  },
  feeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
  },
  feeCard: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '6px',
    borderLeft: '4px solid #1976d2'
  },
  feeLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  feeValue: {
    color: '#1976d2',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  feeDetail: {
    color: '#999',
    fontSize: '12px',
    lineHeight: '1.5'
  },
  feeBreakdown: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '6px',
    marginBottom: '15px'
  },
  breakdownTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  },
  totalFeeBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    marginBottom: '15px',
    borderLeft: '4px solid #1976d2'
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1976d2'
  },
  feeNote: {
    padding: '12px',
    backgroundColor: '#fff3e0',
    borderLeft: '4px solid #ff9800',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#e65100',
    lineHeight: '1.6'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '2px solid #e0e0e0'
  },
  primaryButton: {
    padding: '12px 30px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '12px 30px',
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  successAlert: {
    padding: '15px 18px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderLeft: '4px solid #4caf50',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  errorAlert: {
    padding: '15px 18px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderLeft: '4px solid #f44336',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '16px'
  }
};

export default CreateBooking;
