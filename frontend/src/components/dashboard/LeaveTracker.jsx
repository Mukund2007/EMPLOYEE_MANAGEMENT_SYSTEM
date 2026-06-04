import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, X } from 'lucide-react';

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID'];

const STATUS_STYLES = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Pending', Icon: Clock },
  APPROVED: { color: 'var(--success)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', label: 'Approved', Icon: CheckCircle },
  REJECTED: { color: 'var(--accent)', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.25)', label: 'Rejected', Icon: XCircle },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const { Icon } = s;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`
    }}>
      <Icon size={12} /> {s.label}
    </span>
  );
}

export default function LeaveTracker({
  leaves,
  myProfile,
  user,
  submitting,
  onFetchLeaves,
  onCreateLeave,
  onUpdateLeaveStatus,
  myLinkRequest,
  onCreateLinkRequest
}) {
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [showForm, setShowForm] = useState(false);
  const [adminView, setAdminView] = useState('all'); // 'all' | 'pending'
  const [form, setForm] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showLinkRequestForm, setShowLinkRequestForm] = useState(false);
  const [linkRequestMessage, setLinkRequestMessage] = useState('');
  const [requestingLink, setRequestingLink] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      onFetchLeaves(null);
    } else {
      onFetchLeaves(myProfile?.id || 'me');
    }
  }, [myProfile, isAdmin]);

  const validate = () => {
    const e = {};
    if (!form.startDate) e.startDate = 'Start date required';
    if (!form.endDate) e.endDate = 'End date required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End must be after start';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    try {
      await onCreateLeave({ ...form, employeeId: myProfile?.id || null });
      setShowForm(false);
      setForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      onFetchLeaves(myProfile?.id || 'me');
    } catch (_) {}
  };

  const handleLinkRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestingLink(true);
    try {
      await onCreateLinkRequest(linkRequestMessage);
      setShowLinkRequestForm(false);
      setLinkRequestMessage('');
    } catch (_) {
    } finally {
      setRequestingLink(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await onUpdateLeaveStatus(id, status);
      onFetchLeaves(isAdmin ? null : (myProfile?.id || 'me'));
    } catch (_) {}
  };

  const displayedLeaves = isAdmin && adminView === 'pending'
    ? leaves.filter(l => l.status === 'PENDING')
    : leaves;

  const calcDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            Leave Requests
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isAdmin ? 'Manage all employee leave requests' : 'Submit and track your leave requests'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', border: '1px solid var(--glass-border)' }}>
              {['all', 'pending'].map(v => (
                <button
                  key={v}
                  onClick={() => setAdminView(v)}
                  className={`btn ${adminView === v ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', ...(adminView !== v ? { background: 'transparent', border: 'none', color: 'var(--text-secondary)' } : {}) }}
                >
                  {v === 'all' ? 'All' : 'Pending'}
                  {v === 'pending' && (
                    <span style={{ marginLeft: '6px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem' }}>
                      {leaves.filter(l => l.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {!isAdmin && myProfile && (
            <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 16px' }} onClick={() => setShowForm(!showForm)}>
              {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Request Leave</>}
            </button>
          )}
        </div>
      </div>

      {!isAdmin && !myProfile && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: '#f59e0b', margin: '0 auto 4px' }} />
          
          <div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
              No employee profile linked to your account.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', maxWidth: '480px' }}>
              {myLinkRequest?.status === 'PENDING'
                ? 'Your request to link this user account to an employee profile is pending admin approval.'
                : 'Ask an admin to enter your username in your employee profile, or submit a request below.'
              }
            </p>
          </div>

          {myLinkRequest?.status === 'PENDING' ? (
            <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              Pending Admin Approval...
            </span>
          ) : (
            <>
              {!showLinkRequestForm ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowLinkRequestForm(true)}
                  style={{ fontSize: '0.85rem', padding: '10px 20px' }}
                >
                  Request Account Link
                </button>
              ) : (
                <form onSubmit={handleLinkRequestSubmit} style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', animation: 'fadeIn 0.2s ease-out' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.78rem', textAlign: 'left', display: 'block', marginBottom: '4px' }}>
                      Optional Message to Admin
                    </label>
                    <textarea
                      className="form-control"
                      value={linkRequestMessage}
                      onChange={(e) => setLinkRequestMessage(e.target.value)}
                      placeholder="E.g., I am Arjun Mehta in Engineering"
                      rows={2}
                      style={{ resize: 'vertical', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                      disabled={requestingLink}
                    >
                      {requestingLink ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowLinkRequestForm(false)}
                      style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Leave Request Form */}
      {showForm && !isAdmin && (
        <div className="glass-panel" style={{ padding: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} /> New Leave Request
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Leave Type</label>
                <select
                  className="form-control"
                  value={form.leaveType}
                  onChange={(e) => setForm(p => ({ ...p, leaveType: e.target.value }))}
                >
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Start Date <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                  style={{ borderColor: formErrors.startDate ? 'var(--accent)' : undefined }}
                />
                {formErrors.startDate && <span className="form-error">{formErrors.startDate}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>End Date <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                  style={{ borderColor: formErrors.endDate ? 'var(--accent)' : undefined }}
                />
                {formErrors.endDate && <span className="form-error">{formErrors.endDate}</span>}
              </div>
            </div>

            {form.startDate && form.endDate && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                Duration: <strong>{calcDays(form.startDate, form.endDate)} day(s)</strong>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
              <label>Reason <span style={{ color: 'var(--accent)' }}>*</span></label>
              <textarea
                className="form-control"
                value={form.reason}
                onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Briefly describe the reason for your leave..."
                rows={3}
                style={{ resize: 'vertical', borderColor: formErrors.reason ? 'var(--accent)' : undefined }}
              />
              {formErrors.reason && <span className="form-error">{formErrors.reason}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Cards */}
      {displayedLeaves.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)' }}>
            {isAdmin ? 'No leave requests found.' : 'You have no leave requests yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedLeaves.map(leave => (
            <div
              key={leave.id}
              className="glass-panel"
              style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {isAdmin && (
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {leave.username ? `@${leave.username}` : leave.employeeId ? `Employee #${leave.employeeId}` : 'Unknown'}
                    </span>
                  )}
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)'
                  }}>
                    {leave.leaveType}
                  </span>
                  <StatusBadge status={leave.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {calcDays(leave.startDate, leave.endDate)} day(s)
                  </span>
                </div>
                {leave.reason && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{leave.reason}"
                  </p>
                )}
              </div>

              {isAdmin && leave.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}
                    onClick={() => handleStatusChange(leave.id, 'APPROVED')}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(244,63,94,0.1)', color: 'var(--accent)', border: '1px solid rgba(244,63,94,0.25)' }}
                    onClick={() => handleStatusChange(leave.id, 'REJECTED')}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
