const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const hasManagerAccess = (role) => ['admin', 'hr', 'hr_manager'].includes(role);

exports.clockIn = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can clock in"
      });
    }
    const employeeId = req.body.employee_id || (await Employee.findByUserId(req.user.id))?.id;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID required' });
    }

    const today = new Date().toISOString().slice(0,10);
    const existing = await Attendance.findByEmployeeAndDate(employeeId, today);

    if (existing && existing.clock_in) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    const now = new Date().toTimeString().split(' ')[0];
    await Attendance.upsert(employeeId, today, { status: 'present', clock_in: now });
    const record = await Attendance.findByEmployeeAndDate(employeeId, today);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
      return res.status(400).json({ message: 'No clock-in record found for today' });
    }

    const now = new Date().toTimeString().split(' ')[0];
    await Attendance.update(existing.id, { clock_out: now });
    const record = await Attendance.findByEmployeeAndDate(employeeId, today);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getByEmployee = async (req, res) => {
  try {
    const ownEmployee = await Employee.findByUserId(req.user.id);
    const requestedEmployeeId = req.params.employeeId;
    const employeeId = requestedEmployeeId || ownEmployee?.id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID required' });
    }

    if (!hasManagerAccess(req.user.role) && ownEmployee && employeeId.toString() !== ownEmployee.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const records = await Attendance.findByEmployee(employeeId, start, end);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);
    const report = await Attendance.getMonthlyReport(reportMonth);
    if (req.user.role === 'employee') {
      const ownEmployee = await Employee.findByUserId(req.user.id);
      const filtered = ownEmployee ? report.filter((r) => r.employee_id?.toString() === ownEmployee.id?.toString()) : [];
      return res.json({ success: true, data: filtered });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
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
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
