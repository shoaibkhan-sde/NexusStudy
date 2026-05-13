const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { uploadResource, getClassroomResources } = require('../controllers/resourceController');

router.post('/upload', auth, upload.single('file'), uploadResource);
router.get('/:classroomId', auth, getClassroomResources);

module.exports = router;
