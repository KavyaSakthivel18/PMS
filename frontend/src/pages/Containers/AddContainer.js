import React, { useState } from 'react';
import { containerService } from '../../services/containerService';

const AddContainer = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    containerNumber: '',
    containerType: 'STANDARD',
    sizeTEU: '20',
    sealNumber: '',
    cargoDescription: '',
    weightKG: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await containerService.createContainer(formData);
      if(onNavigate) onNavigate('CONTAINER_LIST'); // Navigate back after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={() => onNavigate && onNavigate('CONTAINER_LIST')}
        style={styles.backButton}
      >
        &larr; Back to List
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Register Arriving Container</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Container Number (4 letters + 7 digits)</label>
            <input 
              name="containerNumber" 
              value={formData.containerNumber} 
              onChange={handleChange} 
              placeholder="e.g. MSCU1234567"
              required
              maxLength={11}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select name="containerType" value={formData.containerType} onChange={handleChange} style={styles.input}>
                <option value="STANDARD">STANDARD</option>
                <option value="REEFER">REEFER</option>
                <option value="OPEN_TOP">OPEN_TOP</option>
                <option value="FLAT_RACK">FLAT_RACK</option>
                <option value="TANK">TANK</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Size (TEU)</label>
              <select name="sizeTEU" value={formData.sizeTEU} onChange={handleChange} style={styles.input}>
                <option value="20">20 TEU</option>
                <option value="40">40 TEU</option>
                <option value="45">45 TEU</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (KG)</label>
            <input 
              name="weightKG" 
              type="number" 
              value={formData.weightKG} 
              onChange={handleChange} 
              placeholder="e.g. 24000"
              required
              min="1"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Seal Number (Optional)</label>
            <input 
              name="sealNumber" 
              value={formData.sealNumber} 
              onChange={handleChange} 
              placeholder="e.g. SL987654"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cargo Description</label>
            <textarea 
              name="cargoDescription" 
              value={formData.cargoDescription} 
              onChange={handleChange} 
              placeholder="Provide details of the cargo..."
              rows="3"
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ ...styles.submitButton, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Registering...' : 'Register Container'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
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
  title: {
    margin: '0 0 30px 0',
    color: '#1e293b',
    fontSize: '24px'
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '24px',
    borderLeft: '4px solid #ef4444'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitButton: {
    marginTop: '10px',
    padding: '14px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default AddContainer;
