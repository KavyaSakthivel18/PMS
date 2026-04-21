import React, { useEffect, useState } from 'react';
import { containerService } from '../../services/containerService';

const ContainerList = ({ onNavigate }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = await containerService.getAllContainers();
      setContainers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading containers...</div>;
  if (error) return <div style={{ ...styles.center, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Container Management</h2>
        <button 
          onClick={() => onNavigate && onNavigate('ADD_CONTAINER')}
          style={styles.primaryButton}
        >
          + Register New Container
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Container No</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Size (TEU)</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.length === 0 ? (
              <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No containers found.</td></tr>
            ) : (
              containers.map(container => (
                <tr key={container.id} style={styles.tr}>
                  <td style={styles.td}><strong>{container.containerNumber}</strong></td>
                  <td style={styles.td}>{container.containerType}</td>
                  <td style={styles.td}>{container.sizeTEU}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(container.status)}>
                      {container.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => onNavigate && onNavigate('CONTAINER_DETAILS', container.id)}
                      style={styles.secondaryButton}
                    >
                      View Details
                    </button>
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
  backgroundColor: status === 'ARRIVED' ? '#e3f2fd' : '#f1f8e9',
  color: status === 'ARRIVED' ? '#1565c0' : '#2e7d32',
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
    marginBottom: '30px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#2c3e50'
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    color: '#495057',
    fontWeight: '600',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    color: '#343a40',
    fontSize: '15px'
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#64748b'
  }
};

export default ContainerList;
