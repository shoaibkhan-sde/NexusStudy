const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
