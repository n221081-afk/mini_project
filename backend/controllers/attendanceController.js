const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.clockIn = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return sendError(res, 403, "Only employees can clock in");
    }
    const employeeId = req.body.employee_id || (await Employee.findByUserId(req.user.id))?.id;
    if (!employeeId) {
      return sendError(res, 400, 'Employee ID required');
    }

    const today = new Date().toISOString().slice(0,10);
    const existing = await Attendance.findByEmployeeAndDate(employeeId, today);

    if (existing && existing.clock_in) {
      return sendError(res, 400, 'Already clocked in today');
    }

    const now = new Date().toTimeString().split(' ')[0];
    await Attendance.upsert(employeeId, today, { status: 'present', clock_in: now });
    const record = await Attendance.findByEmployeeAndDate(employeeId, today);
    sendSuccess(res, record);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.clockOut = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
      message: "Only employees can clock out"
      });
    }
    const employeeId = req.body.employee_id || (await Employee.findByUserId(req.user.id))?.id;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID required' });
    }

    const today = new Date().toISOString().slice(0,10);
    const existing = await Attendance.findByEmployeeAndDate(employeeId, today);

    if (!existing) {
      return sendError(res, 400, 'No clock-in record found for today');
    }

    const now = new Date().toTimeString().split(' ')[0];
    await Attendance.update(existing.id, { clock_out: now });
    const record = await Attendance.findByEmployeeAndDate(employeeId, today);
    sendSuccess(res, record);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || (await Employee.findByUserId(req.user.id))?.id;
    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const records = await Attendance.findByEmployee(employeeId, start, end);
    sendSuccess(res, records);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const report = await Attendance.getMonthlyReport(reportMonth);
    sendSuccess(res, report);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.adminCorrection = async (req, res) => {
  try {
    const { employee_id, date, status, clock_in, clock_out, notes } = req.body;
    if (!employee_id || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }
    await Attendance.upsert(employee_id, date, { status, clock_in, clock_out, notes });
    const record = await Attendance.findByEmployeeAndDate(employee_id, date);
    sendSuccess(res, record);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};
