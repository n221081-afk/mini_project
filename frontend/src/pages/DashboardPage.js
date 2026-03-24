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
import Modal from '../components/Modal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { apply as applyLeave, getAll as getLeaves, approve as approveLeave, reject as rejectLeave } from '../services/leaveService';
import { contactHR } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [deptChartData, setDeptChartData] = useState(null);
  const [attendanceChartData, setAttendanceChartData] = useState(null);
  const [payrollChartData, setPayrollChartData] = useState(null);
  const [deptPayrollRows, setDeptPayrollRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickLeave, setShowQuickLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'casual_leave', start_date: '', end_date: '', reason: '' });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [adminPendingLeaves, setAdminPendingLeaves] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showSupportMsg, setShowSupportMsg] = useState(false);
  const [supportForm, setSupportForm] = useState({ templateType: 'HR Query', subject: '', message: '' });

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
    const loadRecentLeaves = async () => {
      if (!user) return;
      try {
        const res = await getLeaves();
        const list = res.data?.data || [];
        if (['admin', 'hr', 'hr_manager'].includes(user.role)) {
          setAdminPendingLeaves(list.filter(l => l.status === 'pending').slice(0, 10));
          setRecentLeaves(list.slice(0, 50)); 
        } else {
          setRecentLeaves(list.slice(0, 50));
        }
      } catch {
        setRecentLeaves([]);
        setAdminPendingLeaves([]);
      }
    };
    loadRecentLeaves();
  }, [user]);

  const inlineApprove = async (id) => {
    try {
      await approveLeave(id);
      toast.success('Leave approved successfully');
      setAdminPendingLeaves(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const inlineReject = async (id) => {
    try {
      await rejectLeave(id, 'Admin/HR rejected');
      toast.success('Leave rejected successfully');
      setAdminPendingLeaves(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const dString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const leave = recentLeaves.find(l => {
      if (!l.start_date || !l.end_date) return false;
      const start = new Date(l.start_date).toISOString().split('T')[0];
      const end = new Date(l.end_date).toISOString().split('T')[0];
      // Only show current user's leaves on the calendar
      if (['admin', 'hr', 'hr_manager'].includes(user?.role) && l.employee_id !== user?._id && l._id) return false;
      return dString >= start && dString <= end;
    });
    if (!leave) return null;
    if (leave.status === 'approved') return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-bold rounded-lg';
    if (leave.status === 'rejected') return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-bold rounded-lg';
    return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-bold rounded-lg';
  };

  const submitQuickLeave = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(leaveForm);
      toast.success('Leave request submitted');
      setShowQuickLeave(false);
      setLeaveForm({ leave_type: 'casual_leave', start_date: '', end_date: '', reason: '' });
      const res = await getLeaves();
      const list = res.data?.data || [];
      setRecentLeaves(list.slice(0, 50));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Leave request failed');
    }
  };

  const submitSupportMsg = async (e) => {
    e.preventDefault();
    try {
      await contactHR(supportForm);
      toast.success('Message sent to HR successfully');
      setShowSupportMsg(false);
      setSupportForm({ templateType: 'HR Query', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

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

        // Check if department data is empty, use dummy data
        if (deptList.length === 0) {
          const deptCount = {};
          employees.forEach((e) => {
            const name = e.department_name || 'Other';
            deptCount[name] = (deptCount[name] || 0) + 1;
          });
          setDeptChartData({
            labels: Object.keys(deptCount),
            datasets: [{ data: Object.values(deptCount), backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857'] }],
          });
        }

        // Check if attendance data is empty, use dummy data
        if (attList.length === 0) {
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
        }

        // Check if payroll data is empty, use dummy data
        if (rows.length === 0) {
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

          {user?.role === 'employee' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Quick Actions</h2>
                  <div className="flex gap-2">
                    <button className="btn-secondary !px-4 !py-2 !text-sm" onClick={() => setShowSupportMsg(true)}>Contact HR</button>
                    <button className="btn-primary !px-4 !py-2 !text-sm" onClick={() => setShowQuickLeave(true)}>Apply Leave</button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-white/70 mb-3">
                  Recent leave requests
                </div>
                <Table
                  columns={[
                    { key: 'leave_type', label: 'Type' },
                    { key: 'start_date', label: 'Start', render: (r) => (r.start_date ? new Date(r.start_date).toLocaleDateString() : '') },
                    { key: 'end_date', label: 'End', render: (r) => (r.end_date ? new Date(r.end_date).toLocaleDateString() : '') },
                    { key: 'status', label: 'Status' },
                  ]}
                  data={recentLeaves}
                  keyField="_id"
                  emptyMessage="No recent leave requests"
                />
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Leave Calendar</h2>
                <div className="rounded-xl overflow-hidden calendar-dark-wrapper">
                  <Calendar value={calendarDate} onChange={setCalendarDate} tileClassName={tileClassName} className="w-full border-none !font-sans dark:bg-[#0b1220] dark:text-gray-100" />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/70 mt-4">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400"></span> Approved</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Rejected</div>
                </div>
              </div>
            </div>
          )}

          {['admin', 'hr', 'hr_manager'].includes(user?.role) && (
            <div className="card p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Pending Leave Approvals</h2>
              </div>
              <Table
                columns={[
                  { key: 'employee_name', label: 'Employee', render: (r) => r.employee_name || 'Unknown' },
                  { key: 'leave_type', label: 'Type' },
                  { key: 'dates', label: 'Dates', render: (r) => `${new Date(r.start_date).toLocaleDateString()} - ${new Date(r.end_date).toLocaleDateString()}` },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions', render: (r) => (
                    <div className="flex gap-2">
                       <button onClick={() => inlineApprove(r._id)} className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-500/40 transition-colors">Approve</button>
                       <button onClick={() => inlineReject(r._id)} className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-500/40 transition-colors">Reject</button>
                    </div>
                  ) }
                ]}
                data={adminPendingLeaves}
                keyField="_id"
                emptyMessage="No pending leave requests"
              />
            </div>
          )}

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

          <Modal isOpen={showQuickLeave} onClose={() => setShowQuickLeave(false)} title="Quick Apply Leave">
            <form onSubmit={submitQuickLeave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-white/80">Leave Type</label>
                <select
                  className="input-field"
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, leave_type: e.target.value }))}
                >
                  <option value="casual_leave">Casual</option>
                  <option value="sick_leave">Sick</option>
                  <option value="paid_leave">Paid</option>
                  <option value="work_from_home">WFH</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-white/80">Start Date</label>
                  <input className="input-field" type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm((f) => ({ ...f, start_date: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-white/80">End Date</label>
                  <input className="input-field" type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm((f) => ({ ...f, end_date: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-white/80">Reason</label>
                <textarea className="input-field" rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} />
              </div>
              <div className="pt-2 flex gap-3">
                <button className="btn-primary flex-1" type="submit">Submit</button>
                <button className="btn-secondary px-6" type="button" onClick={() => setShowQuickLeave(false)}>Cancel</button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={showSupportMsg} onClose={() => setShowSupportMsg(false)} title="Contact HR / Admin">
            <form onSubmit={submitSupportMsg} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-white/80">Query Type (Template)</label>
                <select
                  className="input-field"
                  value={supportForm.templateType}
                  onChange={(e) => setSupportForm((f) => ({ ...f, templateType: e.target.value, subject: e.target.value }))}
                >
                  <option value="HR Query">General HR Query</option>
                  <option value="Request Payslip">Request Payslip</option>
                  <option value="Request Document Bundle">Request Document Bundle / Certs</option>
                  <option value="IT Support">IT / System Support</option>
                  <option value="Report Issue">Report Issue</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-white/80">Subject</label>
                <input 
                  className="input-field" 
                  type="text" 
                  value={supportForm.subject} 
                  onChange={(e) => setSupportForm((f) => ({ ...f, subject: e.target.value }))} 
                  placeholder="Briefly describe your request" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-white/80">Message</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  value={supportForm.message} 
                  onChange={(e) => setSupportForm((f) => ({ ...f, message: e.target.value }))} 
                  placeholder="Enter the details of your request here..."
                  required 
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button className="btn-primary flex-1" type="submit">Send Email</button>
                <button className="btn-secondary px-6" type="button" onClick={() => setShowSupportMsg(false)}>Cancel</button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
