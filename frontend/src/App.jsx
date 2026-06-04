import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';

// Common Components
import Notification from './components/common/Notification';
import ConfirmationDialog from './components/common/ConfirmationDialog';

// Dashboard Components
import Sidebar from './components/dashboard/Sidebar';
import StatsGrid from './components/dashboard/StatsGrid';
import EmployeeTable from './components/dashboard/EmployeeTable';
import EmployeeModal from './components/dashboard/EmployeeModal';
import LeaveTracker from './components/dashboard/LeaveTracker';
import ProfilePage from './components/dashboard/ProfilePage';
import DepartmentChart from './components/dashboard/DepartmentChart';
import RequestsPage from './components/dashboard/RequestsPage';

// Hooks & Services
import { useAuth } from './hooks/useAuth';
import { useEmployees } from './hooks/useEmployees';

import './App.css';

// ─────────────────────────────────────────────
// Activity log helpers (stored in localStorage)
// ─────────────────────────────────────────────
const INITIAL_ACTIVITIES = [
  { id: 1, text: 'Employee Database System initialized', timestamp: '14:30:15' },
  { id: 2, text: 'Security policies loaded', timestamp: '14:32:00' },
];

function useActivityLog() {
  const [activities, setActivities] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ems_activities')) || INITIAL_ACTIVITIES; }
    catch { return INITIAL_ACTIVITIES; }
  });

  const log = useCallback((text) => {
    const ts = new Date().toTimeString().split(' ')[0];
    setActivities(prev => {
      const updated = [{ id: Date.now(), text, timestamp: ts }, ...prev].slice(0, 8);
      localStorage.setItem('ems_activities', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { activities, log };
}

// ─────────────────────────────────────────────
// CSV Export utility
// ─────────────────────────────────────────────
function exportCSV(employees) {
  if (!employees.length) return;
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Join Date'];
  const rows = employees.map(emp => [
    emp.id,
    `"${(emp.name || '').replace(/"/g, '""')}"`,
    `"${(emp.email || '').replace(/"/g, '""')}"`,
    `"${(emp.phone || '').replace(/"/g, '""')}"`,
    `"${(emp.department || '').replace(/"/g, '""')}"`,
    `"${(emp.position || '').replace(/"/g, '""')}"`,
    emp.salary,
    emp.joinDate,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'employee_roster.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────
export default function App() {
  // Theme
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ems_theme') !== 'light');

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (darkMode) { cls.remove('light-theme'); localStorage.setItem('ems_theme', 'dark'); }
    else { cls.add('light-theme'); localStorage.setItem('ems_theme', 'light'); }
  }, [darkMode]);

  // Navigation
  const [view, setView] = useState('login'); // 'login' | 'register' | 'dashboard' | 'forgot' | 'reset'
  const [resetPrefillToken, setResetPrefillToken] = useState('');
  const [currentTab, setCurrentTab] = useState('employees'); // 'employees' | 'analytics' | 'leaves' | 'profile'

  // Notification
  const [notification, setNotification] = useState(null);
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Activity log
  const { activities, log: logActivity } = useActivityLog();

  // Auth
  const { user, login, register, logout } = useAuth(showNotification);
  useEffect(() => {
    if (user) { setView('dashboard'); }
    else { setView(prev => prev === 'dashboard' ? 'login' : prev); }
  }, [user]);

  // Employees hook
  const {
    employees, stats, leaves, myProfile, loading, submitting,
    linkRequests, myLinkRequest, fetchEmployees, fetchStats, fetchMyProfile,
    addEmployee, updateEmployee, deleteEmployee,
    changePassword, fetchLeaves, createLeave, updateLeaveStatus,
    fetchLinkRequests, fetchMyLinkRequest, createLinkRequest,
    linkUserToEmployee, dismissLinkRequest
  } = useEmployees(showNotification);

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [salaryRange, setSalaryRange] = useState(300000);
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [modalState, setModalState] = useState({ show: false, employee: null });

  // Confirmation dialog
  const [confirmState, setConfirmState] = useState({ show: false, employee: null });

  // Fetch data when dashboard loads
  useEffect(() => {
    if (user && view === 'dashboard') {
      fetchEmployees(0, 1000, sortBy, sortOrder);
      fetchStats();
      fetchMyProfile();
      if (user.role === 'ROLE_ADMIN') {
        fetchLinkRequests();
      } else {
        fetchMyLinkRequest();
      }
    }
  }, [user, view]);

  // Check linking status for once-off toast notifications
  useEffect(() => {
    if (myLinkRequest && user && user.role !== 'ROLE_ADMIN') {
      const statusKey = `ems_seen_req_${myLinkRequest.id}_${myLinkRequest.status}`;
      const alreadySeen = localStorage.getItem(statusKey);
      
      if (!alreadySeen) {
        if (myLinkRequest.status === 'LINKED') {
          showNotification('Your account has been linked!', 'success');
          localStorage.setItem(statusKey, 'true');
          fetchMyProfile(); // Refresh profile so UI unlocks leaves
        } else if (myLinkRequest.status === 'DISMISSED') {
          showNotification('Your link request was not approved. Contact admin.', 'error');
          localStorage.setItem(statusKey, 'true');
        }
      }
    }
  }, [myLinkRequest, user]);

  // Re-sort when sort state changes
  useEffect(() => {
    if (user && view === 'dashboard') {
      fetchEmployees(0, 1000, sortBy, sortOrder);
      setCurrentPage(0);
    }
  }, [sortBy, sortOrder]);

  // ── Filtering & pagination (client-side slicing) ─────────────
  const filteredEmployees = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q);
    const matchDept = !selectedDept || emp.department === selectedDept;
    const matchSalary = (emp.salary || 0) <= salaryRange;
    return matchSearch && matchDept && matchSalary;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pagedEmployees = filteredEmployees.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(0); };
  const handleDeptFilter = (val) => { setSelectedDept(val); setCurrentPage(0); };
  const handleSalaryRange = (val) => { setSalaryRange(val); setCurrentPage(0); };

  // ── Sort toggle ──────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  // ── Auth handlers ────────────────────────────────────────────
  const handleLogin = async (username, password, selectedRole) => {
    try {
      const data = await login(username, password);
      if (data.role !== selectedRole) {
        showNotification(`This account is registered as ${data.role === 'ROLE_ADMIN' ? 'an Admin' : 'a User'}. Please select the correct system role.`, 'error');
        logout();
        return;
      }
      showNotification(`Welcome back, ${data.username}!`);
      logActivity(`User '${data.username}' signed in`);
    } catch (err) {
      showNotification(err.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const handleRegister = async (username, password, role) => {
    try {
      const data = await register(username, password, role);
      showNotification('Registration successful! Welcome.');
      logActivity(`New user '${data.username}' registered`);
    } catch (err) {
      showNotification(err.message || 'Registration failed.', 'error');
    }
  };

  const handleProceedToReset = (token) => {
    setResetPrefillToken(token);
    setView('reset');
  };

  const handleLogout = () => {
    const name = user?.username;
    logout();
    setView('login');
    showNotification('Logged out successfully.');
    if (name) logActivity(`User '${name}' signed out`);
  };

  // ── Employee CRUD ────────────────────────────────────────────
  const openAddModal = () => setModalState({ show: true, employee: null });
  const openEditModal = (emp) => setModalState({ show: true, employee: { ...emp } });
  const openViewModal = (emp) => setModalState({ show: true, employee: { ...emp, _viewOnly: true } });
  const closeModal = () => setModalState({ show: false, employee: null });

  const handleModalSubmit = async (formData) => {
    if (modalState.employee?.id && !modalState.employee._viewOnly) {
      const updated = await updateEmployee(modalState.employee.id, formData);
      logActivity(`Updated employee: ${formData.name}`);
      await fetchEmployees(0, 1000, sortBy, sortOrder);
      await fetchStats();
      return updated;
    } else {
      const created = await addEmployee(formData);
      logActivity(`Added employee: ${formData.name} (${formData.department})`);
      await fetchEmployees(0, 1000, sortBy, sortOrder);
      await fetchStats();
      return created;
    }
  };

  const handleDeleteClick = (emp) => setConfirmState({ show: true, employee: emp });
  const handleDeleteConfirm = async () => {
    const emp = confirmState.employee;
    setConfirmState({ show: false, employee: null });
    try {
      await deleteEmployee(emp.id);
      logActivity(`Removed employee: ${emp.name}`);
      await fetchEmployees(0, 1000, sortBy, sortOrder);
      await fetchStats();
    } catch (_) {}
  };
  const handleDeleteCancel = () => setConfirmState({ show: false, employee: null });

  const handleExportCSV = () => {
    exportCSV(filteredEmployees);
    showNotification('Roster exported to CSV.');
    logActivity('Exported employee roster to CSV');
  };

  // ── Leave handlers ────────────────────────────────────────────
  const handleFetchLeaves = (employeeId) => fetchLeaves(employeeId);
  const handleCreateLeave = async (data) => {
    const result = await createLeave(data);
    logActivity(`Leave request submitted (${data.leaveType})`);
    return result;
  };
  const handleUpdateLeaveStatus = async (id, status) => {
    const result = await updateLeaveStatus(id, status);
    logActivity(`Leave #${id} ${status.toLowerCase()}`);
    return result;
  };

  // ── Password change ───────────────────────────────────────────
  const handleChangePassword = async (oldPassword, newPassword) => {
    await changePassword(oldPassword, newPassword);
    logActivity('Password changed');
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Global Notification Toast */}
      <Notification notification={notification} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={confirmState.show}
        title="Delete Employee"
        message={`Are you sure you want to remove "${confirmState.employee?.name}"? This action performs a soft delete and can be reversed by an admin.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Employee Add/Edit/View Modal */}
      <EmployeeModal
        show={modalState.show}
        employee={modalState.employee}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        submitting={submitting}
      />

      {/* ── AUTH VIEWS ─────────────────────────────── */}
      {view === 'login' && (
        <LoginForm
          onSubmit={handleLogin}
          onToggle={() => setView('register')}
          onForgotPassword={() => setView('forgot')}
        />
      )}

      {view === 'register' && (
        <RegisterForm
          onSubmit={handleRegister}
          onToggle={() => setView('login')}
        />
      )}

      {view === 'forgot' && (
        <ForgotPasswordForm
          onToggle={() => setView('login')}
          onProceedToReset={handleProceedToReset}
        />
      )}

      {view === 'reset' && (
        <ResetPasswordForm
          prefillToken={resetPrefillToken}
          onSuccess={() => { setResetPrefillToken(''); setView('login'); showNotification('Password reset! Please sign in.'); }}
        />
      )}

      {/* ── DASHBOARD ──────────────────────────────── */}
      {view === 'dashboard' && user && (
        <div className="app-container">
          <Sidebar
            user={user}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onLogout={handleLogout}
            pendingRequestsCount={linkRequests.length}
          />

          <div className="main-content">
            {/* Top bar: title + theme toggle */}
            <div className="dash-header">
              <div className="header-title">
                <h1>
                  {currentTab === 'employees' && 'Employee Directory'}
                  {currentTab === 'analytics' && 'Analytics & Insights'}
                  {currentTab === 'leaves' && 'Leave Management'}
                  {currentTab === 'profile' && 'My Profile'}
                  {currentTab === 'requests' && 'Account Link Requests'}
                </h1>
                <p>
                  {currentTab === 'employees' && 'Manage and search your company personnel'}
                  {currentTab === 'analytics' && 'Visual breakdown of department and payroll data'}
                  {currentTab === 'leaves' && 'Submit, review, and manage leave requests'}
                  {currentTab === 'profile' && 'Your account details and security settings'}
                  {currentTab === 'requests' && 'Review and link incoming registration requests'}
                </p>
              </div>

              <button
                onClick={() => setDarkMode(d => !d)}
                className="btn btn-secondary"
                style={{ padding: '10px 16px', fontSize: '0.85rem', gap: '8px' }}
                title="Toggle theme"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {/* ── EMPLOYEES TAB ──────────────────────── */}
            {currentTab === 'employees' && (
              <>
                <StatsGrid stats={stats} loading={loading} />

                {/* Activity log */}
                <div className="glass-panel" style={{ padding: '20px 24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Clock size={16} style={{ color: 'var(--primary)' }} /> System Activity
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
                    {activities.map(act => (
                      <div key={act.id} style={{ display: 'flex', gap: '10px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)', flexShrink: 0 }} />
                          <div style={{ flex: 1, width: '1px', background: 'var(--glass-border)', marginTop: '3px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--text-secondary)', paddingBottom: '6px' }}>
                          <span>{act.text}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '12px' }}>{act.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <EmployeeTable
                  employees={pagedEmployees}
                  loading={loading}
                  user={user}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                  onView={openViewModal}
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearch}
                  selectedDept={selectedDept}
                  setSelectedDept={handleDeptFilter}
                  salaryRange={salaryRange}
                  setSalaryRange={handleSalaryRange}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  filteredCount={filteredEmployees.length}
                  totalCount={employees.length}
                  onExportCSV={handleExportCSV}
                  onAdd={openAddModal}
                />
              </>
            )}

            {/* ── ANALYTICS TAB ──────────────────────── */}
            {currentTab === 'analytics' && (
              <>
                <StatsGrid stats={stats} loading={loading} />
                <DepartmentChart stats={stats} employees={employees} />
              </>
            )}

            {/* ── LEAVES TAB ─────────────────────────── */}
            {currentTab === 'leaves' && (
              <LeaveTracker
                leaves={leaves}
                myProfile={myProfile}
                user={user}
                submitting={submitting}
                onFetchLeaves={handleFetchLeaves}
                onCreateLeave={handleCreateLeave}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                myLinkRequest={myLinkRequest}
                onCreateLinkRequest={createLinkRequest}
              />
            )}

            {/* ── REQUESTS TAB ────────────────────────── */}
            {currentTab === 'requests' && user.role === 'ROLE_ADMIN' && (
              <RequestsPage
                requests={linkRequests}
                employees={employees}
                onLink={linkUserToEmployee}
                onDismiss={dismissLinkRequest}
                submitting={submitting}
              />
            )}

            {/* ── PROFILE TAB ────────────────────────── */}
            {currentTab === 'profile' && (
              <ProfilePage
                user={user}
                myProfile={myProfile}
                onChangePassword={handleChangePassword}
                submitting={submitting}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
