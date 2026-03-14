/**
 * Payroll calculation utilities
 */

const calculateHRA = (basicSalary, hraPercent = 20) => {
  return Math.round((basicSalary * hraPercent) / 100);
};

const calculatePF = (basicSalary, pfPercent = 12) => {
  return Math.round((basicSalary * pfPercent) / 100);
};

const calculateTax = (grossSalary) => {
  if (grossSalary <= 250000) return 0;
  if (grossSalary <= 500000) return Math.round((grossSalary - 250000) * 0.05);
  if (grossSalary <= 1000000) return Math.round(12500 + (grossSalary - 500000) * 0.2);
  return Math.round(112500 + (grossSalary - 1000000) * 0.3);
};

const calculateNetSalary = (basicSalary, allowances = {}, deductions = {}) => {
  const hra = allowances.hra ?? calculateHRA(basicSalary);
  const otherAllowances = allowances.other || 0;
  const bonus = allowances.bonus || 0;
  
  const grossSalary = basicSalary + hra + otherAllowances + bonus;
  
  const pf = deductions.pf ?? calculatePF(basicSalary);
  const tax = deductions.tax ?? calculateTax(grossSalary);
  const otherDeductions = deductions.other || 0;
  
  const totalDeductions = pf + tax + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    hra,
    otherAllowances,
    bonus,
    grossSalary,
    pf,
    tax,
    otherDeductions,
    totalDeductions,
    netSalary: Math.round(netSalary)
  };
};

module.exports = {
  calculateHRA,
  calculatePF,
  calculateTax,
  calculateNetSalary
};
