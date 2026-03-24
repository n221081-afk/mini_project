const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Department = mongoose.model('Department', departmentSchema);

Department.findAll = async function () {
  const docs = await this.find().lean();
  return docs.map((d) => ({ ...d, id: d._id }));
};

Department.create = async function (data) {
  const doc = await new this(data).save();
  return doc._id.toString();
};

Department.update = async function (id, data) {
  await this.findByIdAndUpdate(id, { $set: data });
};

Department.delete = async function (id) {
  await this.findByIdAndDelete(id);
};

Department.findWithEmployees = async function (id) {
  const dept = await this.findById(id).lean();
  if (!dept) return null;
  const Employee = mongoose.model('Employee');
  const employees = await Employee.find({ department: id }).lean();
  return { ...dept, id: dept._id, employees };
};

module.exports = Department;
