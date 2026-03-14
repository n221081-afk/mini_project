const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employee_code: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  salary: { type: Number, default: 0 },
  join_date: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  profile_photo: { type: String }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

// Static methods to match previous interface
Employee.findAll = async function(filters = {}) {
  const query = {};
  if (filters.department_id) query.department = filters.department_id;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    query.$or = [
      { first_name: regex },
      { last_name: regex },
      { email: regex },
      { employee_code: regex }
    ];
  }

  let q = this.find(query).populate('department', 'name').sort({ createdAt: -1 });
  if (filters.limit) q = q.limit(parseInt(filters.limit));
  if (filters.offset) q = q.skip(parseInt(filters.offset));

  const docs = await q.lean();
  return docs.map(d => ({ ...d, id: d._id, department_name: d.department?.name, department_id: d.department?._id }));
};

Employee.findById = async function(id) {
  const doc = await this.findOne({ _id: id }).populate('department', 'name').lean();
  if (!doc) return null;
  return { ...doc, id: doc._id, department_name: doc.department?.name, department_id: doc.department?._id };
};

Employee.findByUserId = async function(userId) {
  const doc = await this.findOne({ user: userId }).populate('department', 'name').lean();
  if (!doc) return null;
  return { ...doc, id: doc._id, department_name: doc.department?.name, department_id: doc.department?._id, user_id: doc.user };
};

Employee.findByEmployeeCode = async function(code) {
  return this.findOne({ employee_code: code }).lean();
};

Employee.create = async function(employeeData) {
  const data = { ...employeeData };
  if (data.user_id) { data.user = data.user_id; delete data.user_id; }
  if (data.department_id) { data.department = data.department_id; delete data.department_id; }
  const emp = new this(data);
  await emp.save();
  return emp._id;
};

Employee.update = async function(id, employeeData) {
  const data = { ...employeeData };
  if (data.user_id !== undefined) { data.user = data.user_id; delete data.user_id; }
  if (data.department_id !== undefined) { data.department = data.department_id; delete data.department_id; }
  await this.findByIdAndUpdate(id, { $set: data });
};

Employee.delete = async function(id) {
  await this.findByIdAndDelete(id);
};

Employee.count = async function(filters = {}) {
  const query = {};
  if (filters.department_id) query.department = filters.department_id;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    query.$or = [
      { first_name: regex },
      { last_name: regex },
      { email: regex },
      { employee_code: regex }
    ];
  }
  return this.countDocuments(query);
};

module.exports = Employee;
