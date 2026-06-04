import React from 'react';

export default function ConfirmationDialog({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-panel" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="modal-header" style={{ justifyContent: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
          <h3 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.2rem' }}>
            {title || 'Are you sure?'}
          </h3>
        </div>
        <p style={{ margin: '20px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
