const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  review_date: { type: Date, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  goals: { type: String },
  manager_feedback: { type: String },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Performance = mongoose.model('Performance', performanceSchema);

const PerformanceModel = {
  findAll: async (filters = {}) => {
    const query = {};
    if (filters.employee_id) query.employee = filters.employee_id;

    let q = Performance.find(query).populate('employee', 'first_name last_name employee_code').sort({ review_date: -1 });
    if (filters.limit) q = q.limit(parseInt(filters.limit));
    if (filters.offset) q = q.skip(parseInt(filters.offset));

    const docs = await q.lean();
    return docs.map(d => ({ ...d, employee_id: d.employee?._id, first_name: d.employee?.first_name, last_name: d.employee?.last_name, employee_code: d.employee?.employee_code }));
  },

  findById: async (id) => {
    const doc = await Performance.findById(id).populate('employee', 'first_name last_name employee_code designation').lean();
    if (!doc) return null;
    return { ...doc, employee_id: doc.employee?._id, first_name: doc.employee?.first_name, last_name: doc.employee?.last_name, employee_code: doc.employee?.employee_code, designation: doc.employee?.designation };
  },

  create: async (data) => {
    const perf = await Performance.create({
      ...data,
      employee: data.employee_id
    });
    return perf._id.toString();
  },

  update: async (id, data) => {
    const allowed = ['rating', 'comments', 'goals', 'manager_feedback', 'reviewed_by'];
    const update = {};
    allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k]; });
    await Performance.findByIdAndUpdate(id, { $set: update });
  }
};

module.exports = PerformanceModel;
