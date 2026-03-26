const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./config/db');

// ✅ ADD MODELS HERE (CRITICAL)
require('./models/Employee');
require('./models/Attendance');
require('./models/Leave');
require('./models/Payroll');
require('./models/Department'); 
require('./models/Performance'); 
require('./models/Recruitment'); // if used
require('./models/DocumentRequest');
require('./models/User'); // if auth uses it

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const documentRequestRoutes = require('./routes/documentRequestRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:3000'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', success: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/document-requests', documentRequestRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`EnterpriseHR API running on port ${PORT}`);
});