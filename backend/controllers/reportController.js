const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

exports.employeesByDepartment = async (req, res) => {
  try {
    const Dept = mongoose.model('Department');
    const report = await Dept.aggregate([
      { $lookup: { from: 'employees', localField: '_id', foreignField: 'department', as: 'emps' } },
      { $addFields: { employee_count: { $size: { $filter: { input: '$emps', as: 'e', cond: { $eq: ['$$e.status', 'active'] } } } } } },
      { $project: { department_name: '$name', employee_count: 1, _id: 0 } }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.monthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const report = await Attendance.getMonthlyReport(reportMonth);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stats = await Leave.getLeaveStats(start, end);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.payrollSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const PayrollModel = mongoose.model('Payroll');
    const result = await PayrollModel.aggregate([
      { $match: { month: reportMonth } },
      { $group: { _id: '$month', employee_count: { $sum: 1 }, total_basic: { $sum: '$basic_salary' }, total_net: { $sum: '$net_salary' }, total_tax: { $sum: '$tax' }, total_pf: { $sum: '$pf' } } }
    ]);
    res.json(result[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { report_type, ...params } = req.query;
    let data = [];
    let headers = [];

    if (report_type === 'employees_by_dept') {
      const report = await Department.findAll();
      data = report.map(r => ({ department_name: r.name, employee_count: r.employee_count }));
      headers = ['department_name', 'employee_count'];
    } else if (report_type === 'monthly_attendance') {
      const month = params.month || new Date().toISOString().slice(0, 7);
      const report = await Attendance.getMonthlyReport(month);
      data = report.map(r => ({ employee_code: r.employee_code, first_name: r.first_name, last_name: r.last_name, department: r.department_name, present: r.present_days, absent: r.absent_days }));
      headers = ['employee_code', 'first_name', 'last_name', 'department', 'present', 'absent'];
    } else {
      return res.status(400).json({ message: 'Invalid report_type' });
    }

    const csvHeader = headers.join(',');
    const csvRows = data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','));
    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report_type}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
