const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leave_type: { type: String, enum: ['sick_leave', 'casual_leave', 'paid_leave', 'work_from_home'], required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);

const LeaveModel = {
  findAll: async (filters = {}) => {
    const query = {};
    if (filters.employee_id) query.employee = filters.employee_id;
    if (filters.status) query.status = filters.status;
    if (filters.leave_type) query.leave_type = filters.leave_type;

    let q = Leave.find(query).populate('employee', 'first_name last_name employee_code email').sort({ createdAt: -1 });
    if (filters.limit) q = q.limit(parseInt(filters.limit));
    if (filters.offset) q = q.skip(parseInt(filters.offset));

    const docs = await q.lean();
    return docs.map((d) => ({
      ...d,
      id: d._id,
      employee_id: d.employee?._id,
      employeeId: d.employee?._id,
      first_name: d.employee?.first_name,
      last_name: d.employee?.last_name,
      employee_code: d.employee?.employee_code,
      email: d.employee?.email,
    }));
  },

  findById: async (id) => {
    const doc = await Leave.findById(id).populate('employee', 'first_name last_name employee_code email department').lean();
    if (!doc) return null;
    return {
      ...doc,
      id: doc._id,
      employee_id: doc.employee?._id,
      employeeId: doc.employee?._id,
      first_name: doc.employee?.first_name,
      last_name: doc.employee?.last_name,
      employee_code: doc.employee?.employee_code,
      email: doc.employee?.email,
      department_id: doc.employee?.department,
    };
  },

  create: async (data) => {
    const leave = await Leave.create({
      ...data,
      employee: data.employee_id
    });
    return leave._id.toString();
  },

  update: async (id, data) => {
    const update = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.approved_by !== undefined) update.approved_by = data.approved_by;
    await Leave.findByIdAndUpdate(id, { $set: update });
  },

  getLeaveStats: async (startDate, endDate) => {
    const stats = await Leave.aggregate([
      { $match: { start_date: { $lte: new Date(endDate) }, end_date: { $gte: new Date(startDate) } } },
      { $group: { _id: { leave_type: '$leave_type', status: '$status' }, count: { $sum: 1 } } },
      { $project: { leave_type: '$_id.leave_type', status: '$_id.status', count: 1, _id: 0 } }
    ]);
    return stats;
  }
};

module.exports = LeaveModel;
