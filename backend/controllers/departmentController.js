const Department = require('../models/Department');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAll = async (req, res) => {
  try {
    const departments = await Department.findAll();
    sendSuccess(res, departments);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    sendSuccess(res, department);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getWithEmployees = async (req, res) => {
  try {
    const department = await Department.findWithEmployees(req.params.id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    sendSuccess(res, department);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.create = async (req, res) => {
  try {
    const id = await Department.create(req.body);
    const department = await Department.findById(id);
    sendSuccess(res, department, 201);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.update = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    await Department.update(req.params.id, req.body);
    const updated = await Department.findById(req.params.id);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.delete = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    await Department.delete(req.params.id);
    sendSuccess(res, { message: 'Department deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};
