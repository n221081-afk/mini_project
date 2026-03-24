const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const payrollController = require('../controllers/payrollController');

router.get('/', authMiddleware, payrollController.getAll);
router.get('/:id/download-payslip', authMiddleware, payrollController.downloadPayslip);
router.get('/:id', authMiddleware, payrollController.getById);
router.post('/generate', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), payrollController.generateMonthly);
router.post('/generateMonthly', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), payrollController.generateMonthly);

module.exports = router;
