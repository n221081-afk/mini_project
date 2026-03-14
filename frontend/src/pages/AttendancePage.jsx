import { useState, useEffect } from 'react';
import { clockIn, clockOut, getByEmployee, getMonthlyReport } from '../services/attendanceService';
import { attendanceRecords } from '../data/dummyData';
import Table from '../components/Table';
import { BarChart } from '../components/Charts';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMonthlyReport(month);
        setRecords(res.data || []);
      } catch {
        const filtered = attendanceRecords.filter((r) => r.date?.startsWith(month));
        const byEmp = {};
        filtered.forEach((r) => {
          const key = r.employee_id;
          if (!byEmp[key]) byEmp[key] = { ...r, present_days: 0, absent_days: 0 };
          if (r.status === 'present') byEmp[key].present_days++;
          else byEmp[key].absent_days++;
        });
        setRecords(Object.values(byEmp));
      }
    };
    fetch();
  }, [month]);

  const handleClockIn = async () => {
    setLoading(true);
    setError('');
    try {
      await clockIn();
      setClockedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed. Using demo mode.');
      setClockedIn(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError('');
    try {
      await clockOut();
      setClockedIn(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out recorded (demo).');
      setClockedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'department_name', label: 'Department' },
    { key: 'present_days', label: 'Present Days' },
    { key: 'absent_days', label: 'Absent Days' },
  ];

  const chartData = {
    labels: records.slice(0, 6).map((r) => r.employee_code || r.first_name),
    datasets: [
      { label: 'Present', data: records.slice(0, 6).map((r) => r.present_days || 0), backgroundColor: '#10b981' },
      { label: 'Absent', data: records.slice(0, 6).map((r) => r.absent_days || 0), backgroundColor: '#ef4444' },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="card p-6 flex gap-4">
          <button
            onClick={handleClockIn}
            disabled={loading || clockedIn}
            className="btn-primary disabled:opacity-50"
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !clockedIn}
            className="btn-secondary disabled:opacity-50"
          >
            Clock Out
          </button>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input-field max-w-xs"
        >
          {[...Array(3)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.toISOString().slice(0, 7);
            return (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
              </option>
            );
          })}
        </select>
      </div>
      {error && <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">{error}</div>}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Statistics (Top 6)</h2>
        <BarChart data={chartData} options={{ scales: { x: { stacked: true }, y: { stacked: true } } }} height={200} />
      </div>
      <div className="card overflow-hidden">
        <h2 className="px-4 py-3 text-lg font-semibold border-b">Monthly Report</h2>
        <Table columns={columns} data={records} keyField="employee_id" emptyMessage="No attendance data" />
      </div>
    </div>
  );
}
