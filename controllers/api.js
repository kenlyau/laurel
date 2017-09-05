const WechatBot = require('../services/wechat/')
const webot = new WechatBot

module.exports.sendMsg = async function(req, res) {
  var userName = webot.getUserNameByNickName(req.body.userName)
  if (!userName){
    res.json({error: true, msg: 'user not found'})
    return
  }
  var response = await webot.sendMsgText(userName, req.body.message)
  res.json(response.data)
}
