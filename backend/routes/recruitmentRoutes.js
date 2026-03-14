const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const recruitmentController = require('../controllers/recruitmentController');

router.get('/', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.getAll);
router.get('/:id', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.update);
router.put('/:id/stage', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.updateStage);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'hr_manager'), recruitmentController.delete);

module.exports = router;
