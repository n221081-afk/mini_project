const DocumentRequest = require('../models/DocumentRequest');
const Employee = require('../models/Employee');
const { generateDocumentPDF } = require('../utils/documentPdfGenerator');
const mongoose = require('mongoose');

const hasManagerAccess = (role) => ['admin', 'hr', 'hr_manager'].includes(role);

exports.create = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newReq = await DocumentRequest.create({
      employee_id: employee.id || employee._id,
      request_type: req.body.request_type,
      subject: req.body.subject,
      message: req.body.message,
      // Auto-Approve the document request immediately
      status: 'accepted',
      accepted_at: new Date(),
      hr_name: 'Auto-Approved System'
    });

    res.status(201).json({ success: true, data: newReq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    const filters = {};
    if (!hasManagerAccess(req.user.role)) {
      if (!employee) return res.json({ success: true, data: [] });
      filters.employee_id = employee.id || employee._id;
    }

    const requests = await DocumentRequest.find(filters)
      .populate('employee_id', 'first_name last_name employee_code')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = requests.map(r => ({
      ...r,
      employee_name: r.employee_id ? `${r.employee_id.first_name || ''} ${r.employee_id.last_name || ''}`.trim() : 'Unknown',
      employee_code: r.employee_id?.employee_code
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.accept = async (req, res) => {
  try {
    if (!hasManagerAccess(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const docReq = await DocumentRequest.findById(req.params.id);
    if (!docReq) return res.status(404).json({ success: false, message: 'Request not found' });

    docReq.status = 'accepted';
    docReq.accepted_at = new Date();
    docReq.hr_name = req.user.name || 'HR Manager'; 
    await docReq.save();

    res.json({ success: true, message: 'Request accepted', data: docReq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reject = async (req, res) => {
  try {
    if (!hasManagerAccess(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const docReq = await DocumentRequest.findById(req.params.id);
    if (!docReq) return res.status(404).json({ success: false, message: 'Request not found' });

    docReq.status = 'rejected';
    await docReq.save();

    res.json({ success: true, message: 'Request rejected', data: docReq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.download = async (req, res) => {
  try {
    const docReq = await DocumentRequest.findById(req.params.id).populate('employee_id', 'first_name last_name employee_code');
    if (!docReq) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const employee = await Employee.findByUserId(req.user.id);
    if (!hasManagerAccess(req.user.role)) {
      if (!employee || docReq.employee_id?._id.toString() !== (employee.id || employee._id).toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    if (docReq.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Document has not been accepted yet' });
    }

    const pdfData = {
      employeeName: `${docReq.employee_id?.first_name || ''} ${docReq.employee_id?.last_name || ''}`.trim(),
      employeeCode: docReq.employee_id?.employee_code,
      requestType: docReq.request_type,
      subject: docReq.subject,
      status: docReq.status,
      hrName: docReq.hr_name,
      acceptedAt: docReq.accepted_at
    };

    const pdfBuffer = await generateDocumentPDF(pdfData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${docReq.request_type.replace(/\s+/g, '_')}-${pdfData.employeeCode}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
