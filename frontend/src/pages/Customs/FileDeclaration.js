import React, { useState, useEffect } from 'react';
import { customsService } from '../../services/customsService';
import { containerService } from '../../services/containerService';

const FileDeclaration = ({ containerId, onNavigate }) => {
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    declarationType: 'IMPORT',
    hsCode: '',
    declaredValue: '',
    inspectionRequired: false,
    remarks: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (containerId) {
      fetchContainer();
    }
  }, [containerId]);

  const fetchContainer = async () => {
    try {
      const data = await containerService.getContainerById(containerId);
      setContainer(data);
      if (data.status !== 'ARRIVED') {
        setError('Only containers with status ARRIVED can have customs declarations filed.');
      }
    } catch (err) {
      setError('Failed to fetch container details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        containerId: parseInt(containerId),
        ...formData,
        declaredValue: formData.declaredValue ? parseFloat(formData.declaredValue) : null
      };

      await customsService.fileDeclaration(payload);
      alert('Customs declaration filed successfully!');
      if (onNavigate) onNavigate('CONTAINER_DETAILS', containerId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading container details...</div>;

  return (
    <div style={styles.container}>
      <button 
        onClick={() => onNavigate && onNavigate('CONTAINER_DETAILS', containerId)}
        style={styles.backButton}
      >
        &larr; Back to Details
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>File Customs Declaration</h2>
        <p style={styles.subtitle}>
          Container: <strong>{container?.containerNumber}</strong>
        </p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Declaration Type</label>
            <select 
              name="declarationType" 
              value={formData.declarationType} 
              onChange={handleInputChange}
              style={styles.select}
              required
            >
              <option value="IMPORT">IMPORT</option>
              <option value="EXPORT">EXPORT</option>
              <option value="TRANSIT">TRANSIT</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>HS Code (6-10 digits)</label>
            <input 
              type="text" 
              name="hsCode" 
              value={formData.hsCode} 
              onChange={handleInputChange}
              style={styles.input}
              placeholder="e.g. 84713000"
              pattern="\d{6,10}"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Declared Value (USD)</label>
            <input 
              type="number" 
              name="declaredValue" 
              value={formData.declaredValue} 
              onChange={handleInputChange}
              style={styles.input}
              placeholder="0.00"
              step="0.01"
              min="0"
              required={formData.declarationType === 'IMPORT'}
            />
          </div>

          <div style={styles.formGroupCheck}>
            <input 
              type="checkbox" 
              name="inspectionRequired" 
              id="inspectionRequired"
              checked={formData.inspectionRequired} 
              onChange={handleInputChange}
              style={styles.checkbox}
            />
            <label htmlFor="inspectionRequired" style={styles.checkLabel}>
              Physical Inspection Required
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Remarks</label>
            <textarea 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleInputChange}
              style={styles.textarea}
              rows="4"
              placeholder="Enter any additional information for the customs officer..."
            />
          </div>

          <div style={styles.actions}>
            <button 
              type="submit" 
              disabled={submitting || (container && container.status !== 'ARRIVED')}
              style={{
                ...styles.submitButton,
                opacity: (submitting || (container && container.status !== 'ARRIVED')) ? 0.6 : 1
              }}
            >
              {submitting ? 'Filing...' : 'Submit Declaration'}
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
    maxWidth: '700px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    color: '#0f172a'
  },
  subtitle: {
    margin: '0 0 25px 0',
    color: '#64748b',
    fontSize: '16px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '40px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formGroupCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '5px 0'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#3b82f6'
    }
  },
  select: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    backgroundColor: '#ffffff'
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    resize: 'vertical'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkLabel: {
    fontSize: '14px',
    color: '#334155',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '14px 28px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
    marginTop: '10px'
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
    marginBottom: '20px',
    fontSize: '14px'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#64748b'
  }
};

export default FileDeclaration;
