const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const database = require('./config/database');
const urlRoutes = require('./routes/urlRoutes');
const logger = require('./utils/logger');
const { 
    securityHeaders, 
    requestLogger, 
    createUrlLimiter, 
    redirectLimiter 
} = require('./middleware/security');

class Application {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security headers
        this.app.use(securityHeaders);

        // CORS configuration
        this.app.use(cors({
            origin: config.frontendUrl,
            credentials: true
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Trust proxy (for accurate IP addresses)
        this.app.set('trust proxy', 1);

        // Request logging
        this.app.use(requestLogger);

        // Rate limiting for URL creation
        this.app.use('/shorturls', createUrlLimiter);
        
        // Rate limiting for redirects (applied to shortcode routes)
        this.app.use('/:shortcode', redirectLimiter);
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // Main routes
        this.app.use('/', urlRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            logger.warn('backend', 'route', `404 - Route not found: ${req.originalUrl}`);
            res.status(404).json({
                error: 'Route not found',
                message: 'The requested endpoint does not exist'
            });
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            logger.error('backend', 'handler', `Unhandled error: ${error.message}`);
            
            res.status(error.status || 500).json({
                error: 'Internal server error',
                message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
            });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.fatal('backend', 'handler', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.fatal('backend', 'handler', `Uncaught Exception: ${error.message}`);
            process.exit(1);
        });
    }

    async start() {
        try {
            // Initialize database
            await database.initialize();
            
            // Start server
            this.server = this.app.listen(config.port, () => {
                logger.info('backend', 'service', `Server running on port ${config.port}`);
                logger.info('backend', 'service', `Environment: ${config.nodeEnv}`);
            });

            return this.server;
        } catch (error) {
            logger.fatal('backend', 'service', `Failed to start server: ${error.message}`);
            process.exit(1);
        }
    }

    async stop() {
        if (this.server) {
            this.server.close(() => {
                logger.info('backend', 'service', 'Server stopped gracefully');
            });
        }
    }
}

module.exports = Application;
