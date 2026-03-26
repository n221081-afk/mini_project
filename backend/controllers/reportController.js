const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const PDFDocument = require('pdfkit');

exports.employeesByDepartment = async (req, res) => {
  try {
    const Dept = mongoose.model('Department');
    const report = await Dept.aggregate([
      { $lookup: { from: 'employees', localField: '_id', foreignField: 'department', as: 'emps' } },
      { $addFields: { employee_count: { $size: { $filter: { input: '$emps', as: 'e', cond: { $eq: ['$$e.status', 'active'] } } } } } },
      { $project: { department_name: '$name', employee_count: 1, _id: 0 } }
    ]);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.monthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const report = await Attendance.getMonthlyReport(reportMonth);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.leaveReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stats = await Leave.getLeaveStats(start, end);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
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
    res.json({ success: true, data: result[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.departmentPayroll = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);

    const PayrollModel = mongoose.model('Payroll');
    const report = await PayrollModel.aggregate([
      { $match: { month: reportMonth } },
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
      { $unwind: '$emp' },
      { $lookup: { from: 'departments', localField: 'emp.department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { dept_id: '$dept._id', dept_name: { $ifNull: ['$dept.name', 'Unassigned'] } },
          total_employees: { $addToSet: '$emp._id' },
          total_salary_expense: { $sum: '$net_salary' },
        },
      },
      {
        $project: {
          _id: 0,
          department_id: '$_id.dept_id',
          department_name: '$_id.dept_name',
          total_employees: { $size: '$total_employees' },
          total_salary_expense: 1,
          month: reportMonth,
        },
      },
      { $sort: { total_salary_expense: -1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { report_type, format = 'csv', ...params } = req.query;
    let data = [];
    let headers = [];

    if (report_type === 'employees_by_dept') {
      // Compute counts with the same pipeline as `employeesByDepartment`.
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
    } else if (report_type === 'leave_report') {
      const end = params.end_date || new Date().toISOString().split('T')[0];
      const start = params.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const stats = await Leave.getLeaveStats(start, end);
      data = stats;
      headers = ['leave_type', 'status', 'count'];
    } else if (report_type === 'payroll_summary') {
      const month = params.month || new Date().toISOString().slice(0, 7);
      const PayrollModel = mongoose.model('Payroll');
      const result = await PayrollModel.aggregate([
        { $match: { month } },
        { $group: { _id: '$month', employee_count: { $sum: 1 }, total_basic: { $sum: '$basic_salary' }, total_net: { $sum: '$net_salary' }, total_tax: { $sum: '$tax' }, total_pf: { $sum: '$pf' } } },
      ]);
      data = result;
      headers = ['_id', 'employee_count', 'total_basic', 'total_net', 'total_tax', 'total_pf'];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report_type' });
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${report_type}.pdf`);
        res.send(pdfBuffer);
      });
      doc.fontSize(16).text(`Report: ${report_type}`, { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(headers.join(' | '));
      doc.moveDown(0.5);
      data.forEach((row) => {
        const rowText = headers.map((h) => String(row[h] ?? '')).join(' | ');
        doc.text(rowText);
      });
      doc.end();
      return;
    }

    const csvHeader = headers.join(',');
    const csvRows = data.map((row) => headers.map((h) => JSON.stringify(row[h] || '')).join(','));
    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report_type}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
