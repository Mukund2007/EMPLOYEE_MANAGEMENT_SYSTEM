import React from 'react';
import { Users, LogOut, Calendar, User, Shield, BarChart2, UserCheck } from 'lucide-react';

export default function Sidebar({ user, currentTab, setCurrentTab, onLogout, pendingRequestsCount }) {
  const isAdmin = user?.role === 'ROLE_ADMIN';
  return (
    <div className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-logo">EM</div>
          <div className="brand-name">StaffPortal</div>
        </div>

        <ul className="nav-links">
          <li 
            className={`nav-item ${currentTab === 'employees' ? 'active' : ''}`}
            onClick={() => setCurrentTab('employees')}
          >
            <Users size={18} />
            Employees
          </li>
          <li 
            className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentTab('analytics')}
          >
            <BarChart2 size={18} />
            Analytics
          </li>
          <li 
            className={`nav-item ${currentTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setCurrentTab('leaves')}
          >
            <Calendar size={18} />
            Leave Requests
          </li>
          {isAdmin && (
            <li 
              className={`nav-item ${currentTab === 'requests' ? 'active' : ''}`}
              onClick={() => setCurrentTab('requests')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={18} />
                Requests
              </div>
              {pendingRequestsCount > 0 && (
                <span style={{
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  marginRight: '6px'
                }}>
                  {pendingRequestsCount}
                </span>
              )}
            </li>
          )}
        </ul>
      </div>

      <div className="sidebar-footer">
        {/* Profile Link in Footer */}
        <div 
          className={`user-info nav-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
          style={{ cursor: 'pointer', padding: '8px', borderLeft: currentTab === 'profile' ? '3px solid var(--primary)' : 'none' }}
        >
          <div className="user-avatar" style={{ border: currentTab === 'profile' ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
            <User size={18} />
          </div>
          <div className="user-details">
            <span className="username" style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user?.username}</span>
            <span className="user-role" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} /> {user?.role ? user.role.replace('ROLE_', '') : ''}
            </span>
          </div>
        </div>
        
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
