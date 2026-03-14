const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const reportController = require('../controllers/reportController');

router.get('/employees-by-department', authMiddleware, roleMiddleware('admin', 'hr_manager'), reportController.employeesByDepartment);
router.get('/monthly-attendance', authMiddleware, roleMiddleware('admin', 'hr_manager'), reportController.monthlyAttendance);
router.get('/leave-report', authMiddleware, roleMiddleware('admin', 'hr_manager'), reportController.leaveReport);
router.get('/payroll-summary', authMiddleware, roleMiddleware('admin', 'hr_manager'), reportController.payrollSummary);
router.get('/export', authMiddleware, roleMiddleware('admin', 'hr_manager'), reportController.exportCSV);

module.exports = router;
