import { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
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
  const [useDummy, setUseDummy] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.status) setUseDummy(true);
      } catch {
        setUseDummy(true);
      }
    };
    fetchStats();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendanceRecords.filter((a) => a.date === today && a.status === 'present').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending').length;
  const payrollThisMonth = payrollRecords.filter(
    (p) => p.month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  ).length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  const deptCount = {};
  employees.forEach((e) => {
    const name = e.department_name || 'Other';
    deptCount[name] = (deptCount[name] || 0) + 1;
  });

  const cards = [
    { title: 'Total Employees', value: employees.length, icon: '👥', iconBg: 'bg-blue-100' },
    { title: 'Active Employees', value: activeEmployees, icon: '✓', iconBg: 'bg-green-100' },
    { title: 'Present Today', value: presentToday, icon: '🕐', iconBg: 'bg-amber-100' },
    { title: 'Pending Leave Approvals', value: pendingLeaves, icon: '📋', iconBg: 'bg-orange-100' },
    { title: 'Payroll Processed (This Month)', value: payrollThisMonth, icon: '💰', iconBg: 'bg-emerald-100' },
  ];

  const deptData = {
    labels: Object.keys(deptCount),
    datasets: [
      {
        data: Object.values(deptCount),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  const attendanceData = {
    labels: ['Present', 'Absent', 'Half Day', 'Leave'],
    datasets: [
      {
        data: [
          attendanceRecords.filter((a) => a.status === 'present').length,
          attendanceRecords.filter((a) => a.status === 'absent').length,
          attendanceRecords.filter((a) => a.status === 'half_day').length,
          attendanceRecords.filter((a) => a.status === 'leave').length,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
      },
    ],
  };

  const payrollCosts = {};
  payrollRecords.forEach((p) => {
    payrollCosts[p.month] = (payrollCosts[p.month] || 0) + (p.net_salary || 0);
  });
  const payrollData = {
    labels: Object.keys(payrollCosts).sort(),
    datasets: [
      {
        label: 'Total Payroll (₹)',
        data: Object.keys(payrollCosts)
          .sort()
          .map((m) => payrollCosts[m]),
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <DashboardCards cards={cards} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Distribution by Department</h2>
          <DoughnutChart data={deptData} height={280} />
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance Statistics</h2>
          <DoughnutChart data={attendanceData} height={280} />
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Payroll Cost</h2>
        <LineChart data={payrollData} height={280} />
      </div>
    </div>
  );
}
