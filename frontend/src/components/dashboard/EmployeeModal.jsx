import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, DollarSign, Calendar, Award } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering', 'Product Management', 'Sales', 'Marketing',
  'Human Resources', 'Finance', 'Operations', 'Design', 'Legal'
];

const POSITIONS = [
  'Junior Developer', 'Senior Developer', 'Lead Developer', 'Engineering Manager',
  'Product Manager', 'Project Manager', 'Sales Representative', 'Sales Manager',
  'Marketing Specialist', 'Marketing Manager', 'HR Specialist', 'HR Manager',
  'Financial Analyst', 'Finance Manager', 'Operations Analyst', 'Operations Manager',
  'UX Designer', 'UI Designer', 'Legal Counsel', 'Director', 'Vice President', 'Executive'
];

// Defined outside of EmployeeModal to prevent component re-creation and input focus loss on every render
const Field = ({ icon: Icon, label, name, type = 'text', children, required, viewMode, value, onChange, error, placeholder }) => (
  <div className="form-group">
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Icon && <Icon size={14} style={{ color: 'var(--primary)' }} />}
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>
    {children || (
      viewMode ? (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontSize: '0.95rem'
        }}>
          {type === 'salary'
            ? `$${Number(value).toLocaleString()}`
            : value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </div>
      ) : (
        <>
          <input
            type={type === 'salary' ? 'number' : type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="form-control"
            style={{ borderColor: error ? 'var(--accent)' : undefined }}
          />
          {error && <span className="form-error">{error}</span>}
        </>
      )
    )}
  </div>
);

export default function EmployeeModal({ show, employee, onClose, onSubmit, submitting }) {
  const isEditing = !!employee?.id;

  const emptyForm = {
    name: '', email: '', phone: '', department: '',
    position: '', username: '', salary: '', joinDate: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    if (show) {
      if (employee && employee._viewOnly) {
        setViewMode(true);
        setForm({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          department: employee.department || '',
          position: employee.position || '',
          username: employee.username || '',
          salary: employee.salary || '',
          joinDate: employee.joinDate || '',
        });
      } else if (employee && employee.id) {
        setViewMode(false);
        setForm({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          department: employee.department || '',
          position: employee.position || '',
          username: employee.username || '',
          salary: employee.salary || '',
          joinDate: employee.joinDate || '',
        });
      } else {
        setViewMode(false);
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [show, employee]);

  if (!show) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\+?[0-9\s\-()]{10,15}$/.test(form.phone.trim())) {
      e.phone = 'Phone number must be between 10 and 15 digits';
    }
    
    if (!form.department) e.department = 'Department is required';
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0) e.salary = 'Valid salary required';
    if (!form.joinDate) e.joinDate = 'Join date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await onSubmit({ ...form, salary: parseFloat(form.salary) });
      onClose();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container glass-panel" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 className="modal-title" style={{ fontSize: '1.35rem' }}>
              {viewMode ? '👤 Employee Profile' : isEditing ? '✏️ Edit Employee' : '➕ Add Employee'}
            </h2>
            {viewMode && employee && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{employee.id}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {viewMode && (
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                onClick={() => { setViewMode(false); }}
              >
                Edit
              </button>
            )}
            <button className="btn-close" onClick={onClose}><X size={22} /></button>
          </div>
        </div>

        <form onSubmit={viewMode ? (e) => e.preventDefault() : handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field icon={User} label="Full Name" name="name" required viewMode={viewMode} value={form.name} onChange={handleChange} error={errors.name} />
            <Field icon={User} label="Linked Username (optional)" name="username" viewMode={viewMode} value={form.username} onChange={handleChange} error={errors.username} placeholder="E.g. mukund" />
            <Field icon={Mail} label="Email Address" name="email" type="email" required viewMode={viewMode} value={form.email} onChange={handleChange} error={errors.email} />
            <Field icon={Phone} label="Phone Number" name="phone" required viewMode={viewMode} value={form.phone} onChange={handleChange} error={errors.phone} />
            <Field icon={Briefcase} label="Department" name="department" required viewMode={viewMode}>
              {viewMode ? (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                  <span className="badge badge-dept">{form.department || '—'}</span>
                </div>
              ) : (
                <>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="form-control"
                    style={{ borderColor: errors.department ? 'var(--accent)' : undefined }}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="form-error">{errors.department}</span>}
                </>
              )}
            </Field>
            <Field icon={Award} label="Position / Title" name="position" viewMode={viewMode}>
              {viewMode ? (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)' }}>
                  {form.position || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </div>
              ) : (
                <>
                  <select 
                    name="position" 
                    value={form.position} 
                    onChange={handleChange} 
                    className="form-control"
                    style={{ borderColor: errors.position ? 'var(--accent)' : undefined }}
                  >
                    <option value="">Select Position (optional)</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.position && <span className="form-error">{errors.position}</span>}
                </>
              )}
            </Field>
            <Field icon={DollarSign} label="Monthly Salary" name="salary" type="salary" required viewMode={viewMode}>
              {viewMode ? (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                    ${Number(form.salary).toLocaleString()}
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="100"
                    style={{ borderColor: errors.salary ? 'var(--accent)' : undefined }}
                  />
                  {errors.salary && <span className="form-error">{errors.salary}</span>}
                </>
              )}
            </Field>
            <Field icon={Calendar} label="Join Date" name="joinDate" type="date" required viewMode={viewMode} value={form.joinDate} onChange={handleChange} error={errors.joinDate} />
          </div>

          {viewMode && employee?.createdAt && (
            <div style={{
              marginTop: '8px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <span>Created: {new Date(employee.createdAt).toLocaleString()}</span>
              {employee.updatedAt && <span>Updated: {new Date(employee.updatedAt).toLocaleString()}</span>}
            </div>
          )}

          {!viewMode && (
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEditing ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
