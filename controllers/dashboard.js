const Wbot = require('../services/wechat')
module.exports.index = function(req, res) {
  var wbot = new Wbot
  console.log(wbot)
  res.end('dashboard')
}
