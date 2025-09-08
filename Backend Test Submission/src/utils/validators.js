const validator = require('validator');

const validateCreateUrlRequest = (req, res, next) => {
    const { url, validity, shortcode } = req.body;
    const errors = [];

    // Validate URL
    if (!url) {
        errors.push('URL is required');
    } else if (!validator.isURL(url)) {
        errors.push('Invalid URL format');
    }

    // Validate validity (optional)
    if (validity !== undefined) {
        if (!Number.isInteger(validity) || validity < 1) {
            errors.push('Validity must be a positive integer');
        }
    }

    // Validate shortcode (optional)
    if (shortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(shortcode)) {
            errors.push('Shortcode must be alphanumeric');
        }
        if (shortcode.length < 3 || shortcode.length > 20) {
            errors.push('Shortcode must be 3-20 characters long');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors 
        });
    }

    next();
};

module.exports = {
    validateCreateUrlRequest
};
