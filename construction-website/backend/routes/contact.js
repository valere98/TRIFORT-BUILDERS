const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }
        
        const contact = new Contact({
            name,
            email,
            subject: subject || 'No subject',
            message,
            phone: phone || ''
        });
        
        await contact.save();
        console.log('Contact form submitted:', contact);
        
        res.json({ 
            success: true, 
            message: 'Message received! We will contact you shortly.' 
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});


router.get('/all', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ created_at: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});


router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact updated', contact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

module.exports = router;

