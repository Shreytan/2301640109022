require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    databasePath: process.env.DATABASE_PATH || './database/urls.db',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    defaultValidity: 30, // minutes
    baseUrl: `http://localhost:${process.env.PORT || 3001}`
};
