/**
 * Rate Limiting Middleware
 * Prevents spam and DoS attacks on public endpoints
 * Tracks IP address and request count
 */

const requestCounts = new Map();

/**
 * Rate limit configuration
 * windowMs: Time window in milliseconds (15 minutes)
 * maxRequests: Max requests per IP in that window
 */
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, []);
        }

        const requests = requestCounts.get(ip);

        // Remove old requests outside the time window
        const recentRequests = requests.filter(time => now - time < windowMs);
        requestCounts.set(ip, recentRequests);

        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            console.warn(`⚠️  Rate limit exceeded for IP: ${ip}`);
            return res.status(429).json({ 
                error: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
            });
        }

        // Record this request
        recentRequests.push(now);
        requestCounts.set(ip, recentRequests);

        console.log(`✓ Request allowed for ${ip} (${recentRequests.length}/${maxRequests})`);
        next();
    };
};

/**
 * Cleanup old IP records periodically (every hour)
 * Prevents memory leak from accumulating old IPs
 */
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let cleaned = 0;

    for (const [ip, requests] of requestCounts.entries()) {
        const recentRequests = requests.filter(time => time > oneHourAgo);
        if (recentRequests.length === 0) {
            requestCounts.delete(ip);
            cleaned++;
        } else {
            requestCounts.set(ip, recentRequests);
        }
    }

    if (cleaned > 0) {
        console.log(`✓ Rate limiter cleanup: removed ${cleaned} old IP records`);
    }
}, 60 * 60 * 1000); // Run every hour

module.exports = rateLimit;
