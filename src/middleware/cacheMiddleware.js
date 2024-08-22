const NodeCache = require('node-cache')
const generateCacheKey = require('../utils/cacheGenerator')

const cache = new NodeCache()

function cacheMiddleware(duration, prefix = 'api') {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = generateCacheKey(prefix, { ...req.query, ...req.params })
    const cachedResponse = cache.get(cacheKey)

    if (cachedResponse) {
      return res.json(cachedResponse)
    } else {
      res.originalJson = res.json
      res.json = (body) => {
        res.originalJson(body)
        cache.set(cacheKey, body, duration)
      }
      next()
    }
  }
}

function clearCache(prefix, params = {}) {
  const cacheKey = generateCacheKey(prefix, params)
  cache.del(cacheKey)
}

function clearAllCache() {
  cache.flushAll()
}

module.exports = { cacheMiddleware, clearCache, clearAllCache }
