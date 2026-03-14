const mongoose = require('mongoose');
const Employee = require('./Employee');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

const DepartmentModel = {
  findAll: async () => {
    const depts = await Department.aggregate([
      { $lookup: { from: 'employees', localField: '_id', foreignField: 'department', as: 'emps' } },
      { $addFields: { employee_count: { $size: { $filter: { input: '$emps', as: 'e', cond: { $eq: ['$$e.status', 'active'] } } } } } },
      { $project: { emps: 0 } }
    ]);
    return depts.map(d => ({ ...d, id: d._id }));
  },

  findById: async (id) => {
    const doc = await Department.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : null;
  },

  findWithEmployees: async (id) => {
    const doc = await Department.findById(id).lean();
    if (!doc) return null;
    const employees = await Employee.find({ department: id }).lean();
    return { ...doc, id: doc._id, employees };
  },

  create: async (data) => {
    const dept = await Department.create(data);
    return dept._id.toString();
  },

  update: async (id, data) => {
    await Department.findByIdAndUpdate(id, { $set: data });
  },

  delete: async (id) => {
    await Employee.updateMany({ department: id }, { $set: { department: null } });
    await Department.findByIdAndDelete(id);
  }
};

module.exports = DepartmentModel;
