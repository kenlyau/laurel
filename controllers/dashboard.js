const WechatBot = require('../services/wechat')
var webot = new WechatBot

module.exports.index = async function(req, res) {
  var data = {
    'title': 'dashboard',
    'baseURL': webot.baseURL,
    'contacts': webot.contacts
  }
  res.render('dashboard', data)
}
