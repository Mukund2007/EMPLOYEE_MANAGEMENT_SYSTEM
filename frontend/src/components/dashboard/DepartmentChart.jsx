import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(18,18,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem'
      }}>
        <p style={{ fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].name}</p>
        <p style={{ color: 'var(--text-secondary)' }}>Employees: <strong style={{ color: 'white' }}>{payload[0].value}</strong></p>
        <p style={{ color: 'var(--text-secondary)' }}>Share: <strong style={{ color: payload[0].payload.fill }}>{payload[0].payload.percent}%</strong></p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(18,18,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem'
      }}>
        <p style={{ fontWeight: 700, color: 'white', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: 'var(--text-secondary)' }}>
            {p.name}: <strong style={{ color: p.fill || p.color }}>{p.name.includes('Salary') || p.name.includes('Payroll') ? `$${Number(p.value).toLocaleString()}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DepartmentChart({ stats, employees }) {
  if (!stats?.departmentCounts && employees.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No data available for analytics</p>
      </div>
    );
  }

  // Build department data
  const deptCounts = stats?.departmentCounts || {};
  const deptMap = {};
  employees.forEach(emp => {
    if (emp.department) {
      if (!deptMap[emp.department]) deptMap[emp.department] = { count: 0, salary: 0 };
      deptMap[emp.department].count += 1;
      deptMap[emp.department].salary += emp.salary || 0;
    }
  });

  const combinedMap = Object.keys({ ...deptCounts, ...deptMap }).reduce((acc, dept) => {
    acc[dept] = {
      count: deptCounts[dept] || deptMap[dept]?.count || 0,
      avgSalary: deptMap[dept] ? Math.round(deptMap[dept].salary / (deptMap[dept].count || 1)) : 0,
    };
    return acc;
  }, {});

  const total = Object.values(combinedMap).reduce((s, d) => s + d.count, 0) || 1;

  const pieData = Object.entries(combinedMap).map(([name, d], i) => ({
    name,
    value: d.count,
    fill: COLORS[i % COLORS.length],
    percent: ((d.count / total) * 100).toFixed(1),
  }));

  const barData = Object.entries(combinedMap).map(([name, d], i) => ({
    name: name.length > 12 ? name.substring(0, 12) + '…' : name,
    fullName: name,
    Headcount: d.count,
    'Avg Salary': d.avgSalary,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
      {/* Pie Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>
          Personnel Distribution
        </h3>
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{value}</span>}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>
          Headcount by Department
        </h3>
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Headcount" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary range bar */}
      {barData.some(d => d['Avg Salary'] > 0) && (
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>
            Average Salary by Department
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Avg Salary" radius={[6, 6, 0, 0]} fill="url(#salaryGrad)" />
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
