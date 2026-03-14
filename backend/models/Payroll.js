const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },
  basic_salary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  other_deductions: { type: Number, default: 0 },
  net_salary: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'processed', 'paid'], default: 'draft' }
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

const PayrollModel = {
  findAll: async (filters = {}) => {
    const query = {};
    if (filters.employee_id) query.employee = filters.employee_id;
    if (filters.month) query.month = filters.month;
    if (filters.status) query.status = filters.status;

    let q = Payroll.find(query).populate('employee', 'first_name last_name employee_code email').sort({ month: -1 });
    if (filters.limit) q = q.limit(parseInt(filters.limit));
    if (filters.offset) q = q.skip(parseInt(filters.offset));

    const docs = await q.lean();
    return docs.map(d => ({ ...d, employee_id: d.employee?._id, first_name: d.employee?.first_name, last_name: d.employee?.last_name, employee_code: d.employee?.employee_code, email: d.employee?.email }));
  },

  findByEmployeeAndMonth: async (employeeId, month) => {
    const doc = await Payroll.findOne({ employee: employeeId, month }).lean();
    return doc ? { ...doc, employee_id: doc.employee } : null;
  },

  findById: async (id) => {
    const doc = await Payroll.findById(id).populate('employee', 'first_name last_name employee_code email designation').lean();
    if (!doc) return null;
    return { ...doc, employee_id: doc.employee?._id, first_name: doc.employee?.first_name, last_name: doc.employee?.last_name, employee_code: doc.employee?.employee_code, email: doc.employee?.email, designation: doc.employee?.designation };
  },

  create: async (data) => {
    const payroll = await Payroll.create({
      ...data,
      employee: data.employee_id
    });
    return payroll._id.toString();
  },

  update: async (id, data) => {
    const allowed = ['basic_salary', 'hra', 'allowances', 'bonus', 'tax', 'pf', 'other_deductions', 'net_salary', 'status'];
    const update = {};
    allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k]; });
    if (Object.keys(update).length > 0) await Payroll.findByIdAndUpdate(id, { $set: update });
  },

  upsert: async (data) => {
    await Payroll.findOneAndUpdate(
      { employee: data.employee_id, month: data.month },
      {
        $set: {
          employee: data.employee_id,
          month: data.month,
          basic_salary: data.basic_salary,
          hra: data.hra || 0,
          allowances: data.allowances || 0,
          bonus: data.bonus || 0,
          tax: data.tax || 0,
          pf: data.pf || 0,
          other_deductions: data.other_deductions || 0,
          net_salary: data.net_salary,
          status: data.status || 'processed'
        }
      },
      { upsert: true }
    );
  }
};

module.exports = PayrollModel;
