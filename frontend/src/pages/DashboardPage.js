import { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import { BarChart, DoughnutChart } from '../components/Charts';
import {
  employees,
  attendanceRecords,
  leaveRequests,
  payrollRecords,
} from '../data/dummyData';
import api from '../services/api';
import { departmentPayroll } from '../services/reportService';
import Table from '../components/Table';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [deptChartData, setDeptChartData] = useState(null);
  const [attendanceChartData, setAttendanceChartData] = useState(null);
  const [payrollChartData, setPayrollChartData] = useState(null);
  const [deptPayrollRows, setDeptPayrollRows] = useState([]);
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
        const month = new Date().toISOString().slice(0, 7);
        const [deptRes, attRes, deptPayrollRes] = await Promise.all([
          api.get('/reports/employees-by-department'),
          api.get('/reports/monthly-attendance', { params: { month } }),
          departmentPayroll(month),
        ]);
        const deptList = Array.isArray(deptRes.data?.data) ? deptRes.data.data : [];
        setDeptChartData({
          labels: deptList.map((d) => d.department_name || d.name),
          datasets: [{ data: deptList.map((d) => d.employee_count || d.count || 0), backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857'] }],
        });
        const attList = Array.isArray(attRes.data?.data) ? attRes.data.data : [];
        const present = attList.reduce((s, r) => s + (r.present_days || 0), 0);
        const absent = attList.reduce((s, r) => s + (r.absent_days || 0), 0);
        setAttendanceChartData({
          labels: ['Present', 'Absent', 'Half Day', 'Leave'],
          datasets: [{ data: [present, absent, 0, 0], backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'] }],
        });
        const rows = Array.isArray(deptPayrollRes.data?.data) ? deptPayrollRes.data.data : [];
        setDeptPayrollRows(rows);
        setPayrollChartData({
          labels: rows.map((r) => r.department_name),
          datasets: [
            {
              label: 'Monthly Payroll Cost (₹)',
              data: rows.map((r) => r.total_salary_expense),
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
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

        // Fallback dept payroll rows
        const byDept = {};
        employees.forEach((e) => {
          const dept = e.department_name || 'Unassigned';
          if (!byDept[dept]) byDept[dept] = { department_name: dept, total_employees: 0, total_salary_expense: 0 };
          byDept[dept].total_employees += 1;
          byDept[dept].total_salary_expense += Number(e.salary || 0);
        });
        setDeptPayrollRows(Object.values(byDept));
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold">Monthly Payroll Cost (Department-wise)</h2>
                <span className="text-xs text-gray-500">Includes labels, legend & tooltips</span>
              </div>
              {payrollChartData ? (
                <BarChart
                  data={payrollChartData}
                  height={320}
                  options={{
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: {
                        enabled: true,
                        callbacks: {
                          label: (ctx) => `₹${Number(ctx.raw || 0).toLocaleString()}`,
                        },
                      },
                    },
                    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `₹${Number(v).toLocaleString()}` } } },
                  }}
                />
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">No data</div>
              )}
            </div>
            <div className="card overflow-hidden">
              <h2 className="px-4 py-3 text-lg font-semibold border-b">Department-wise Payroll Table</h2>
              <Table
                columns={[
                  { key: 'department_name', label: 'Department Name', sortable: true },
                  { key: 'total_employees', label: 'Total Employees', sortable: true },
                  {
                    key: 'total_salary_expense',
                    label: 'Total Salary Expense',
                    sortable: true,
                    render: (r) => `₹${Number(r.total_salary_expense || 0).toLocaleString()}`,
                  },
                ]}
                data={deptPayrollRows}
                keyField="department_name"
                emptyMessage="No department payroll data"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
