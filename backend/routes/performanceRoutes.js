const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const performanceController = require('../controllers/performanceController');

router.get('/', authMiddleware, performanceController.getAll);
router.get('/:id', authMiddleware, performanceController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), performanceController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), performanceController.update);

module.exports = router;
