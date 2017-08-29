const express = require('express')
const router = express.Router()
const startCtrl = require('./controllers/start')
const dashboardCtrl = require('./controllers/dashboard')

router.get('/', startCtrl)
router.get('/friend', function(req, res){
  var WBot = require('./services/wechat')
  var wbot = new WBot
  var friend = wbot.getContactList()
  res.json(friend)
})
router.get('/dashboard', dashboardCtrl.index)

module.exports = router
