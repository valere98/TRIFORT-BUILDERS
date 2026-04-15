const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const authMiddleware = require('../middleware/authMiddleware');
const { validateQuoteRequest, sanitizeObject } = require('../utils/validators');

// POST: Submit quote request (public endpoint)
router.post('/request', async (req, res) => {
    try {
        const { name, email, phone, projectType, details } = req.body;
        
        // Validate form data
        const validation = validateQuoteRequest({ name, email, phone, projectType, details });
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            { name, email, phone, projectType, details },
            ['name', 'projectType', 'details']
        );

        // Create quote request record
        const quote = new Quote({
            name: sanitized.name,
            email: sanitized.email.toLowerCase(),
            phone: sanitized.phone,
            projectType: sanitized.projectType,
            details: sanitized.details || '',
            status: 'new'
        });
        
        await quote.save();
        console.log('✓ Quote request received:', quote.email);
        
        res.json({ 
            success: true, 
            message: 'Quote request submitted! Our team will review and contact you soon.' 
        });
    } catch (error) {
        console.error('✗ Error submitting quote request:', error.message);
        res.status(500).json({ error: 'Failed to submit quote request' });
    }
});

// GET: Fetch all quotes (admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ created_at: -1 });
        res.json(quotes);
    } catch (error) {
        console.error('✗ Error fetching quotes:', error.message);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});

// PUT: Update quote status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status value
        if (status && !['new', 'reviewed', 'quoted', 'approved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

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
        console.error('✗ Error updating quote:', error.message);
        res.status(500).json({ error: 'Failed to update quote' });
    }
});

// DELETE: Remove quote (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        res.json({ success: true, message: 'Quote deleted' });
    } catch (error) {
        console.error('✗ Error deleting quote:', error.message);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

module.exports = router;

