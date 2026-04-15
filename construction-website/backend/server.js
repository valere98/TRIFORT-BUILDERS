require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const quoteRoutes = require('./routes/quote');
const subcontractorRoutes = require('./routes/subcontractor');

const app = express();

// Validate environment variables on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
    console.error('✗ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 2
}).then(() => {
    console.log('✓ MongoDB connected successfully');
}).catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/subcontractor', subcontractorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server running', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Catch-all for serving index.html for client-side routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// 404 handler (must come before error handler)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('✗ Error:', {
        message: err.message,
        status: err.status || 500,
        path: req.path,
        method: req.method
    });

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }

    // Default error response
    res.status(err.status || 500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Server error' 
            : err.message || 'Server error',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Serving static files from: ${path.join(__dirname, '../../')}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

