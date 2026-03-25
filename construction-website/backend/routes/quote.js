const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/request', async (req, res) => {
    try {
        const { name, email, phone, projectType, details } = req.body;
        
        if (!name || !email || !phone || !projectType) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }
        
        const quote = new Quote({
            name,
            email,
            phone,
            projectType,
            details: details || ''
        });
        
        await quote.save();
        console.log('Quote request received:', quote);
        
        res.json({ 
            success: true, 
            message: 'Quote request submitted! Our team will review and contact you soon.' 
        });
    } catch (error) {
        console.error('Error submitting quote request:', error);
        res.status(500).json({ error: 'Failed to submit quote request' });
    }
});


router.get('/all', authMiddleware, async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ created_at: -1 });
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});


router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        res.json({ success: true, message: 'Quote updated', quote });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update quote' });
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        res.json({ success: true, message: 'Quote deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

module.exports = router;

