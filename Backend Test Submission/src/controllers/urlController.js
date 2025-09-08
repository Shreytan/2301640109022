const urlModel = require('../models/urlModel');
const clickModel = require('../models/clickModel');
const shortenerService = require('../utils/shortener');
const config = require('../config/config');
const logger = require('../utils/logger');

class UrlController {
    async createShortUrl(req, res) {
        try {
            const { url, validity = config.defaultValidity, shortcode } = req.body;
            
            logger.info('backend', 'controller', `Creating short URL for: ${url}`);

            // Generate or use custom shortcode
            let finalShortCode = shortcode;
            
            if (shortcode) {
                // Check if custom shortcode already exists
                const exists = await urlModel.checkShortCodeExists(shortcode);
                if (exists) {
                    logger.warn('backend', 'controller', `Shortcode collision: ${shortcode}`);
                    return res.status(409).json({
                        error: 'Shortcode already exists',
                        message: 'Please choose a different shortcode'
                    });
                }
            } else {
                // Generate unique shortcode
                do {
                    finalShortCode = shortenerService.generateShortCode();
                } while (await urlModel.checkShortCodeExists(finalShortCode));
            }

            // Calculate expiry time
            const expiresAt = shortenerService.calculateExpiry(validity);

            // Create URL record
            const result = await urlModel.create(url, finalShortCode, expiresAt);

            const shortLink = `${config.baseUrl}/${finalShortCode}`;
            
            logger.info('backend', 'controller', `Short URL created: ${shortLink}`);

            res.status(201).json({
                shortLink,
                expiry: expiresAt
            });

        } catch (error) {
            logger.error('backend', 'controller', `Error creating short URL: ${error.message}`);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to create short URL'
            });
        }
    }

    async redirectToOriginal(req, res) {
        try {
            const { shortcode } = req.params;
            
            logger.debug('backend', 'controller', `Redirect request for: ${shortcode}`);

            // Find URL by shortcode
            const urlRecord = await urlModel.findByShortCode(shortcode);

            if (!urlRecord) {
                logger.warn('backend', 'controller', `Short URL not found: ${shortcode}`);
                return res.status(404).json({
                    error: 'URL not found',
                    message: 'This short URL does not exist or has expired'
                });
            }

            // Record click analytics
            const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
            const userAgent = req.get('User-Agent') || 'Unknown';
            const referrer = req.get('Referer') || 'Direct';
            const location = shortenerService.extractLocationFromIP(ipAddress);

            // Async operations for analytics
            Promise.all([
                urlModel.incrementClickCount(urlRecord.id),
                clickModel.create(urlRecord.id, ipAddress, userAgent, referrer, location)
            ]).catch(err => {
                logger.error('backend', 'controller', `Analytics recording failed: ${err.message}`);
            });

            logger.info('backend', 'controller', `Redirecting ${shortcode} to ${urlRecord.original_url}`);

            // Redirect to original URL
            res.redirect(301, urlRecord.original_url);

        } catch (error) {
            logger.error('backend', 'controller', `Error during redirect: ${error.message}`);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to process redirect'
            });
        }
    }

    async getStatistics(req, res) {
        try {
            logger.info('backend', 'controller', 'Fetching URL statistics');

            const urls = await urlModel.getAllUrls();
            
            // Get detailed click data for each URL
            const urlsWithClicks = await Promise.all(
                urls.map(async (url) => {
                    const clicks = await clickModel.getClicksByUrlId(url.id);
                    return {
                        ...url,
                        shortLink: `${config.baseUrl}/${url.short_code}`,
                        clicks: clicks.map(click => ({
                            timestamp: click.clicked_at,
                            source: click.referrer,
                            location: click.location,
                            userAgent: click.user_agent
                        }))
                    };
                })
            );

            res.json({
                total: urlsWithClicks.length,
                urls: urlsWithClicks
            });

        } catch (error) {
            logger.error('backend', 'controller', `Error fetching statistics: ${error.message}`);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch statistics'
            });
        }
    }
}

module.exports = new UrlController();
