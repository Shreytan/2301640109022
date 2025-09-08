const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(config.databasePath, (err) => {
                if (err) {
                    logger.fatal('backend', 'db', `Database connection failed: ${err.message}`);
                    reject(err);
                } else {
                    logger.info('backend', 'db', 'Database connected successfully');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createUrlsTable = `
                CREATE TABLE IF NOT EXISTS urls (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_url TEXT NOT NULL,
                    short_code TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    click_count INTEGER DEFAULT 0
                )
            `;

            const createClicksTable = `
                CREATE TABLE IF NOT EXISTS clicks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url_id INTEGER,
                    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    user_agent TEXT,
                    referrer TEXT,
                    location TEXT,
                    FOREIGN KEY (url_id) REFERENCES urls (id)
                )
            `;

            this.db.run(createUrlsTable, (err) => {
                if (err) {
                    logger.error('backend', 'db', `Failed to create urls table: ${err.message}`);
                    reject(err);
                    return;
                }

                this.db.run(createClicksTable, (err) => {
                    if (err) {
                        logger.error('backend', 'db', `Failed to create clicks table: ${err.message}`);
                        reject(err);
                    } else {
                        logger.info('backend', 'db', 'Database tables created successfully');
                        resolve();
                    }
                });
            });
        });
    }

    getDatabase() {
        return this.db;
    }
}

module.exports = new Database();
