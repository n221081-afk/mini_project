const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  job_title: { type: String, required: true },
  candidate_name: { type: String, required: true },
  candidate_email: { type: String },
  candidate_phone: { type: String },
  stage: { type: String, enum: ['application_received', 'interview_scheduled', 'selected', 'rejected'], default: 'application_received' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String }
}, { timestamps: true });

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);

const RecruitmentModel = {
  findAll: async (filters = {}) => {
    const query = {};
    if (filters.stage) query.stage = filters.stage;
    if (filters.status) query.status = filters.status;
    if (filters.job_title) query.job_title = new RegExp(filters.job_title, 'i');

    let q = Recruitment.find(query).sort({ createdAt: -1 });
    if (filters.limit) q = q.limit(parseInt(filters.limit));
    if (filters.offset) q = q.skip(parseInt(filters.offset));

    return q.lean();
  },

  findById: async (id) => {
    return Recruitment.findById(id).lean();
  },

  create: async (data) => {
    const rec = await Recruitment.create(data);
    return rec._id.toString();
  },

  update: async (id, data) => {
    const allowed = ['job_title', 'candidate_name', 'candidate_email', 'candidate_phone', 'stage', 'status', 'notes'];
    const update = {};
    allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k]; });
    await Recruitment.findByIdAndUpdate(id, { $set: update });
  },

  delete: async (id) => {
    await Recruitment.findByIdAndDelete(id);
  }
};

module.exports = RecruitmentModel;
