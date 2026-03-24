const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const attendanceController = require('../controllers/attendanceController');

router.post('/clock-in', authMiddleware, attendanceController.clockIn);
router.post('/clock-out', authMiddleware, attendanceController.clockOut);
router.get('/employee/:employeeId?', authMiddleware, attendanceController.getByEmployee);
router.get('/monthly-report', authMiddleware, attendanceController.getMonthlyReport);
router.post('/admin-correction', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), attendanceController.adminCorrection);

module.exports = router;
