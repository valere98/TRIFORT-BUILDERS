const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
let submissions = [];
router.post('/submit', async (req, res) => {
    try {
        const { 'company-name': company, 'contact-name': contact, email, phone, trade, experience, 'service-area': serviceArea, message } = req.body;
        if (!company || !contact || !email || !trade) return res.status(400).json({ error: 'Company name, contact, email and trade are required.' });
        const submission = { id: Date.now().toString(), company, contact, email, phone: phone||'', trade, experience: experience||'', serviceArea: serviceArea||'', message: message||'', status: 'pending', created_at: new Date() };
        submissions.push(submission);
        console.log('Subcontractor application received:', submission);
        res.json({ success: true, message: 'Application received! We will review and contact you shortly.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});
router.get('/all', authMiddleware, (req, res) => {
    res.json([...submissions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
});
router.delete('/:id', authMiddleware, (req, res) => {
    const idx = submissions.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found.' });
    submissions.splice(idx, 1);
    res.json({ success: true, message: 'Deleted.' });
});
module.exports = router;