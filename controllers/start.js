const WeBot = require('../services/wechat/')
module.exports = async function(req, res) {
  var webot = new WeBot
  var code = await webot.getCode()
  var img = `https://login.weixin.qq.com/qrcode/${code}`
  res.end(`<!doctype html><html><head></head><body><img src="${img}"></body></html>`)
}
