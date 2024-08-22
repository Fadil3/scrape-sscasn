function generateCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {})

  return `${prefix}:${JSON.stringify(sortedParams)}`
}

module.exports = generateCacheKey
