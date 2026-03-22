const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculateNetSalary } = require('../utils/payrollCalculator');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = { ...req.query };
    if (req.user.role === 'employee' && employee) {
      filters.employee_id = employee.id || employee._id;
    }
    const payroll = await Payroll.findAll(filters);
    sendSuccess(res, payroll);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.getById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return sendError(res, 404, 'Payroll record not found');
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return sendError(res, 403, 'Access denied');
    }
    sendSuccess(res, payroll);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
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
    sendSuccess(res, { message: 'Payroll generated', data: payroll });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return sendError(res, 404, 'Payroll record not found');
    }
    const employee = await Employee.findByUserId(req.user.id);
    if (req.user.role === 'employee' && employee && payroll.employee_id?.toString() !== (employee.id || employee._id)?.toString()) {
      return sendError(res, 403, 'Access denied');
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
    sendError(res, 500, error.message, error);
  }
};
