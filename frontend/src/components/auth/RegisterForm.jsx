import React, { useState } from 'react';
import { Users, Key, Shield, UserPlus } from 'lucide-react';

export default function RegisterForm({ onSubmit, onToggle, fieldErrors }) {
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register to manage employee rosters</p>
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
                placeholder="Create a username" 
                required 
              />
            </div>
            {fieldErrors?.username && <span className="form-error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Key size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control" 
                placeholder="Create password (min 6 characters)" 
                required 
              />
            </div>
            {fieldErrors?.password && <span className="form-error">{fieldErrors.password}</span>}
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
            <UserPlus size={18} /> Create Account
          </button>
        </form>

        <div className="auth-toggle">
          Already registered?{' '}
          <span className="auth-toggle-link" onClick={onToggle}>
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
}
