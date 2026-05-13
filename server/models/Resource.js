const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    type: { type: String, enum: ['pdf', 'link', 'note'], required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    isPinned: { type: Boolean, default: false },
}, { timestamps: true });

resourceSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
