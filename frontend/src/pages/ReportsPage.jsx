import { useState, useEffect } from 'react';
import {
  employeesByDepartment,
  monthlyAttendance,
  leaveReport,
  payrollSummary,
  exportCSV,
} from '../services/reportService';
import { employees, departments } from '../data/dummyData';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dept');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const deptCount = {};
  employees.forEach((e) => {
    const name = e.department_name || 'Other';
    deptCount[name] = (deptCount[name] || 0) + 1;
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (activeReport === 'dept') {
          const res = await employeesByDepartment();
          const raw = res.data;
          const departments = Array.isArray(raw)
            ? raw.map((d) => ({ name: d.department_name || d.name, count: d.employee_count || d.count }))
            : Object.entries(deptCount).map(([name, count]) => ({ name, count }));
          setData({ departments });
        } else if (activeReport === 'attendance') {
          const res = await monthlyAttendance(month);
          setData(res.data ?? []);
        } else if (activeReport === 'leave') {
          const res = await leaveReport({ month });
          setData(res.data ?? []);
        } else if (activeReport === 'payroll') {
          const res = await payrollSummary(month);
          const d = res.data;
          setData(d != null ? (Array.isArray(d) ? d : [d]) : []);
        }
      } catch {
        if (activeReport === 'dept') setData({ departments: Object.entries(deptCount).map(([name, count]) => ({ name, count })) });
        else setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeReport, month]);

  const handleExport = async (format) => {
    try {
      const res = await exportCSV(activeReport, { month });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${activeReport}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export requires backend. Demo data shown.');
    }
  };

  const reports = [
    { id: 'dept', label: 'Employees by Department' },
    { id: 'attendance', label: 'Monthly Attendance' },
    { id: 'leave', label: 'Leave Report' },
    { id: 'payroll', label: 'Payroll Summary' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex flex-wrap gap-2">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`px-4 py-2 rounded-lg ${
                activeReport === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {(activeReport === 'attendance' || activeReport === 'leave' || activeReport === 'payroll') && (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field max-w-[180px]"
          />
        )}
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary text-sm">Export CSV</button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary text-sm">Export PDF</button>
        </div>
      </div>
      <div className="card p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {activeReport === 'dept' && data?.departments && (
              <table className="min-w-full">
                <thead><tr><th className="text-left">Department</th><th className="text-left">Count</th></tr></thead>
                <tbody>
                  {data.departments.map((d) => (
                    <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {(activeReport === 'attendance' || activeReport === 'leave' || activeReport === 'payroll') && data != null && (
              <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(Array.isArray(data) ? data.slice(0, 10) : data, null, 2)}</pre>
            )}
            {!data && <p className="text-gray-500">No data</p>}
          </div>
        )}
      </div>
    </div>
  );
}
