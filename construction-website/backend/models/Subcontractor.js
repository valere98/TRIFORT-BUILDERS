const mongoose = require('mongoose');
const SubcontractorSchema = new mongoose.Schema({
    company: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    trade: { type: String, required: true },
    experience: { type: String },
    serviceArea: { type: String },
    message: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'reviewing', 'approved', 'rejected'] },
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Subcontractor', SubcontractorSchema);