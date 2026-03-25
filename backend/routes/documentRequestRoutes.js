const express = require('express');
const router = express.Router();
const documentRequestController = require('../controllers/documentRequestController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', documentRequestController.create);
router.get('/', documentRequestController.getAll);
router.put('/:id/accept', documentRequestController.accept);
router.put('/:id/reject', documentRequestController.reject);
router.get('/:id/download', documentRequestController.download);

module.exports = router;
