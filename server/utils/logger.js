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
        new winston.transports.File({ 
            filename: 'logs/dashboard-error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/dashboard.log' 
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;