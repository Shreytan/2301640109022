const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Rate limiting configuration
const createUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.'
    },
    onLimitReached: (req) => {
        logger.warn('backend', 'middleware', `Rate limit exceeded for IP: ${req.ip}`);
    }
});

const redirectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 redirects per minute per IP
    message: {
        error: 'Too many redirects',
        message: 'Please slow down your requests'
    }
});

// Security headers
const securityHeaders = helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        
        logger[logLevel]('backend', 'middleware', 
            `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
        );
    });
    
    next();
};

module.exports = {
    createUrlLimiter,
    redirectLimiter,
    securityHeaders,
    requestLogger
};
