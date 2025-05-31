const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'trading-bot-dashboard' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Add file transports
logger.add(new winston.transports.File({ 
    filename: 'logs/dashboard-error.log', 
    level: 'error' 
}));
logger.add(new winston.transports.File({ 
    filename: 'logs/dashboard.log' 
}));

module.exports = logger;