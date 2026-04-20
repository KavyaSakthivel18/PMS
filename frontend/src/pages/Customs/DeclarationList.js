import React, { useState, useEffect } from 'react';
import { customsService } from '../../services/customsService';

const DeclarationList = ({ onNavigate }) => {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note: Backend might need an endpoint to list ALL declarations. 
  // For now, these are placeholder logic for the dashboard view.
  useEffect(() => {
    // This is a placeholder since the backend focuses on container-specific fetch
    // in a real app, we'd have a find-all or filtered search.
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CLEARED': return '#22c55e';
      case 'HELD': return '#ef4444';
      case 'UNDER_REVIEW': return '#f59e0b';
      case 'REJECTED': return '#7f1d1d';
      default: return '#64748b';
    }
  };

  if (loading) return <div style={styles.center}>Loading declarations...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Customs Declarations</h2>
      
      <div style={styles.card}>
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            This dashboard displays the official customs status of containers under regulatory review.
          </p>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Container</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>HS Code</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Filed On</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" style={styles.emptyTd}>
                Recent movement-based declarations will appear here. 
                Navigate to a specific container to file a new declaration.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  title: {
    fontSize: '28px',
    color: '#0f172a',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  infoBox: {
    padding: '20px 30px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #f1f5f9'
  },
  infoText: {
    margin: 0,
    color: '#64748b',
    fontSize: '15px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px 30px',
    textAlign: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#ffffff'
  },
  emptyTd: {
    padding: '50px 30px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '15px',
    fontStyle: 'italic'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  }
};

export default DeclarationList;
