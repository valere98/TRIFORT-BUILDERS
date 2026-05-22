/**
 * CAPTCHA Verification Middleware
 * Supports reCAPTCHA v3 (invisible, recommended)
 */

const axios = require('axios');

/**
 * Verify reCAPTCHA v3 token
 * reCAPTCHA v3 is invisible - returns score 0.0 to 1.0
 * Score closer to 1.0 = likely human, closer to 0.0 = likely bot
 */
const verifyCaptcha = async (req, res, next) => {
    try {
        const { captchaToken } = req.body;

        // If CAPTCHA is not configured, skip verification (allow requests)
        if (!process.env.RECAPTCHA_SECRET_KEY) {
            console.warn('⚠️  RECAPTCHA_SECRET_KEY not configured. Skipping CAPTCHA verification.');
            return next();
        }

        if (!captchaToken) {
            return res.status(400).json({ 
                error: 'CAPTCHA token required',
                captchaRequired: true
            });
        }

        // Verify token with Google reCAPTCHA v3
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken
                }
            }
        );

        const { success, score, action } = response.data;

        // reCAPTCHA v3 returns a score (0.0 to 1.0)
        // Lower score = more likely to be bot
        const minScore = process.env.RECAPTCHA_MIN_SCORE || 0.5;

        if (!success || score < minScore) {
            console.warn(`⚠️  CAPTCHA verification failed: success=${success}, score=${score}`);
            return res.status(400).json({ 
                error: 'CAPTCHA verification failed. Please try again.',
                captchaFailed: true
            });
        }

        console.log(`✓ CAPTCHA verified: action=${action}, score=${score}`);
        next();
    } catch (error) {
        console.error('✗ CAPTCHA verification error:', error.message);
        // Don't block the request if CAPTCHA service fails
        // Allow the request to proceed (fail open, not closed)
        console.warn('⚠️  Allowing request despite CAPTCHA error (service may be down)');
        next();
    }
};

module.exports = verifyCaptcha;
