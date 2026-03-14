const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const { department_id, status, search, page = 1, limit = 20 } = req.query;
    const filters = { department_id, status, search, limit, offset: (page - 1) * limit };
    const employees = await Employee.findAll(filters);
    const total = await Employee.count({ department_id, status, search });
    res.json({ data: employees, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const existing = await Employee.findByEmployeeCode(req.body.employee_code);
    if (existing) {
      return res.status(400).json({ message: 'Employee code already exists' });
    }

    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let userId = null;
    if (req.body.create_user_account === true && req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      userId = await User.create({
        name: `${req.body.first_name} ${req.body.last_name}`,
        email: req.body.email,
        password: hashedPassword,
        role: 'employee'
      });
    }

    const employeeData = {
      ...req.body,
      user_id: userId || undefined,
      profile_photo: req.file ? req.file.filename : null
    };

    const id = await Employee.create(employeeData);
    const employee = await Employee.findById(id);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updateData = { ...req.body };
    if (req.file) updateData.profile_photo = req.file.filename;
    delete updateData.create_user_account;
    delete updateData.password;

    await Employee.update(req.params.id, updateData);
    const updated = await Employee.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await Employee.delete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
