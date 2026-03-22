const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAll = async (req, res) => {
  try {
    const { department_id, status, search, page = 1, limit = 20 } = req.query;
    const filters = { department_id, status, search, limit, offset: (page - 1) * limit };
    const employees = await Employee.findAll(filters);
    const total = await Employee.count({ department_id, status, search });
    sendSuccess(res, { employees, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }
    sendSuccess(res, employee);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return sendError(res, 404, 'Employee profile not found');
    }
    sendSuccess(res, employee);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.create = async (req, res) => {
  try {
    const existing = await Employee.findByEmployeeCode(req.body.employee_code);
    if (existing) {
      return sendError(res, 400, 'Employee code already exists');
    }

    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return sendError(res, 400, 'Email already exists');
    }

    let userId = null;
    const password = req.body.password || "Temp@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    userId = await User.create({
    name: `${req.body.first_name} ${req.body.last_name}`,
    email: req.body.email,
    password: hashedPassword,
    role: "employee"
  });

    const employeeData = {
      ...req.body,
      user_id: userId || undefined,
      profile_photo: req.file ? req.file.filename : null
    };

    const id = await Employee.create(employeeData);
    const employee = await Employee.findById(id);
    return sendSuccess(res, { employee }, 201);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.update = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    const updateData = { ...req.body };
    if (req.file) updateData.profile_photo = req.file.filename;
    delete updateData.create_user_account;
    delete updateData.password;

    await Employee.update(req.params.id, updateData);
    const updated = await Employee.findById(req.params.id);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.delete = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }
    await Employee.delete(req.params.id);
    sendSuccess(res, { message: 'Employee deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};
