const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const departmentController = require('../controllers/departmentController');

router.get('/', authMiddleware, departmentController.getAll);
router.get('/:id/employees', authMiddleware, departmentController.getWithEmployees);
router.get('/:id', authMiddleware, departmentController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'hr_manager'), departmentController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'hr_manager'), departmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), departmentController.delete);

module.exports = router;
