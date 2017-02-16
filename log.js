const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({ 'timestamp': true, colorize: true, level: 'debug' }),
    new winston.transports.File({ filename: './logs/scraper.log', level: 'error' })
  ]
});

module.exports = logger;
