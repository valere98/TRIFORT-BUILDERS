require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const supabase = require('./config/supabase');
const path = require('path');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const quoteRoutes = require('./routes/quote');
const reviewRoutes = require('./routes/reviews');
const subcontractorRoutes = require('./routes/subcontractor');
const rateLimit = require('./middleware/rateLimitMiddleware');
const verifyCaptcha = require('./middleware/captchaMiddleware');
const { initializeTransporter } = require('./services/emailService');

const app = express();

// Initialize email transporter on startup
initializeTransporter();

// Validate environment variables on startup
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
    console.error('✗ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Test Supabase connection on startup
async function testSupabaseConnection() {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
        console.error('✗ Supabase connection error:', error.message);
        process.exit(1);
    }
    console.log('✓ Supabase connected successfully');
}
testSupabaseConnection();

// CORS configuration - Allow Vercel frontend and localhost
const corsOptions = {
    origin: [
        'https://trifort-builders-x8nu.vercel.app',
        'https://trifort-builders.vercel.app',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
    connectSrc: ["'self'", "https://*.supabase.co"],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"]
  }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Public form endpoints with rate limiting (5 requests per 15 minutes) and CAPTCHA
app.use('/api/contact', rateLimit(15 * 60 * 1000, 5), verifyCaptcha, contactRoutes);
app.use('/api/quote', rateLimit(15 * 60 * 1000, 5), verifyCaptcha, quoteRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/api/subcontractor', rateLimit(15 * 60 * 1000, 5), verifyCaptcha, subcontractorRoutes);

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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('✗ Error:', {
        message: err.message,
        status: err.status || 500,
        path: req.path,
        method: req.method
    });

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }

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