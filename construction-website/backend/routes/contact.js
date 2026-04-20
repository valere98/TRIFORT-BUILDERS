const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // ← replace Contact model
const authMiddleware = require('../middleware/authMiddleware');
const { validateContactForm, sanitizeObject } = require('../utils/validators');

// POST: Submit contact form (public endpoint)
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;
        
        // Validate form data
        const validation = validateContactForm({ name, email, subject, message, phone });
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            { name, email, subject, message, phone },
            ['name', 'subject', 'message', 'phone']
        );

        // Insert contact record into Supabase
        const { data: contact, error } = await supabase
            .from('contacts')
            .insert([{
                name: sanitized.name,
                email: sanitized.email.toLowerCase(),
                subject: sanitized.subject || 'No subject',
                message: sanitized.message,
                phone: sanitized.phone || '',
                status: 'new'
            }])
            .select()
            .single();

        if (error) {
            console.error('✗ Supabase insert error:', error.message);
            return res.status(500).json({ error: 'Failed to submit contact form' });
        }

        console.log('✓ Contact form submitted:', contact.email);
        
        res.json({ 
            success: true, 
            message: 'Message received! We will contact you shortly.' 
        });
    } catch (error) {
        console.error('✗ Error submitting contact form:', error.message);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// GET: Fetch all contacts (admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const { data: contacts, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Supabase fetch error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch contacts' });
        }

        res.json(contacts);
    } catch (error) {
        console.error('✗ Error fetching contacts:', error.message);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// PUT: Update contact status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status value
        if (status && !['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const { data: contact, error } = await supabase
            .from('contacts')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact updated', contact });
    } catch (error) {
        console.error('✗ Error updating contact:', error.message);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// DELETE: Remove contact (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: contact, error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        console.error('✗ Error deleting contact:', error.message);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

module.exports = router;