const logger = require('./logger');

async function testLogging() {
    console.log('Testing logging middleware...');
    
    try {
        // Test different log levels
        await logger.info('backend', 'service', 'Application started successfully');
        await logger.error('backend', 'db', 'Connection timeout occurred');
        await logger.debug('frontend', 'component', 'Component rendered successfully');
        
        console.log('Logging tests completed');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testLogging();
