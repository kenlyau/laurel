const express = require('express')
const router = express.Router()
const startCtrl = require('./controllers/start')
const dashboardCtrl = require('./controllers/dashboard')
const apiCtrl = require('./controllers/api')

router.get('/', startCtrl)

router.get('/dashboard', dashboardCtrl.index)

router.post('/api/message', apiCtrl.sendMsg)


module.exports = router
