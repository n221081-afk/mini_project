const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculateNetSalary } = require('../utils/payrollCalculator');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const hasManagerAccess = (role) => ['admin', 'hr', 'hr_manager'].includes(role);

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id || employee._id;
    }
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    if (req.query.page && req.query.limit) {
      filters.limit = limit;
      filters.offset = (page - 1) * limit;
    }
    const payroll = await Payroll.findAll(filters);
    res.json({
      success: true,
      data: payroll,
      page,
      limit,
      total: payroll.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (!hasManagerAccess(req.user.role) && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.generateMonthly = async (req, res) => {
  try {
    const { month } = req.body;
    const payrollMonth = month || new Date().toISOString().slice(0, 7);

    const employees = await Employee.find({ status: 'active' }).select('_id salary').lean();

    for (const emp of employees) {
      if (!emp.salary || emp.salary <= 0) {
        continue; // skip employee with invalid salary
      }

      const calc = calculateNetSalary(emp.salary);
      await Payroll.upsert({
        employee_id: emp._id,
        month: payrollMonth,
        basic_salary: calc.basicSalary,
        hra: calc.hra,
        allowances: calc.otherAllowances + calc.bonus,
        bonus: calc.bonus,
        tax: calc.tax,
        pf: calc.pf,
        other_deductions: calc.otherDeductions,
        net_salary: calc.basicSalary + (calc.otherAllowances + calc.bonus + calc.hra) - (calc.tax + calc.pf + calc.otherDeductions),
        status: 'processed'
      });
    }

    const payroll = await Payroll.findAll({ month: payrollMonth });
    res.json({ success: true, message: 'Payroll generated', data: payroll });
  } catch (error) {
    console.error("GENERATE PAYROLL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (!hasManagerAccess(req.user.role) && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payslipData = {
      employeeName: `${payroll.first_name || ""} ${payroll.last_name || ""}`,
      employeeCode: payroll.employee_code,
      month: payroll.month,
      basicSalary: payroll.basic_salary,
      hra: payroll.hra,
      allowances: payroll.allowances,
      bonus: payroll.bonus,
      tax: payroll.tax,
      pf: payroll.pf,
      otherDeductions: payroll.other_deductions,
      netSalary: payroll.net_salary
    };

    const pdfBuffer = await generatePayslipPDF(payslipData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.employee_code || "employee"}-${payroll.month}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PAYSLIP ERROR:", error);
    res.status(500).json({ success: false, message: error.message});
  }
};
