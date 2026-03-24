const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const hasManagerAccess = (role) => ['admin', 'hr', 'hr_manager'].includes(role);
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const { newLeaveRequestEmail, leaveStatusUpdateEmail } = require('../utils/emailTemplates');
const COMPANY_NAME = process.env.COMPANY_NAME || 'EnterpriseHR';

async function getAdminHrEmails() {
  const User = mongoose.model('User');
  const users = await User.find({ role: { $in: ['admin', 'hr', 'hr_manager'] } }).select('email').lean();
  return users.map((u) => u.email).filter(Boolean);
}

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id;
    }
    const leaves = await Leave.findAll(filters);
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && leave.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.apply = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not found' });
    }
    const { start_date, end_date } = req.body;

// DATE VALIDATION
    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: "Start date and end date required" });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date"
      });
    }

    const leaveData = {
      ...req.body,
      employee_id: employee.id,
      status: 'pending'
    };

    const id = await Leave.create(leaveData);
    const leave = await Leave.findById(id);

    // Email notification to Admin/HR
    try {
      const to = await getAdminHrEmails();
      if (to.length) {
        await sendEmail({
          to,
          subject: 'New Leave Request Submitted',
          html: newLeaveRequestEmail({
            companyName: COMPANY_NAME,
            employeeName: `${leave.first_name || ''} ${leave.last_name || ''}`.trim(),
            startDate: new Date(leave.start_date).toLocaleDateString(),
            endDate: new Date(leave.end_date).toLocaleDateString(),
            reason: leave.reason || '',
          }),
        });
      }
    } catch (e) {
      // Don't fail core workflow if email fails
      console.error('Leave apply email failed:', e.message || e);
    }

    res.status(201).json({ success: true, message: 'Leave applied successfully', data: leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approve = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave is not pending' });
    }
    await Leave.update(req.params.id, { status: 'approved', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);

    // Email notification to Employee
    try {
      if (updated?.email) {
        await sendEmail({
          to: updated.email,
          subject: 'Leave Request Status Update',
          html: leaveStatusUpdateEmail({
            companyName: COMPANY_NAME,
            employeeName: `${updated.first_name || ''} ${updated.last_name || ''}`.trim() || 'Employee',
            status: 'approved',
            startDate: new Date(updated.start_date).toLocaleDateString(),
            endDate: new Date(updated.end_date).toLocaleDateString(),
          }),
        });
      }
    } catch (e) {
      console.error('Leave approve email failed:', e.message || e);
    }

    res.json({ success: true, message: 'Leave approved', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reject = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave is not pending' });
    }
    await Leave.update(req.params.id, { status: 'rejected', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);

    // Email notification to Employee
    try {
      if (updated?.email) {
        await sendEmail({
          to: updated.email,
          subject: 'Leave Request Status Update',
          html: leaveStatusUpdateEmail({
            companyName: COMPANY_NAME,
            employeeName: `${updated.first_name || ''} ${updated.last_name || ''}`.trim() || 'Employee',
            status: 'rejected',
            startDate: new Date(updated.start_date).toLocaleDateString(),
            endDate: new Date(updated.end_date).toLocaleDateString(),
          }),
        });
      }
    } catch (e) {
      console.error('Leave reject email failed:', e.message || e);
    }

    res.json({ success: true, message: 'Leave rejected', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (!hasManagerAccess(req.user.role) && leave.employee_id?.toString() !== (employee?.id || employee?._id)?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending leave' });
    }
    await Leave.update(req.params.id, { status: 'cancelled' });
    const updated = await Leave.findById(req.params.id);
    res.json({ success: true, message: 'Leave cancelled', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
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
