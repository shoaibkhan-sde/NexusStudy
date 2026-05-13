const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createClassroom, joinClassroom, getUserClassrooms, getClassroomDetails } = require('../controllers/classroomController');

router.post('/create', auth, createClassroom);
router.post('/join/:inviteCode', auth, joinClassroom);
router.get('/my-classrooms', auth, getUserClassrooms);
router.get('/:id', auth, getClassroomDetails);

module.exports = router;
