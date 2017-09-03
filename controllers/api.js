const WechatBot = require('../services/wechat/')
const webot = new WechatBot

module.exports.sendMsg = async function(req, res) {
  console.log(req.body)
  var response = await webot.sendMsgText(req.body.userName, req.body.message)
  res.json(response.data)
}