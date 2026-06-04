import React from 'react';
import { Users, DollarSign, Briefcase, Loader2 } from 'lucide-react';

export default function StatsGrid({ stats, loading }) {
  const getCardValue = (val, isCurrency = false) => {
    if (loading || !stats) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.5 }}>
          <Loader2 size={16} className="animate-spin" />
        </span>
      );
    }
    if (isCurrency) {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return val;
  };

  const activeDepts = stats?.departmentCounts ? Object.keys(stats.departmentCounts).length : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Total Personnel</h3>
          <div className="value">{getCardValue(stats?.totalEmployees)}</div>
        </div>
        <div className="stat-icon">
          <Users size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel cyan">
        <div className="stat-details">
          <h3>Active Departments</h3>
          <div className="value">{getCardValue(activeDepts)}</div>
        </div>
        <div className="stat-icon">
          <Briefcase size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel emerald">
        <div className="stat-details">
          <h3>Monthly Payroll</h3>
          <div className="value">{getCardValue(stats?.totalPayroll, true)}</div>
        </div>
        <div className="stat-icon">
          <DollarSign size={24} />
        </div>
      </div>

      <div className="stat-card glass-panel rose">
        <div className="stat-details">
          <h3>Average Salary</h3>
          <div className="value">{getCardValue(stats?.averageSalary, true)}</div>
        </div>
        <div className="stat-icon">
          <DollarSign size={24} />
        </div>
      </div>
    </div>
  );
}
