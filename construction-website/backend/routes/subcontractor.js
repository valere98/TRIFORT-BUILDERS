const express = require('express');
const router = express.Router();
const Subcontractor = require('../models/Subcontractor');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/submit', async (req, res) => {
    try {
        const { 'company-name': company, 'contact-name': contact, email, phone, trade, experience, 'service-area': serviceArea, message } = req.body;
        if (!company || !contact || !email || !trade) return res.status(400).json({ error: 'Company name, contact, email and trade are required.' });
        const submission = new Subcontractor({ company, contact, email, phone: phone||'', trade, experience: experience||'', serviceArea: serviceArea||'', message: message||'' });
        await submission.save();
        console.log('Subcontractor application saved:', submission);
        res.json({ success: true, message: 'Application received! We will review and contact you shortly.' });
    } catch (error) {
        console.error('Error saving subcontractor application:', error);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});

router.get('/all', authMiddleware, async (req, res) => {
    try {
        const submissions = await Subcontractor.find().sort({ created_at: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Subcontractor.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!submission) return res.status(404).json({ error: 'Application not found.' });
        res.json({ success: true, message: 'Status updated.', submission });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update application.' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Subcontractor.findByIdAndDelete(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Application not found.' });
        res.json({ success: true, message: 'Application deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete application.' });
    }
});

module.exports = router;