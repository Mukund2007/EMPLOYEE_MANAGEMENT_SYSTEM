import React, { useState } from 'react';
import { UserCheck, ShieldAlert, X, AlertCircle } from 'lucide-react';

export default function RequestsPage({
  requests,
  employees,
  onLink,
  onDismiss,
  submitting
}) {
  const [linkingRequestId, setLinkingRequestId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const handleLinkClick = (requestId) => {
    setLinkingRequestId(requestId);
    setSelectedEmployeeId('');
  };

  const handleCancelClick = () => {
    setLinkingRequestId(null);
    setSelectedEmployeeId('');
  };

  const handleConfirmLink = async (requestId) => {
    if (!selectedEmployeeId) {
      alert('Please select an employee.');
      return;
    }
    try {
      await onLink(requestId, Number(selectedEmployeeId));
      setLinkingRequestId(null);
      setSelectedEmployeeId('');
    } catch (_) {}
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
          Account Link Requests
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Approve or dismiss account link requests from unregistered users
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <UserCheck size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No pending link requests found. All accounts are up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'rgba(59,130,246,0.12)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(59,130,246,0.2)'
                  }}>
                    PENDING LINK
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    @{req.username}
                  </h3>
                  {req.message ? (
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      marginTop: '8px',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}>
                      "{req.message}"
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      No description message provided.
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: '260px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {linkingRequestId === req.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      className="form-control"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      style={{ minWidth: '180px', fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      <option value="">Select Employee...</option>
                      {employees
                        .filter(emp => !emp.username) // Only show unlinked employees
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department})
                          </option>
                        ))}
                    </select>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleConfirmLink(req.id)}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      disabled={submitting}
                    >
                      Confirm
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelClick}
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleLinkClick(req.id)}
                      style={{ fontSize: '0.82rem', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <UserCheck size={14} /> Link Employee
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => onDismiss(req.id)}
                      style={{
                        fontSize: '0.82rem',
                        padding: '9px 16px',
                        borderColor: 'rgba(244,63,94,0.2)',
                        color: 'var(--accent)',
                        background: 'rgba(244,63,94,0.02)'
                      }}
                      disabled={submitting}
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
