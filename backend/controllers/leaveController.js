const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id;
    }
    const leaves = await Leave.findAll(filters);
    sendSuccess(res, leaves);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave not found');
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && leave.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return sendError(res, 403, 'Access denied');
    }
    sendSuccess(res, leave);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.apply = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return sendError(res, 400, 'Employee profile not found');
    }
    const { start_date, end_date } = req.body;

// DATE VALIDATION
    if (!start_date || !end_date) {
      return sendError(res, 400, "Start date and end date required");
    }

    if (new Date(start_date) > new Date(end_date)) {
      return sendError(res, 400, "Start date cannot be greater than end date");
    }

    const leaveData = {
      ...req.body,
      employee_id: employee.id,
      status: 'pending'
    };

    const id = await Leave.create(leaveData);
    const leave = await Leave.findById(id);
    sendSuccess(res, leave, 201);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.approve = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave not found');
    }
    if (leave.status !== 'pending') {
      return sendError(res, 400, 'Leave is not pending');
    }
    await Leave.update(req.params.id, { status: 'approved', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.reject = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave not found');
    }
    if (leave.status !== 'pending') {
      return sendError(res, 400, 'Leave is not pending');
    }
    await Leave.update(req.params.id, { status: 'rejected', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.cancel = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave not found');
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && leave.employee_id?.toString() !== (employee?.id || employee?._id)?.toString()) {
      return sendError(res, 403, 'Access denied');
    }
    if (leave.status !== 'pending') {
      return sendError(res, 400, 'Can only cancel pending leave');
    }
    await Leave.update(req.params.id, { status: 'cancelled' });
    const updated = await Leave.findById(req.params.id);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const end = end_date || new Date().toISOString().split('T')[0];
    const start = start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stats = await Leave.getLeaveStats(start, end);
    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};
