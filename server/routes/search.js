const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const Message = require('../models/Message');

router.get('/', auth, async (req, res) => {
    try {
        const { q, classroomId } = req.query;
        if (!q) return res.status(400).json({ msg: 'Search query is required' });

        const query = { $text: { $search: q } };
        if (classroomId) query.classroomId = classroomId;

        const [resources, messages] = await Promise.all([
            Resource.find(query).populate('uploadedBy', 'name'),
            Message.find(query).populate('sender', 'name')
        ]);

        res.json({
            resources,
            messages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
