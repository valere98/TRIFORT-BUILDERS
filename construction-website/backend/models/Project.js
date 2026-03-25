

const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String }, 
    category: { type: String, required: true },
    location: { type: String },
    completion_date: { type: Date },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
