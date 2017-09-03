const WechatBot = require('../services/wechat/')
const webot = new WechatBot()

module.exports = async function(req, res) {
  var code = webot.getUUID()
  var img = `https://login.weixin.qq.com/qrcode/${code}`
  res.end(`<!doctype html><html><head></head><body><img src="${img}"></body></html>`)
}
