const shortid = require('shortid');
const logger = require('./logger');

class ShortenerService {
    generateShortCode() {
        // Generate a custom short code
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    validateCustomCode(code) {
        // Validate custom shortcode format
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        
        if (!code || code.length < 3 || code.length > 20) {
            return { valid: false, message: 'Shortcode must be 3-20 characters long' };
        }

        if (!alphanumericRegex.test(code)) {
            return { valid: false, message: 'Shortcode must be alphanumeric only' };
        }

        return { valid: true };
    }

    validateUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    calculateExpiry(validityMinutes) {
        const now = new Date();
        const expiryTime = new Date(now.getTime() + (validityMinutes * 60 * 1000));
        return expiryTime.toISOString();
    }

    extractLocationFromIP(ipAddress) {
        // Simple location extraction (in real app, use GeoIP service)
        if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
            return 'Local';
        }
        
        // Mock location based on IP ranges (for demonstration)
        const ipNum = parseInt(ipAddress.split('.')[0]);
        if (ipNum >= 1 && ipNum <= 50) return 'North America';
        if (ipNum >= 51 && ipNum <= 100) return 'Europe';
        if (ipNum >= 101 && ipNum <= 150) return 'Asia';
        if (ipNum >= 151 && ipNum <= 200) return 'South America';
        return 'Unknown';
    }
}

module.exports = new ShortenerService();
