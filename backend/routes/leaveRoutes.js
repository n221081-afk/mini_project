const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const leaveController = require('../controllers/leaveController');

router.get('/', authMiddleware, leaveController.getAll);
router.get('/stats', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), leaveController.getStats);
router.get('/:id', authMiddleware, leaveController.getById);
router.post('/apply', authMiddleware, leaveController.apply);
router.put('/:id/approve', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), leaveController.approve);
router.put('/:id/reject', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), leaveController.reject);
router.put('/:id/cancel', authMiddleware, leaveController.cancel);

module.exports = router;
