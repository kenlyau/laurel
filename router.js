const express = require('express')
const router = express.Router()
const startCtrl = require('./controllers/start')
const dashboardCtrl = require('./controllers/dashboard')

router.get('/', startCtrl)

router.get('/dashboard', dashboardCtrl.index)

module.exports = router
