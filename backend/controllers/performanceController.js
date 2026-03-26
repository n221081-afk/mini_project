const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id;
    }
    const reviews = await Performance.findAll(filters);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && review.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const reviewData = { ...req.body, reviewed_by: req.user.id };
    const id = await Performance.create(reviewData);
    const review = await Performance.findById(id);
    res.status(201).json({ success: true, message: 'Performance review created', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }
    const updateData = { ...req.body, reviewed_by: req.user.id };
    await Performance.update(req.params.id, updateData);
    const updated = await Performance.findById(req.params.id);
    res.json({ success: true, message: 'Performance review updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
