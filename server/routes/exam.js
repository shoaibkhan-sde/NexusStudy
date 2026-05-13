const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');

// Create Exam
router.post('/', auth, async (req, res) => {
    try {
        const { classroomId, title, date, description } = req.body;
        const newExam = new Exam({ classroomId, title, date, description });
        await newExam.save();
        res.json(newExam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Exams for Classroom
router.get('/:classroomId', auth, async (req, res) => {
    try {
        const exams = await Exam.find({ classroomId: req.params.classroomId });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
