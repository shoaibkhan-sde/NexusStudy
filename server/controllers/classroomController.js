const Classroom = require('../models/Classroom');
const crypto = require('crypto');

exports.createClassroom = async (req, res) => {
    try {
        const { name, subject, batch } = req.body;
        if (!name || !subject || !batch) return res.status(400).json({ msg: 'Please enter all fields' });

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars

        const newClassroom = new Classroom({
            name,
            subject,
            batch,
            inviteCode,
            admin: req.user,
            members: [req.user]
        });

        const savedClassroom = await newClassroom.save();
        res.json(savedClassroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.joinClassroom = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const classroom = await Classroom.findOne({ inviteCode });

        if (!classroom) return res.status(404).json({ msg: 'Classroom not found' });
        
        if (classroom.members.includes(req.user)) {
            return res.status(400).json({ msg: 'You are already a member of this classroom' });
        }

        classroom.members.push(req.user);
        await classroom.save();

        res.json(classroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({ members: req.user });
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClassroomDetails = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id).populate('members', 'name email avatar');
        if (!classroom) return res.status(404).json({ msg: 'Classroom not found' });
        res.json(classroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
