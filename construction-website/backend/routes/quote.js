const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // ← replace Quote model
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

        // Insert quote request into Supabase
        const { data: quote, error } = await supabase
            .from('quotes')
            .insert([{
                name: sanitized.name,
                email: sanitized.email.toLowerCase(),
                phone: sanitized.phone,
                project_type: sanitized.projectType, // ← camelCase to snake_case for SQL
                details: sanitized.details || '',
                status: 'new'
            }])
            .select()
            .single();

        if (error) {
            console.error('✗ Supabase insert error:', error.message);
            return res.status(500).json({ error: 'Failed to submit quote request' });
        }

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
        const { data: quotes, error } = await supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Supabase fetch error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch quotes' });
        }

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

        const { data: quote, error } = await supabase
            .from('quotes')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !quote) {
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
        const { data: quote, error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        res.json({ success: true, message: 'Quote deleted' });
    } catch (error) {
        console.error('✗ Error deleting quote:', error.message);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

module.exports = router;