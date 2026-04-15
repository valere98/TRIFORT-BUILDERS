const jwt = require('jsonwebtoken');

/**
 * Middleware to verify admin/editor role
 * Checks JWT token and ensures user has 'admin' or 'editor' role
 * Called in addition to authMiddleware for protected admin routes
 */
module.exports = function(req, res, next) {
    try {
        // Extract token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user has admin or editor role
        if (decoded.role !== 'admin' && decoded.role !== 'editor') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        // Attach user info to request for use in route handlers
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
