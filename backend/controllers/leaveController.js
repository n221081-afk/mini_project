const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id;
    }
    const leaves = await Leave.findAll(filters);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && leave.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.apply = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(400).json({ message: 'Employee profile not found' });
    }
    const { start_date, end_date } = req.body;

// DATE VALIDATION
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Start date and end date required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        message: "Start date cannot be greater than end date"
      });
    }

    const leaveData = {
      ...req.body,
      employee_id: employee.id,
      status: 'pending'
    };

    const id = await Leave.create(leaveData);
    const leave = await Leave.findById(id);
    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approve = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave is not pending' });
    }
    await Leave.update(req.params.id, { status: 'approved', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reject = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave is not pending' });
    }
    await Leave.update(req.params.id, { status: 'rejected', approved_by: req.user.id });
    const updated = await Leave.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && leave.employee_id?.toString() !== (employee?.id || employee?._id)?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave' });
    }
    await Leave.update(req.params.id, { status: 'cancelled' });
    const updated = await Leave.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
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
