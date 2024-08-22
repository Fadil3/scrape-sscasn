const express = require('express')
const router = express.Router()
const formasiServices = require('../services/formasiServices')

router.get('/', formasiServices.getAllFormasi)
router.get('/:id', formasiServices.getFormasiById)

module.exports = router
