const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const { validateReview, sanitizeObject } = require('../utils/validators');
const { sendReviewConfirmation } = require('../services/emailService');

// POST: Submit review (public endpoint)
router.post('/submit', async (req, res) => {
    try {
        const { name, email, rating, title, message, projectType } = req.body;
        
        // Validate form data
        const validation = validateReview({ name, email, rating, title, message });
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                errors: validation.errors 
            });
        }

        // Sanitize inputs
        const sanitized = sanitizeObject(
            { name, email, title, message, projectType },
            ['name', 'title', 'message', 'projectType']
        );

        // Insert review record into Supabase (status: pending for moderation)
        const { data: review, error } = await supabase
            .from('reviews')
            .insert([{
                name: sanitized.name,
                email: sanitized.email.toLowerCase(),
                rating: parseInt(rating) || 5,
                title: sanitized.title,
                message: sanitized.message,
                project_type: sanitized.projectType || '',
                status: 'pending',
                verified: false,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) {
            console.error('✗ Supabase insert error:', error.message);
            return res.status(500).json({ error: 'Failed to submit review' });
        }

        console.log('✓ Review submitted:', review.email);

        // Send confirmation email to user (non-blocking)
        sendReviewConfirmation(sanitized.email, sanitized.name)
            .catch(err => console.error('✗ Failed to send confirmation email:', err.message));
        
        res.json({ 
            success: true, 
            message: 'Review submitted! Thank you for your feedback. Your review will be published after verification.' 
        });
    } catch (error) {
        console.error('✗ Error submitting review:', error.message);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// GET: Fetch all published reviews (public endpoint)
router.get('/', async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('status', 'published') // Only show published reviews
            .eq('verified', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Supabase fetch error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch reviews' });
        }

        res.json(reviews);
    } catch (error) {
        console.error('✗ Error fetching reviews:', error.message);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// GET: Fetch all reviews including pending (admin only)
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Supabase fetch error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch reviews' });
        }

        res.json(reviews);
    } catch (error) {
        console.error('✗ Error fetching reviews:', error.message);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// PUT: Update review status and verification (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status, verified } = req.body;
        
        // Validate status value
        if (status && !['pending', 'published', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (verified !== undefined) updateData.verified = verified;

        const { data: review, error } = await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        console.log(`✓ Review ${req.params.id} updated: status=${status}, verified=${verified}`);
        res.json({ success: true, message: 'Review updated', review });
    } catch (error) {
        console.error('✗ Error updating review:', error.message);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// DELETE: Remove review (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: review, error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        console.log('✓ Review deleted:', req.params.id);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('✗ Error deleting review:', error.message);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
