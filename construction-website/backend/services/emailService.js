/**
 * Email Service - Send notifications via Nodemailer
 * Supports Gmail, SendGrid, or custom SMTP
 */

const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialize email transporter
 * Supports: Gmail OAuth2, SendGrid API, SMTP
 */
const initializeTransporter = async () => {
    if (transporter) return transporter;

    // Check which email service is configured
    if (process.env.EMAIL_SERVICE === 'gmail') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD // Use app-specific password
            }
        });
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        const sgTransport = require('nodemailer-sendgrid-transport');
        transporter = nodemailer.createTransport(sgTransport({
            auth: {
                api_key: process.env.SENDGRID_API_KEY
            }
        }));
    } else if (process.env.EMAIL_SERVICE === 'smtp') {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        console.warn('⚠️  No email service configured. Set EMAIL_SERVICE in .env');
        return null;
    }

    // Verify connection
    try {
        await transporter.verify();
        console.log('✓ Email transporter verified successfully');
    } catch (error) {
        console.error('✗ Email transporter error:', error.message);
        transporter = null;
    }

    return transporter;
};

/**
 * Send contact form confirmation to user
 */
const sendContactConfirmation = async (email, name, subject) => {
    if (!transporter) return false;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@trifort.co.ke',
            to: email,
            subject: `We received your message: ${subject}`,
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for reaching out to TRI-FORT CONSTRUCTION.</p>
                <p>We have received your message about: <strong>${subject}</strong></p>
                <p>Our team will review your inquiry and contact you within one business day.</p>
                <p>Best regards,<br>TRI-FORT CONSTRUCTION TEAM</p>
            `
        });
        console.log('✓ Contact confirmation sent to:', email);
        return true;
    } catch (error) {
        console.error('✗ Failed to send contact confirmation:', error.message);
        return false;
    }
};

/**
 * Send contact form notification to admin
 */
const sendContactNotificationToAdmin = async (contact) => {
    if (!transporter) return false;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@trifort.co.ke',
            to: process.env.ADMIN_EMAIL || 'info@trifort.co.ke',
            subject: `New Contact Form Submission: ${contact.subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
                <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p><strong>Message:</strong></p>
                <blockquote>${contact.message.replace(/\n/g, '<br>')}</blockquote>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            `
        });
        console.log('✓ Contact notification sent to admin');
        return true;
    } catch (error) {
        console.error('✗ Failed to send contact notification to admin:', error.message);
        return false;
    }
};

/**
 * Send quote request confirmation to user
 */
const sendQuoteConfirmation = async (email, name, projectType) => {
    if (!transporter) return false;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@trifort.co.ke',
            to: email,
            subject: 'Your TRI-FORT Quote Request Received',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for submitting a quote request for a <strong>${projectType}</strong> project.</p>
                <p>We have received your project details and our team will prepare a tailored proposal for you.</p>
                <p>You can expect to hear from us within 2-3 business days.</p>
                <p>Best regards,<br>TRI-FORT CONSTRUCTION TEAM</p>
            `
        });
        console.log('✓ Quote confirmation sent to:', email);
        return true;
    } catch (error) {
        console.error('✗ Failed to send quote confirmation:', error.message);
        return false;
    }
};

/**
 * Send quote request notification to admin
 */
const sendQuoteNotificationToAdmin = async (quote) => {
    if (!transporter) return false;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@trifort.co.ke',
            to: process.env.ADMIN_EMAIL || 'projects@trifort.co.ke',
            subject: `New Quote Request: ${quote.project_type}`,
            html: `
                <h3>New Quote Request</h3>
                <p><strong>Name:</strong> ${quote.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${quote.email}">${quote.email}</a></p>
                <p><strong>Phone:</strong> ${quote.phone || 'Not provided'}</p>
                <p><strong>Project Type:</strong> ${quote.project_type}</p>
                <p><strong>Details:</strong></p>
                <blockquote>${quote.details.replace(/\n/g, '<br>')}</blockquote>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            `
        });
        console.log('✓ Quote notification sent to admin');
        return true;
    } catch (error) {
        console.error('✗ Failed to send quote notification to admin:', error.message);
        return false;
    }
};

/**
 * Send review submission confirmation
 */
const sendReviewConfirmation = async (email, name) => {
    if (!transporter) return false;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@trifort.co.ke',
            to: email,
            subject: 'Thank you for your review',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for taking the time to share your experience with TRI-FORT CONSTRUCTION.</p>
                <p>Your review has been received and will be published after moderation.</p>
                <p>We appreciate your feedback!</p>
                <p>Best regards,<br>TRI-FORT CONSTRUCTION TEAM</p>
            `
        });
        console.log('✓ Review confirmation sent to:', email);
        return true;
    } catch (error) {
        console.error('✗ Failed to send review confirmation:', error.message);
        return false;
    }
};

module.exports = {
    initializeTransporter,
    sendContactConfirmation,
    sendContactNotificationToAdmin,
    sendQuoteConfirmation,
    sendQuoteNotificationToAdmin,
    sendReviewConfirmation
};
