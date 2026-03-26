import { useState, useEffect } from 'react';
import {
  employeesByDepartment,
  monthlyAttendance,
  leaveReport,
  payrollSummary,
  exportReport,
} from '../services/reportService';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dept');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const pageSize = 10;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      setPage(1);
      try {
        if (activeReport === 'dept') {
          const res = await employeesByDepartment();
          const raw = res.data?.data || [];
          const departments = Array.isArray(raw)
            ? raw.map((d) => ({ department_name: d.department_name || d.name, employee_count: d.employee_count || d.count || 0 }))
            : [];
          setData({ departments });
        } else if (activeReport === 'attendance') {
          const res = await monthlyAttendance(month);
          setData(res.data?.data ?? []);
        } else if (activeReport === 'leave') {
          const res = await leaveReport({ month });
          setData(res.data?.data ?? []);
        } else if (activeReport === 'payroll') {
          const res = await payrollSummary(month);
          const d = res.data?.data;
          setData(d != null ? [d] : []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeReport, month]);

  const handleExport = async (format) => {
    try {
      const res = await exportReport(activeReport, format, { month });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${activeReport}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    }
  };

  const reports = [
    { id: 'dept', label: 'Employees by Department' },
    { id: 'attendance', label: 'Monthly Attendance' },
    { id: 'leave', label: 'Leave Report' },
    { id: 'payroll', label: 'Payroll Summary' },
  ];

  const reportColumns = {
    dept: [
      { key: 'department_name', label: 'Department', sortable: true },
      { key: 'employee_count', label: 'Employee Count', sortable: true },
    ],
    attendance: [
      { key: 'employee_code', label: 'Employee ID', sortable: true },
      { key: 'first_name', label: 'First Name', sortable: true },
      { key: 'last_name', label: 'Last Name', sortable: true },
      { key: 'department_name', label: 'Department', sortable: true },
      { key: 'present_days', label: 'Present', sortable: true },
      { key: 'absent_days', label: 'Absent', sortable: true },
    ],
    leave: [
      { key: 'leave_type', label: 'Leave Type', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'count', label: 'Count', sortable: true },
    ],
    payroll: [
      { key: '_id', label: 'Month', sortable: true },
      { key: 'employee_count', label: 'Employees', sortable: true },
      { key: 'total_basic', label: 'Total Basic', sortable: true },
      { key: 'total_net', label: 'Total Net', sortable: true },
      { key: 'total_tax', label: 'Total Tax', sortable: true },
      { key: 'total_pf', label: 'Total PF', sortable: true },
    ],
  };

  const rawTableData = activeReport === 'dept' ? (data?.departments || []) : (Array.isArray(data) ? data : []);
  const sortedData = (() => {
    if (!sortKey) return rawTableData;
    const copy = [...rawTableData];
    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];
      const aNum = typeof av === 'number' ? av : Number(av);
      const bNum = typeof bv === 'number' ? bv : Number(bv);
      const bothNum = !Number.isNaN(aNum) && !Number.isNaN(bNum);
      if (bothNum) return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      const as = String(av ?? '').toLowerCase();
      const bs = String(bv ?? '').toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  })();
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <h1 className="page-header">Reports</h1>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
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
          <>
            <Table
              columns={reportColumns[activeReport]}
              data={pagedData}
              keyField={activeReport === 'payroll' ? '_id' : (activeReport === 'dept' ? 'department_name' : 'employee_id')}
              emptyMessage="No report data"
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(k, d) => {
                setSortKey(k);
                setSortDir(d);
                setPage(1);
              }}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
