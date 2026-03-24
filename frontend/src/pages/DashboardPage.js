import { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import Breadcrumbs from '../components/Breadcrumbs';
import { BarChart, DoughnutChart, LineChart } from '../components/Charts';
import {
  employees,
  departments,
  attendanceRecords,
  leaveRequests,
  payrollRecords,
} from '../data/dummyData';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [deptChartData, setDeptChartData] = useState(null);
  const [attendanceChartData, setAttendanceChartData] = useState(null);
  const [payrollChartData, setPayrollChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      } catch {
        // fallback below
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const [deptRes, attRes, payrollRes] = await Promise.all([
          api.get('/reports/employees-by-department'),
          api.get('/reports/monthly-attendance', { params: { month: new Date().toISOString().slice(0, 7) } }),
          api.get('/reports/payroll-summary', { params: { month: new Date().toISOString().slice(0, 7) } }),
        ]);
        const deptList = Array.isArray(deptRes.data) ? deptRes.data : [];
        setDeptChartData({
          labels: deptList.map((d) => d.department_name || d.name),
          datasets: [{ data: deptList.map((d) => d.employee_count || d.count || 0), backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857'] }],
        });
        const attList = Array.isArray(attRes.data) ? attRes.data : [];
        const present = attList.reduce((s, r) => s + (r.present_days || 0), 0);
        const absent = attList.reduce((s, r) => s + (r.absent_days || 0), 0);
        setAttendanceChartData({
          labels: ['Present', 'Absent', 'Half Day', 'Leave'],
          datasets: [{ data: [present, absent, 0, 0], backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'] }],
        });
        const pr = payrollRes.data;
        const totalNet = pr?.total_net ?? pr?.monthlyPayrollCost ?? 0;
        setPayrollChartData({
          labels: [new Date().toISOString().slice(0, 7)],
          datasets: [{ label: 'Total Payroll (₹)', data: [totalNet], fill: true, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }],
        });
      } catch {
        const deptCount = {};
        employees.forEach((e) => {
          const name = e.department_name || 'Other';
          deptCount[name] = (deptCount[name] || 0) + 1;
        });
        setDeptChartData({
          labels: Object.keys(deptCount),
          datasets: [{ data: Object.values(deptCount), backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857'] }],
        });
        const today = new Date().toISOString().split('T')[0];
        const presentToday = attendanceRecords.filter((a) => a.date === today && a.status === 'present').length;
        setAttendanceChartData({
          labels: ['Present', 'Absent', 'Half Day', 'Leave'],
          datasets: [{
            data: [
              attendanceRecords.filter((a) => a.status === 'present').length,
              attendanceRecords.filter((a) => a.status === 'absent').length,
              attendanceRecords.filter((a) => a.status === 'half_day').length,
              attendanceRecords.filter((a) => a.status === 'leave').length,
            ],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
          }],
        });
        const payrollCosts = {};
        payrollRecords.forEach((p) => {
          payrollCosts[p.month] = (payrollCosts[p.month] || 0) + (p.net_salary || 0);
        });
        setPayrollChartData({
          labels: Object.keys(payrollCosts).sort(),
          datasets: [{ label: 'Total Payroll (₹)', data: Object.keys(payrollCosts).sort().map((m) => payrollCosts[m]), fill: true, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }],
        });
      }
    };
    fetchCharts();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const presentTodayDummy = attendanceRecords.filter((a) => a.date === today && a.status === 'present').length;
  const pendingLeavesDummy = leaveRequests.filter((l) => l.status === 'pending').length;
  const payrollThisMonthDummy = payrollRecords.filter(
    (p) => p.month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  ).length;
  const activeEmployeesDummy = employees.filter((e) => e.status === 'active').length;

  const cards = [
    { title: 'Total Employees', value: stats?.total_employees ?? employees.length, icon: '👥', iconBg: 'bg-primary-100' },
    { title: 'Active Employees', value: stats?.active_employees ?? activeEmployeesDummy, icon: '✓', iconBg: 'bg-primary-100' },
    { title: 'Present Today', value: stats?.present_today ?? presentTodayDummy, icon: '🕐', iconBg: 'bg-primary-50' },
    { title: 'Pending Leave Approvals', value: stats?.pending_leave_approvals ?? pendingLeavesDummy, icon: '📋', iconBg: 'bg-primary-50' },
    { title: 'Payroll Processed (This Month)', value: stats?.payroll_processed_this_month ?? payrollThisMonthDummy, icon: '💰', iconBg: 'bg-primary-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-header">Dashboard</h1>
      {loading && !stats ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <DashboardCards cards={cards} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Employee Distribution by Department</h2>
              {deptChartData ? <DoughnutChart data={deptChartData} height={280} /> : <div className="h-[280px] flex items-center justify-center text-gray-500">No data</div>}
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Attendance Statistics</h2>
              {attendanceChartData ? <DoughnutChart data={attendanceChartData} height={280} /> : <div className="h-[280px] flex items-center justify-center text-gray-500">No data</div>}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Payroll Cost</h2>
            {payrollChartData ? <LineChart data={payrollChartData} height={280} /> : <div className="h-[280px] flex items-center justify-center text-gray-500">No data</div>}
          </div>
        </>
      )}
    </div>
  );
}
