const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    projectType: { type: String, required: true },
    details: { type: String },
    status: { type: String, default: 'new', enum: ['new', 'reviewed', 'quoted', 'approved'] },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', QuoteSchema);
