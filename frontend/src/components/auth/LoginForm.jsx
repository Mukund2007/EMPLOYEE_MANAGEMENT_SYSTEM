import React, { useState } from 'react';
import { Users, Key, LogIn, Shield } from 'lucide-react';

export default function LoginForm({ onSubmit, onToggle, onForgotPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username, password, role);
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">EMS</div>
          <h2 className="auth-title">System Sign In</h2>
          <p className="auth-subtitle">Access employee database portal</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <Users size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control" 
                placeholder="Enter username" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password</span>
              <span
                onClick={onForgotPassword}
                style={{ fontSize: '0.78rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot password?
              </span>
            </label>
            <div className="input-wrapper">
              <Key size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control" 
                placeholder="Enter password" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>System Role</label>
            <div className="input-wrapper">
              <Shield size={18} />
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '44px' }}
              >
                <option value="ROLE_USER">User (Read-only)</option>
                <option value="ROLE_ADMIN">Administrator (Full Access)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="auth-toggle">
          Don't have an account?{' '}
          <span className="auth-toggle-link" onClick={onToggle}>
            Register here
          </span>
        </div>

        {/* Demo Accounts Quick Guide */}
        <div style={{ 
          marginTop: '20px', 
          padding: '12px 14px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '10px', 
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Demo Accounts:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>🛡️ <strong>Admin:</strong> <code>testadmin</code> (pwd: <code>password123</code>)</div>
            <div>👤 <strong>User:</strong> <code>testuser1</code> (pwd: <code>password123</code>)</div>
          </div>
        </div>
      </div>
    </div>
  );
}


