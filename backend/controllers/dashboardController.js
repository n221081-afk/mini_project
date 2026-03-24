const mongoose = require('mongoose');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const Employee = mongoose.model('Employee');
    const Attendance = mongoose.model('Attendance');
    const Leave = mongoose.model('Leave');
    const Payroll = mongoose.model('Payroll');

    const [totalEmployees, activeEmployees, presentToday, pendingLeaves, payrollSummary] = await Promise.all([
      Employee.countDocuments().catch(() => 0),
      Employee.countDocuments({ status: 'active' }).catch(() => 0),
      Attendance.countDocuments({
        date: { $gte: today, $lte: endOfToday },
        status: 'present',
      }).catch(() => 0),
      Leave.countDocuments({ status: 'pending' }).catch(() => 0),
      Payroll.aggregate([
        { $match: { month: currentMonth } },
        { $group: { _id: null, total: { $sum: '$net_salary' }, count: { $sum: 1 } } },
      ]).then((r) => (r[0] ? { monthlyPayrollCost: r[0].total, payrollProcessed: r[0].count } : { monthlyPayrollCost: 0, payrollProcessed: 0 })).catch(() => ({ monthlyPayrollCost: 0, payrollProcessed: 0 })),
    ]);

    res.json({
      success: true,
      data: {
        total_employees: totalEmployees,
        active_employees: activeEmployees,
        present_today: presentToday,
        pending_leave_approvals: pendingLeaves,
        monthly_payroll_cost: payrollSummary.monthlyPayrollCost || 0,
        payroll_processed_this_month: payrollSummary.payrollProcessed || 0,
      },
    });
  } catch (error) {
    console.error("❌ ERROR IN getStats:", error); // VERY IMPORTANT
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: error.stack
    });
  }
};
