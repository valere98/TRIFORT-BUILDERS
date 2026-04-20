const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const supabase = require('../config/supabase'); // ← replace User model

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Find user by email in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Compare password with stored hash
        const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            token,
            user: { 
                id: user.id,       // ← was user._id (MongoDB), now user.id
                email: user.email, 
                name: user.name,
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, message: 'Token valid', user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.get('/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;