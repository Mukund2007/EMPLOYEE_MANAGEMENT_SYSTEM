import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordForm({ prefillToken = '', onSuccess }) {
  const [token, setToken]             = useState(prefillToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [done, setDone]               = useState(false);

  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 8)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0‑5
  };
  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#06b6d4'][strength];

  const validate = () => {
    if (!token.trim())       return 'Reset token is required';
    if (newPassword.length < 6) return 'Password must be at least 6 characters';
    if (newPassword !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim().toUpperCase(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-panel" style={{ animation: 'fadeIn 0.4s ease-out', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={36} style={{ color: 'var(--success)' }} />
            </div>
            <h2 className="auth-title" style={{ marginBottom: 0 }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={onSuccess}
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ fontSize: '1.2rem' }}>🔐</div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your reset token and choose a new password</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', marginBottom: '20px', borderRadius: '10px',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
            color: '#fda4af', fontSize: '0.88rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Reset Token */}
          <div className="form-group">
            <label>Reset Token <span style={{ color: 'var(--accent)' }}>*</span></label>
            <div className="input-wrapper">
              <KeyRound size={18} />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                className="form-control"
                placeholder="Enter 8-character token"
                maxLength={8}
                style={{
                  letterSpacing: token ? '4px' : '0',
                  fontFamily: token ? 'monospace' : 'inherit',
                  fontWeight: token ? 700 : 400,
                  fontSize: token ? '1.1rem' : 'inherit',
                }}
                autoFocus={!prefillToken}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Check the token you received on the forgot password page
            </span>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label>New Password <span style={{ color: 'var(--accent)' }}>*</span></label>
            <div className="input-wrapper">
              <KeyRound size={18} />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                placeholder="New password (min 6 characters)"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      flex: 1,
                      background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                      borderRadius: '2px',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.73rem', color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm New Password <span style={{ color: 'var(--accent)' }}>*</span></label>
            <div className="input-wrapper">
              <KeyRound size={18} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="form-control"
                placeholder="Repeat new password"
                style={{
                  paddingRight: '44px',
                  borderColor: confirm && confirm !== newPassword ? 'var(--accent)' : confirm && confirm === newPassword ? 'var(--success)' : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirm && confirm !== newPassword && (
              <span className="form-error">Passwords do not match</span>
            )}
            {confirm && confirm === newPassword && (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle size={13} /> Passwords match
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-toggle" style={{ marginTop: '24px' }}>
          <span
            className="auth-toggle-link"
            onClick={onSuccess}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
