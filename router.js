const express = require('express')
const router = express.Router()
const startCtrl = require('./controllers/start')
const dashboardCtrl = require('./controllers/dashboard')

router.get('/', startCtrl)
router.get('/friend', function(req, res){
  var WeBot = require('./services/wechat')
  var webot = new WeBot
  var friend = webot.getContacts()
  res.json(friend)
})
router.get('/dashboard', dashboardCtrl.index)

module.exports = router
