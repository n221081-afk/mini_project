const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'half_day', 'leave'], default: 'present' },
  clock_in: { type: String },
  clock_out: { type: String },
  notes: { type: String }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

const AttendanceModel = {
  normalize: (doc) => {
    if (!doc) return null;
    const status = typeof doc.status === 'string' ? doc.status.toLowerCase() : doc.status;
    return {
      ...doc,
      id: doc._id,
      employee_id: doc.employee,
      employeeId: doc.employee,
      status,
      status_label: status && status.charAt(0).toUpperCase() + status.slice(1),
      present: status === 'present',
    };
  },

  findByEmployeeAndDate: async (employeeId, date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const start = new Date(dateStr + 'T00:00:00');
    const end = new Date(dateStr + 'T23:59:59.999');
    const doc = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    }).lean();
    return AttendanceModel.normalize(doc);
  },

  findByEmployee: async (employeeId, startDate, endDate) => {
    const docs = await Attendance.find({
      employee: employeeId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: -1 }).lean();
    return docs.map((d) => AttendanceModel.normalize(d));
  },

  findByDepartment: async (departmentId, startDate, endDate) => {
    const docs = await Attendance.aggregate([
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
      { $unwind: '$emp' },
      { $match: { 'emp.department': mongoose.Types.ObjectId(departmentId) } },
      { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $sort: { date: -1 } },
      { $project: { emp: 0 } }
    ]);
    return docs;
  },

  create: async (data) => {
    const att = await Attendance.create({
      ...data,
      employee: data.employee_id
    });
    return att._id.toString();
  },

  update: async (id, data) => {
    const update = {};
    ['status', 'clock_in', 'clock_out', 'notes'].forEach(k => {
      if (data[k] !== undefined) update[k] = data[k];
    });
    await Attendance.findByIdAndUpdate(id, { $set: update });
  },

  upsert: async (employeeId, date, data) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr + 'T00:00:00');

    await Attendance.findOneAndUpdate(
      { employee: employeeId, date: { $gte: startOfDay, $lte: new Date(dateStr + 'T23:59:59.999') } },
      {
        $set: {
          employee: employeeId,
          date: startOfDay,
          status: data.status || 'present',
          clock_in: data.clock_in || undefined,
          clock_out: data.clock_out,
          notes: data.notes
        }
      },
      { upsert: true }
    );
  },

  getMonthlyReport: async (month) => {
    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59);

    const report = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$employee', present_days: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, absent_days: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }, half_days: { $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] } }, leave_days: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } } } },
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'emp' } },
      { $unwind: '$emp' },
      { $lookup: { from: 'departments', localField: 'emp.department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { employee_id: '$_id', first_name: '$emp.first_name', last_name: '$emp.last_name', employee_code: '$emp.employee_code', department_name: '$dept.name', present_days: 1, absent_days: 1, half_days: 1, leave_days: 1 } }
    ]);

    const empIds = report.map(r => r.employee_id);
    const allEmps = await mongoose.model('Employee').find({ status: 'active', _id: { $nin: empIds } }).populate('department', 'name').lean();
    const zeroReport = allEmps.map(e => ({
      employee_id: e._id,
      first_name: e.first_name,
      last_name: e.last_name,
      employee_code: e.employee_code,
      department_name: e.department?.name,
      present_days: 0,
      absent_days: 0,
      half_days: 0,
      leave_days: 0
    }));
    return [...report, ...zeroReport];
  }
};

module.exports = AttendanceModel;
