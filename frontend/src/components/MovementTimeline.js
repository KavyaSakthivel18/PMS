import React from 'react';

const MovementTimeline = ({ movements }) => {
  if (!movements || movements.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyText}>No movement history available for this container.</p>
      </div>
    );
  }

  return (
    <div style={styles.timelineContainer}>
      <h3 style={styles.timelineTitle}>Movement History</h3>
      <div style={styles.timeline}>
        {movements.map((move, index) => (
          <div key={move.id} style={styles.timelineItem}>
            <div style={styles.timelineMarker}>
              <div style={styles.markerDot}></div>
              {index !== movements.length - 1 && <div style={styles.markerLine}></div>}
            </div>
            <div style={styles.timelineContent}>
              <div style={styles.contentHeader}>
                <span style={styles.movementType}>{move.movementType}</span>
                <span style={styles.timestamp}>
                  {new Date(move.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={styles.locationRow}>
                <span style={styles.locationLabel}>From:</span>
                <span style={styles.locationValue}>{move.fromLocation}</span>
                <span style={styles.locationArrow}>&rarr;</span>
                <span style={styles.locationLabel}>To:</span>
                <span style={styles.locationValue}>{move.toLocation}</span>
              </div>
              {move.notes && (
                <div style={styles.notesBox}>
                  <p style={styles.notesText}>{move.notes}</p>
                </div>
              )}
              <div style={styles.footer}>
                <span style={styles.performedBy}>
                  Performed by: {move.performedByName} ({move.performedByRole})
                </span>
                {move.isAutomatic && <span style={styles.autoBadge}>System Auto-Log</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  timelineContainer: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    marginTop: '20px'
  },
  timelineTitle: {
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: '25px',
    fontWeight: '600'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  },
  timelineItem: {
    display: 'flex',
    gap: '20px',
    minHeight: '100px'
  },
  timelineMarker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px'
  },
  markerDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '3px solid #dbeafe',
    zIndex: 1
  },
  markerLine: {
    width: '2px',
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: '4px',
    marginBottom: '4px'
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '30px'
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  movementType: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  timestamp: {
    fontSize: '13px',
    color: '#64748b'
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #f1f5f9'
  },
  locationLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  locationValue: {
    fontSize: '14px',
    color: '#334155',
    fontWeight: '500'
  },
  locationArrow: {
    color: '#cbd5e1',
    margin: '0 4px'
  },
  notesBox: {
    marginBottom: '12px'
  },
  notesText: {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5',
    fontStyle: 'italic'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  performedBy: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  autoBadge: {
    fontSize: '10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  emptyContainer: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #e2e8f0'
  },
  emptyText: {
    color: '#64748b',
    margin: 0
  }
};

export default MovementTimeline;
