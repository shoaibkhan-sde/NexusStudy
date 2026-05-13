const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    batch: { type: String, required: true }, // e.g. "CS 2025"
    inviteCode: { type: String, required: true, unique: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
