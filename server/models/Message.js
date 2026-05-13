const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    isResolved: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', messageSchema);
