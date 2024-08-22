const express = require('express')
const router = express.Router()
const formasiController = require('../controller/formasiController')
const { THREE_HOURS_IN_SECONDS } = require('../constant/constant')
const { cacheMiddleware } = require('../middleware/cacheMiddleware')
cacheMiddleware

router.get(
  '/',
  cacheMiddleware(THREE_HOURS_IN_SECONDS, 'formasi:list'),
  formasiController.getAllFormasi
)

router.get(
  '/:id',
  cacheMiddleware(THREE_HOURS_IN_SECONDS, 'formasi:detail'),
  formasiController.getFormasiById
)

module.exports = router
