const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculateNetSalary } = require('../utils/payrollCalculator');
const { generatePayslipPDF } = require('../utils/pdfGenerator');

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id || employee._id;
    }
    const payroll = await Payroll.findAll(filters);
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateMonthly = async (req, res) => {
  try {
    const { month } = req.body;
    const payrollMonth = month || new Date().toISOString().slice(0, 7);

    const employees = await Employee.find({}).select('_id salary').lean();

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
        allowances: calc.otherAllowances,
        bonus: calc.bonus,
        tax: calc.tax,
        pf: calc.pf,
        other_deductions: calc.otherDeductions,
        net_salary: calc.netSalary,
        status: 'processed'
      });
    }

    const payroll = await Payroll.findAll({ month: payrollMonth });
    res.json({ message: 'Payroll generated', data: payroll });
  } catch (error) {
    console.error("GENERATE PAYROLL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
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
    res.status(500).json({ message: error.message});
  }
};
