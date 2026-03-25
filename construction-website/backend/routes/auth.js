const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        
        
        const bcrypt = require('bcrypt');
const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            token,
            user: { 
                id: user._id,
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

