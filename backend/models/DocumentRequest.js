const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  request_type: { type: String, required: true }, // e.g., 'Bundle Request', 'Document Request'
  subject: { type: String },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  hr_name: { type: String }, // Populated when accepted
  accepted_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
