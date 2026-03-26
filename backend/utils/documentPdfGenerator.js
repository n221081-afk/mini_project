const PDFDocument = require('pdfkit');

const generateDocumentPDF = (docData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('OFFICIAL DOCUMENT', { align: 'center' });
      doc.moveDown();
      
      // Employee Info
      doc.fontSize(12);
      doc.text(`Employee Name: ${docData.employeeName || 'N/A'}`);
      doc.text(`Employee ID: ${docData.employeeCode || 'N/A'}`);
      doc.moveDown();

      // Request Details
      doc.text(`Request Type: ${docData.requestType}`);
      doc.text(`Approval Status: ${docData.status.toUpperCase()}`);
      doc.text(`Date of Approval: ${new Date(docData.acceptedAt).toLocaleDateString()}`);
      doc.moveDown();
      
      doc.text('Subject / Details:', { underline: true });
      doc.text(docData.subject || 'N/A');
      doc.moveDown(2);

      // HR Signature
      doc.text('Approved By:');
      doc.text(`HR Name: ${docData.hrName}`);
      doc.moveDown();
      // Placeholder for digital signature text
      doc.fontSize(16).font('Helvetica-Oblique').text(`[Digitally Signed by ${docData.hrName}]`);
      doc.font('Helvetica'); // Reset font

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateDocumentPDF };
