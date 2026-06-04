import React, { useState } from 'react';
import { User, Shield, Key, Eye, EyeOff, CheckCircle, Mail, Phone, Briefcase, Award, DollarSign, Calendar } from 'lucide-react';

export default function ProfilePage({ user, myProfile, onChangePassword, submitting }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.oldPassword) e.oldPassword = 'Current password required';
    if (!form.newPassword) e.newPassword = 'New password required';
    else if (form.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm new password';
    else if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await onChangePassword(form.oldPassword, form.newPassword);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrors({ oldPassword: err.message });
    }
  };

  const PasswordField = ({ label, field, show, setShow }) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <Key size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type={show ? 'text' : 'password'}
          className="form-control"
          value={form[field]}
          onChange={(e) => { setForm(p => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors(p => ({ ...p, [field]: undefined })); }}
          style={{ paddingLeft: '44px', paddingRight: '44px', borderColor: errors[field] ? 'var(--accent)' : undefined }}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && <span className="form-error">{errors[field]}</span>}
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value, valueStyle }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: 'var(--primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 500, ...valueStyle }}>{value || '—'}</div>
      </div>
    </div>
  );

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>My Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Your account information and security settings
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Account Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700, color: 'white',
              boxShadow: '0 0 20px rgba(59,130,246,0.35)',
              flexShrink: 0
            }}>
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>{user?.username}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <Shield size={13} style={{ color: isAdmin ? '#f59e0b' : 'var(--primary)' }} />
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '12px',
                  background: isAdmin ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                  color: isAdmin ? '#f59e0b' : 'var(--primary)',
                  border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`
                }}>
                  {isAdmin ? 'ADMINISTRATOR' : 'USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Employee Profile */}
          {myProfile ? (
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>Linked Employee Record</h4>
              <InfoRow icon={User} label="Full Name" value={myProfile.name} />
              <InfoRow icon={Mail} label="Email" value={myProfile.email} />
              <InfoRow icon={Phone} label="Phone" value={myProfile.phone} />
              <InfoRow icon={Briefcase} label="Department" value={myProfile.department} />
              <InfoRow icon={Award} label="Position" value={myProfile.position} />
              <InfoRow icon={DollarSign} label="Salary" value={`$${Number(myProfile.salary).toLocaleString()}`} valueStyle={{ color: 'var(--success)', fontWeight: 700 }} />
              <InfoRow icon={Calendar} label="Join Date" value={myProfile.joinDate ? new Date(myProfile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
            </div>
          ) : (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No linked employee record. Ask an admin to set your username in your employee profile.
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--primary)' }} /> Change Password
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Update your account password regularly for security.
            </p>
          </div>

          {success && (
            <div style={{
              padding: '12px 16px', marginBottom: '16px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.9rem', animation: 'fadeIn 0.3s ease-out'
            }}>
              <CheckCircle size={16} /> Password updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField label="Current Password" field="oldPassword" show={showOld} setShow={setShowOld} />
            <PasswordField label="New Password" field="newPassword" show={showNew} setShow={setShowNew} />
            <PasswordField label="Confirm New Password" field="confirmPassword" show={showConfirm} setShow={setShowConfirm} />

            {/* Password strength indicator */}
            {form.newPassword && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                  {[1,2,3,4].map(i => {
                    const strength = form.newPassword.length >= 8
                      ? (form.newPassword.match(/[A-Z]/) ? 1 : 0) + (form.newPassword.match(/[0-9]/) ? 1 : 0) + (form.newPassword.match(/[^A-Za-z0-9]/) ? 1 : 0) + 1
                      : form.newPassword.length >= 6 ? 1 : 0;
                    return (
                      <div key={i} style={{ flex: 1, background: i <= strength ? (strength <= 1 ? 'var(--accent)' : strength <= 2 ? '#f59e0b' : strength <= 3 ? '#3b82f6' : 'var(--success)') : 'rgba(255,255,255,0.08)', borderRadius: '2px', transition: 'background 0.3s' }} />
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {form.newPassword.length < 6 ? 'Too short' : form.newPassword.length < 8 ? 'Weak' : form.newPassword.match(/[A-Z]/) && form.newPassword.match(/[0-9]/) ? 'Strong' : 'Good'}
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
