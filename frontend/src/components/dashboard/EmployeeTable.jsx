import React from 'react';
import { Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering', 'Product Management', 'Sales', 'Marketing',
  'Human Resources', 'Finance', 'Operations', 'Design', 'Legal'
];

export default function EmployeeTable({
  employees,
  loading,
  user,
  sortBy,
  sortOrder,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  salaryRange,
  setSalaryRange,
  showFilters,
  setShowFilters,
  filteredCount,
  totalCount,
  onExportCSV,
  onAdd,
}) {
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const SortableHeader = ({ field, label }) => (
    <th
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {label}
        <ArrowUpDown
          size={13}
          style={{
            color: sortBy === field ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        />
        {sortBy === field && (
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700 }}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </th>
  );

  const SkeletonRow = () => (
    <tr>
      {[...Array(isAdmin ? 8 : 7)].map((_, i) => (
        <td key={i}>
          <div
            style={{
              height: '14px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              animation: 'pulse 1.5s infinite ease-in-out',
              width: `${60 + Math.random() * 30}%`,
            }}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-input-group input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              placeholder="Search name, email, department..."
              style={{ paddingLeft: '44px' }}
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {showFilters ? 'Hide Filters' : 'Salary Filter'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filteredCount}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> records
          </div>
          <button onClick={onExportCSV} className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            CSV
          </button>
          {isAdmin && (
            <button onClick={onAdd} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Salary Range Filter */}
      {showFilters && (
        <div
          className="glass-panel"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', animation: 'fadeIn 0.2s ease-out' }}
        >
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Max Monthly Salary:{' '}
            <span style={{ color: 'var(--primary)' }}>${salaryRange.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1000000"
            step="10000"
            value={salaryRange}
            onChange={(e) => setSalaryRange(Number(e.target.value))}
            style={{ flex: 1, minWidth: '200px', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <button
            onClick={() => { setSalaryRange(1000000); setSelectedDept(''); setSearchTerm(''); }}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container glass-panel" style={{ borderRadius: '16px' }}>
        <table className="employee-table">
          <thead>
            <tr>
              <th>#</th>
              <SortableHeader field="name" label="Employee" />
              <SortableHeader field="department" label="Department" />
              <th>Phone</th>
              <th>Position</th>
              <SortableHeader field="salary" label="Salary" />
              <SortableHeader field="joinDate" label="Join Date" />
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>No employees found matching your criteria</span>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => onView(emp)}
                >
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {(currentPage * 10) + index + 1}
                  </td>
                  <td>
                    <div className="employee-name-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${(emp.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 35%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, color: 'white',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          {emp.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="employee-name">{emp.name}</div>
                          <div className="employee-email">{emp.email}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-dept">{emp.department}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.position || '—'}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--success)' }}>
                      ${Number(emp.salary).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        className="btn-icon"
                        title="View details"
                        onClick={(e) => { e.stopPropagation(); onView(emp); }}
                      >
                        <Eye size={15} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="btn-icon edit"
                            title="Edit employee"
                            onClick={(e) => { e.stopPropagation(); onEdit(emp); }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete employee"
                            onClick={(e) => { e.stopPropagation(); onDelete(emp); }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            let page = i;
            if (totalPages > 7) {
              if (currentPage < 4) page = i;
              else if (currentPage > totalPages - 4) page = totalPages - 7 + i;
              else page = currentPage - 3 + i;
            }
            return (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', minWidth: '40px' }}
                onClick={() => onPageChange(page)}
              >
                {page + 1}
              </button>
            );
          })}

          <button
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
