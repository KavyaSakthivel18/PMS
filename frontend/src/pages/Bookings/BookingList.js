import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from '../../services/bookingService';

const BookingList = ({ onNavigate }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (filter === 'ALL') {
        data = await bookingService.getAllBookings();
      } else {
        data = await bookingService.getBookingsByStatus(filter);
      }
      setBookings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) return <div style={styles.center}>Loading bookings...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Booking Management</h2>
        <button 
          onClick={() => onNavigate && onNavigate('CREATE_BOOKING')}
          style={styles.primaryButton}
        >
          + Create New Booking
        </button>
      </div>

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filter by Status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Bookings</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Booking ID</th>
              <th style={styles.th}>Container No</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Booking Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>No bookings found.</td></tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id} style={styles.tr}>
                  <td style={styles.td}><strong>#{booking.id}</strong></td>
                  <td style={styles.td}>{booking.containerNumber || 'N/A'}</td>
                  <td style={styles.td}>{booking.userName || 'N/A'}</td>
                  <td style={styles.td}>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => onNavigate && onNavigate('BOOKING_DETAILS', booking.id)}
                        style={styles.secondaryButton}
                      >
                        View
                      </button>
                      <button 
                        onClick={() => onNavigate && onNavigate('FEE_DETAILS', booking.id)}
                        style={styles.infoButton}
                      >
                        Fees
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    status === 'CANCELLED' ? '#ffebee' :
    '#fff3e0',
  color: 
    status === 'CONFIRMED' ? '#1565c0' :
    status === 'COMPLETED' ? '#2e7d32' :
    status === 'CANCELLED' ? '#c62828' :
    '#e65100',
  display: 'inline-block'
});

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
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
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  filterBar: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px'
  },
  filterLabel: {
    fontWeight: '600',
    color: '#1a1a1a'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '700',
    color: '#1a1a1a',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px'
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#333'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  secondaryButton: {
    padding: '6px 12px',
    backgroundColor: '#f5f5f5',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  infoButton: {
    padding: '6px 12px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    border: '1px solid #e65100',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '16px'
  }
};

export default BookingList;
