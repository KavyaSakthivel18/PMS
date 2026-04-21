import React, { useEffect, useState, useCallback } from 'react';
import { containerService } from '../../services/containerService';
import { customsService } from '../../services/customsService';
import MovementTimeline from '../../components/MovementTimeline';

const ContainerDetails = ({ containerId, onNavigate }) => {
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [movements, setMovements] = useState([]);
  const [declaration, setDeclaration] = useState(null);
  
  // Status flow mapping according to business requirements
  const AVAILABLE_STATUSES = [
    'ARRIVED', 'YARD_STORAGE', 'CUSTOMS_HOLD', 'CLEARED', 
    'GATE_OUT', 'IN_TRANSIT', 'DELIVERED', 'EXPORT_READY', 'LOADED', 'DEPARTED'
  ];

  const fetchContainerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await containerService.getContainerById(containerId);
      setContainer(data);
      
      const [moveData, declData] = await Promise.all([
        customsService.getMovementLogs(containerId),
        customsService.getDeclarationByContainer(containerId)
      ]);
      setMovements(moveData);
      setDeclaration(declData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  useEffect(() => {
    if (containerId) {
      fetchContainerDetails();
    }
  }, [containerId, fetchContainerDetails]);

  const handleStatusUpdate = async (e) => {
    const newStatus = e.target.value;
    try {
      await containerService.updateContainerStatus(containerId, newStatus);
      // Reload on success
      fetchContainerDetails();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (loading) return <div style={styles.center}>Loading details...</div>;
  if (error) return <div style={{...styles.center, color: 'red'}}>Error: {error}</div>;
  if (!container) return <div style={styles.center}>Container not found</div>;

  return (
    <div style={styles.container}>
      <button 
        onClick={() => onNavigate && onNavigate('CONTAINER_LIST')}
        style={styles.backButton}
      >
        &larr; Back to List
      </button>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h2 style={styles.title}>Container {container.containerNumber}</h2>
          <div style={styles.statusUpdater}>
            <label style={{ fontSize: '14px', color: '#64748b' }}>Current Status: </label>
            <select 
              value={container.status} 
              onChange={handleStatusUpdate}
              style={styles.statusSelect}
            >
              {AVAILABLE_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.tabContainer}>
          <button 
            style={activeTab === 'OVERVIEW' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            Overview
          </button>
          <button 
            style={activeTab === 'HISTORY' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('HISTORY')}
          >
            Movement History
          </button>
        </div>

        {activeTab === 'OVERVIEW' ? (
          <>
            <div style={styles.grid}>
              <DetailItem label="Container Type" value={container.containerType} />
              <DetailItem label="Size (TEU)" value={`${container.sizeTEU} TEU`} />
              <DetailItem label="Weight" value={`${container.weightKG} KG`} />
              <DetailItem label="Seal Number" value={container.sealNumber || 'N/A'} />
            </div>

            <div style={styles.sectionDivider}>
              <h4 style={styles.sectionTitle}>Customs Information</h4>
              {declaration ? (
                <div style={styles.customsGrid}>
                  <DetailItem label="HS Code" value={declaration.hsCode} />
                  <DetailItem label="Customs Status" value={declaration.customsStatus} />
                  <DetailItem label="Type" value={declaration.declarationType} />
                  <DetailItem label="Inspection" value={declaration.inspectionRequired ? 'REQUIRED' : 'NOT REQUIRED'} />
                </div>
              ) : (
                <div style={styles.noDataBox}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>No customs declaration found.</p>
                  {container.status === 'ARRIVED' && (
                    <button 
                      onClick={() => onNavigate && onNavigate('FILE_DECLARATION', containerId)}
                      style={styles.actionButton}
                    >
                      File Declaration
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={styles.descBox}>
              <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Cargo Description</h4>
              <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>
                {container.cargoDescription || 'No description provided.'}
              </p>
            </div>
          </>
        ) : (
          <MovementTimeline movements={movements} />
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={styles.detailItem}>
    <span style={styles.detailLabel}>{label}</span>
    <span style={styles.detailValue}>{value}</span>
  </div>
);

const styles = {
  container: {
    padding: '30px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#64748b'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '20px',
    padding: 0,
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    padding: '40px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  title: {
    margin: 0,
    color: '#0f172a',
    fontSize: '28px',
    letterSpacing: '-0.5px'
  },
  statusUpdater: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  statusSelect: {
    padding: '10px 16px',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    marginBottom: '40px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '18px',
    color: '#1e293b',
    fontWeight: '500'
  },
  descBox: {
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  tabContainer: {
    display: 'flex',
    gap: '20px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '30px'
  },
  tab: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  activeTab: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #3b82f6',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  },
  sectionDivider: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid #f1f5f9',
    marginBottom: '40px'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#475569',
    fontSize: '16px',
    fontWeight: '600'
  },
  customsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    backgroundColor: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0f2fe'
  },
  noDataBox: {
    padding: '20px',
    backgroundColor: '#fff7ed',
    borderRadius: '8px',
    border: '1px solid #ffedd5',
    color: '#9a3412',
    textAlign: 'center'
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#ea580c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default ContainerDetails;
