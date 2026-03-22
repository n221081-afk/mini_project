const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String },
  lastName: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  employee_code: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  hireDate: { type: Date },
  join_date: { type: Date },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  salary: { type: Number },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['active', 'on_leave', 'terminated'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);

Employee.findByUserId = async function (userId) {
  const doc = await this.findOne({ user: userId }).populate('department', 'name code').lean();
  if (!doc) return null;
  const d = doc.department;
  return {
    ...doc,
    id: doc._id,
    department_name: d?.name,
    department_code: d?.code,
    first_name: doc.first_name || doc.firstName,
    last_name: doc.last_name || doc.lastName,
  };
};

Employee.findByEmployeeCode = async function (code) {
  return this.findOne({ employee_code: code }).lean();
};

Employee.findAll = async function (filters = {}) {
  const query = {};
  if (filters.department_id) query.department = filters.department_id;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { first_name: new RegExp(filters.search, 'i') },
      { last_name: new RegExp(filters.search, 'i') },
      { email: new RegExp(filters.search, 'i') },
      { employee_code: new RegExp(filters.search, 'i') },
    ];
  }
  let q = this.find(query).populate('department', 'name code').sort({ createdAt: -1 });
  if (filters.limit) q = q.limit(Number(filters.limit));
  if (filters.offset) q = q.skip(Number(filters.offset));
  const docs = await q.lean();
  return docs.map((d) => ({
    ...d,
    id: d._id,
    department_name: d.department?.name,
    department_code: d.department?.code,
    department_id: d.department?._id,
    first_name: d.first_name || d.firstName,
    last_name: d.last_name || d.lastName,
  }));
};

Employee.count = async function (filters = {}) {
  const query = {};
  if (filters.department_id) query.department = filters.department_id;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { first_name: new RegExp(filters.search, 'i') },
      { last_name: new RegExp(filters.search, 'i') },
      { email: new RegExp(filters.search, 'i') },
      { employee_code: new RegExp(filters.search, 'i') },
    ];
  }
  return this.countDocuments(query);
};

Employee.findById = async function (id) {
  const doc = await this.findOne({ _id: id }).populate('department', 'name code').lean();
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id,
    department_name: doc.department?.name,
    department_code: d.department?.code,
    department_id: doc.department?._id,
    first_name: doc.first_name || doc.firstName,
    last_name: doc.last_name || doc.lastName,
  };
};

Employee.create = async function (data) {
  const payload = {
    user: data.user_id || undefined,
    department: data.department_id || data.department,
    first_name: data.first_name || data.firstName,
    last_name: data.last_name || data.lastName,
    employee_code: data.employee_code,
    email: data.email,
    phone: data.phone,
    designation: data.designation,
    salary: data.salary ? Number(data.salary) : undefined,
    join_date: data.join_date ? new Date(data.join_date) : undefined,
    status: data.status || 'active',
  };
  const doc = await new this(payload).save();
  return doc._id.toString();
};

Employee.update = async function (id, data) {
  const update = {};
  ['first_name', 'last_name', 'email', 'phone', 'department', 'designation', 'salary', 'status', 'profile_photo'].forEach((k) => {
    if (data[k] !== undefined) update[k] = data[k];
  });
  if (data.department_id) update.department = data.department_id;
  await this.findByIdAndUpdate(id, { $set: update });
};

Employee.delete = async function (id) {
  await this.findByIdAndDelete(id);
};

module.exports = Employee;
