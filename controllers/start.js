const Wbot = require('../services/wechat/')
module.exports = async function(req, res) {
  var wbot = new Wbot
  var code = await wbot.getCode()
  var img = `https://login.weixin.qq.com/qrcode/${code}`
  res.end(`<!doctype html><html><head></head><body><img src="${img}"></body></html>`)
}
