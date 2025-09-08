const axios = require('axios');

class CustomLogger {
    constructor() {
        this.apiEndpoint = 'http://20.244.56.144/evaluation-service/logs';
        this.client = axios.create({
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async log(stack, level, packageName, message) {
        try {
            // Ensure all values are lowercase as required
            const logData = {
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: packageName.toLowerCase(),
                message: message
            };

            const response = await this.client.post(this.apiEndpoint, logData);
            
            // Return the log ID for reference
            return response.data.logID;
        } catch (error) {
            // Fallback logging in case of API failure
            console.error('Logging service error:', error.message);
            return null;
        }
    }

    // Convenience methods for different log levels
    debug(stack, packageName, message) {
        return this.log(stack, 'debug', packageName, message);
    }

    info(stack, packageName, message) {
        return this.log(stack, 'info', packageName, message);
    }

    warn(stack, packageName, message) {
        return this.log(stack, 'warn', packageName, message);
    }

    error(stack, packageName, message) {
        return this.log(stack, 'error', packageName, message);
    }

    fatal(stack, packageName, message) {
        return this.log(stack, 'fatal', packageName, message);
    }
}

// Export singleton instance
module.exports = new CustomLogger();
