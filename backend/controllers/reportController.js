const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { sendError, sendSuccess } = require('../utils/apiResponse');

exports.employeesByDepartment = async (req, res) => {
  try {
    const Dept = mongoose.model('Department');
    const report = await Dept.aggregate([
      { $lookup: { from: 'employees', localField: '_id', foreignField: 'department', as: 'emps' } },
      { $addFields: { employee_count: { $size: { $filter: { input: '$emps', as: 'e', cond: { $eq: ['$$e.status', 'active'] } } } } } },
      { $project: { department_name: '$name', employee_count: 1, _id: 0 } }
    ]);
    const labels = report.map((r) => r.department_name);
    const data = report.map((r) => r.employee_count);
    const palette = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857'];
    const backgroundColor = data.map((_, i) => palette[i % palette.length]);

    return sendSuccess(res, {
      labels,
      datasets: [{ data, backgroundColor }],
    });
  } catch (error) {
    return sendError(res, 500, 'Server error', error);
  }
};

exports.monthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const report = await Attendance.getMonthlyReport(reportMonth);
    const present = report.reduce((sum, r) => sum + (r.present_days || 0), 0);
    const absent = report.reduce((sum, r) => sum + (r.absent_days || 0), 0);
    const half = report.reduce((sum, r) => sum + (r.half_days || 0), 0);
    const leave = report.reduce((sum, r) => sum + (r.leave_days || 0), 0);

    return sendSuccess(res, {
      labels: ['Present', 'Absent', 'Half Day', 'Leave'],
      datasets: [
        {
          data: [present, absent, half, leave],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
        },
      ],
    });
  } catch (error) {
    return sendError(res, 500, 'Server error', error);
  }
};

exports.leaveReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stats = await Leave.getLeaveStats(start, end);
    return sendSuccess(res, stats);
  } catch (error) {
    return sendError(res, 500, 'Server error', error);
  }
};

exports.payrollSummary = async (req, res) => {
  try {
    const PayrollModel = mongoose.model('Payroll');
    // Get last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }
    const results = await PayrollModel.aggregate([
      { $match: { month: { $in: months } } },
      { $group: { _id: '$month', total_net: { $sum: '$net_salary' } } }
    ]);
    const dataMap = {};
    results.forEach(r => dataMap[r._id] = r.total_net);
    const data = months.map(m => dataMap[m] || 0);

    return sendSuccess(res, {
      labels: months,
      datasets: [
        {
          label: 'Total Payroll (₹)',
          data,
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
        },
      ],
    });
  } catch (error) {
    return sendError(res, 500, 'Server error', error);
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { report_type, ...params } = req.query;
    let data = [];
    let headers = [];

    if (report_type === 'employees_by_dept') {
      const report = await Department.aggregate([
        { $lookup: { from: 'employees', localField: '_id', foreignField: 'department', as: 'emps' } },
        { $addFields: { employee_count: { $size: { $filter: { input: '$emps', as: 'e', cond: { $eq: ['$$e.status', 'active'] } } } } } },
        { $project: { department_name: '$name', employee_count: 1, _id: 0 } },
      ]);
      data = report;
      headers = ['department_name', 'employee_count'];
    } else if (report_type === 'monthly_attendance') {
      const month = params.month || new Date().toISOString().slice(0, 7);
      const report = await Attendance.getMonthlyReport(month);
      data = report.map(r => ({ employee_code: r.employee_code, first_name: r.first_name, last_name: r.last_name, department: r.department_name, present: r.present_days, absent: r.absent_days }));
      headers = ['employee_code', 'first_name', 'last_name', 'department', 'present', 'absent'];
    } else {
      return sendError(res, 400, 'Invalid report_type');
    }

    const csvHeader = headers.join(',');
    const csvRows = data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','));
    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report_type}.csv`);
    res.send(csv);
  } catch (error) {
    return sendError(res, 500, 'Server error', error);
  }
};
