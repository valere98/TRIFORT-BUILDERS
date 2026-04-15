const express = require('express');
const router = express.Router();
const Subcontractor = require('../models/Subcontractor');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSubcontractorForm, sanitizeObject } = require('../utils/validators');

// POST: Submit subcontractor application (public endpoint)
router.post('/submit', async (req, res) => {
    try {
        // Map form field names (handle both hyphenated and camelCase)
        const { 'company-name': companyName, 'contact-name': contactName, 'service-area': serviceArea, ...rest } = req.body;
        const company = companyName || rest.company;
        const contact = contactName || rest.contact;
        const serviceAreaValue = serviceArea || rest.serviceArea;

        const formData = {
            company,
            contact,
            email: rest.email,
            phone: rest.phone,
            trade: rest.trade,
            experience: rest.experience,
            serviceArea: serviceAreaValue,
            message: rest.message
        };

        // Validate form data
        const validation = validateSubcontractorForm(formData);
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            formData,
            ['company', 'contact', 'trade', 'experience', 'serviceArea', 'message']
        );

        // Create subcontractor record
        const submission = new Subcontractor({
            company: sanitized.company,
            contact: sanitized.contact,
            email: sanitized.email.toLowerCase(),
            phone: sanitized.phone || '',
            trade: sanitized.trade,
            experience: sanitized.experience || '',
            serviceArea: sanitized.serviceArea || '',
            message: sanitized.message || '',
            status: 'pending'
        });

        await submission.save();
        console.log('✓ Subcontractor application submitted:', submission.email);
        
        res.json({ 
            success: true, 
            message: 'Application received! We will review and contact you shortly.' 
        });
    } catch (error) {
        console.error('✗ Error submitting subcontractor application:', error.message);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});

// GET: Fetch all applications (admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const submissions = await Subcontractor.find().sort({ created_at: -1 });
        res.json(submissions);
    } catch (error) {
        console.error('✗ Error fetching applications:', error.message);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// PUT: Update application status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status value
        if (status && !['pending', 'reviewing', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const submission = await Subcontractor.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!submission) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        
        res.json({ success: true, message: 'Status updated.', submission });
    } catch (error) {
        console.error('✗ Error updating application:', error.message);
        res.status(500).json({ error: 'Failed to update application.' });
    }
});

// DELETE: Remove application (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Subcontractor.findByIdAndDelete(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        
        res.json({ success: true, message: 'Application deleted.' });
    } catch (error) {
        console.error('✗ Error deleting application:', error.message);
        res.status(500).json({ error: 'Failed to delete application.' });
    }
});

module.exports = router;