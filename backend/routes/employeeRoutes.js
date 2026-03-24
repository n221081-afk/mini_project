const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const employeeController = require('../controllers/employeeController');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `profile-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authMiddleware, employeeController.getAll);
router.get('/profile', authMiddleware, employeeController.getProfile);
router.get('/:id', authMiddleware, employeeController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), upload.single('profile_photo'), employeeController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), upload.single('profile_photo'), employeeController.update);
router.put('/:id/salary-hike', authMiddleware, roleMiddleware('admin', 'hr', 'hr_manager'), employeeController.applySalaryHike);
router.put('/:id/terminate', authMiddleware, roleMiddleware('admin'), employeeController.terminateEmployee);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), employeeController.delete);
router.post('/contact-hr', authMiddleware, employeeController.contactHR);

module.exports = router;
