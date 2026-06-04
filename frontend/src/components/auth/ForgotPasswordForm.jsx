import React, { useState } from 'react';
import { User, ArrowLeft, KeyRound, Copy, Check, AlertCircle } from 'lucide-react';

export default function ForgotPasswordForm({ onToggle, onProceedToReset }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { token, expiresIn }
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      if (data.resetToken) {
        setResult({ token: data.resetToken, expiresIn: data.expiresIn });
      } else {
        setError(data.hint || data.message || 'No account found with that username.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(result.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ fontSize: '1.2rem' }}>🔑</div>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">
            {result ? 'Copy your reset token below' : 'Enter your username to get a reset token'}
          </p>
        </div>

        {!result ? (
          /* ── Step 1: Enter username ── */
          <>
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
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    placeholder="Enter your username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading || !username.trim()}
              >
                {loading ? 'Generating token…' : 'Get Reset Token'}
              </button>
            </form>
          </>
        ) : (
          /* ── Step 2: Show reset token ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your Reset Token
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <code style={{
                  flex: 1, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '6px',
                  color: 'var(--success)', fontFamily: 'monospace',
                  textAlign: 'center', padding: '8px 0'
                }}>
                  {result.token}
                </code>
                <button
                  onClick={copyToken}
                  className="btn btn-secondary"
                  style={{ padding: '10px', flexShrink: 0 }}
                  title="Copy token"
                >
                  {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                ⏱ Expires in {result.expiresIn}
              </p>
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.83rem', color: '#fcd34d', lineHeight: 1.6
            }}>
              <strong>⚠ Save this token now!</strong> Copy it before proceeding — you won't see it again after leaving this page.
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => onProceedToReset(result.token)}
            >
              <KeyRound size={16} /> Use Token to Reset Password
            </button>
          </div>
        )}

        <div className="auth-toggle" style={{ marginTop: '24px' }}>
          <span
            className="auth-toggle-link"
            onClick={onToggle}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
