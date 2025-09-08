const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { validateCreateUrlRequest } = require('../utils/validators');
const logger = require('../utils/logger');

// Middleware to log all requests
router.use((req, res, next) => {
    logger.debug('backend', 'route', `${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Create short URL
router.post('/shorturls', validateCreateUrlRequest, urlController.createShortUrl);

// Get statistics
router.get('/api/statistics', urlController.getStatistics);

// Redirect short URL (this should be last to catch all remaining routes)
router.get('/:shortcode', urlController.redirectToOriginal);

module.exports = router;
