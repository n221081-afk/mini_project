const PDFDocument = require('pdfkit');

const generatePayslipPDF = (payslipData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('PAYSLIP', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`Employee: ${payslipData.employeeName || 'N/A'}`);
      doc.text(`Employee ID: ${payslipData.employeeCode || 'N/A'}`);
      doc.text(`Month: ${payslipData.month || 'N/A'}`);
      doc.moveDown();

      doc.text('EARNINGS', { underline: true });
      doc.text(`Basic Salary: Rs. ${payslipData.basicSalary || 0}`);
      doc.text(`HRA: Rs. ${payslipData.hra || 0}`);
      doc.text(`Allowances: Rs. ${payslipData.allowances || 0}`);
      doc.text(`Bonus: Rs. ${payslipData.bonus || 0}`);
      doc.moveDown();

      doc.text('DEDUCTIONS', { underline: true });
      doc.text(`Tax: Rs. ${payslipData.tax || 0}`);
      doc.text(`Provident Fund: Rs. ${payslipData.pf || 0}`);
      doc.text(`Other Deductions: Rs. ${payslipData.otherDeductions || 0}`);
      doc.moveDown();

      doc.fontSize(14).text(`NET SALARY: Rs. ${payslipData.netSalary || 0}`, { bold: true });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePayslipPDF };
