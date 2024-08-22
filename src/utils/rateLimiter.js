const rateLimit = require('express-rate-limit')

module.exports = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
})
