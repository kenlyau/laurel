const WechatCore = require('./core.js')
const {getClientMsgId, post} = require('./util')
var instance = null
module.exports = class WechatApi extends WechatCore {
  constructor() {
    if (instance){
      return instance
    }
    super()
    instance = this
  }
  getUUID() {
    return this.props.uuid
  }

  getUserByNikeName(nikeName) {
    this.contacts.filter(user => user.NikeName === nikeName)[0]
  }
  
  getUserNameByNikeName(nikeName) {
    var user = this.getUserByNikeName(nik)
    if (!user){
      return false
    }
    return user.UserName
  }

  sendMsgText(to, content) {
    var params = {
      'pass_ticket': this.props.passTicket,
      'lang': 'zh_CN'
    }
    var clientMsgId = getClientMsgId()
    var data = {
      'BaseRequest': this._getBaseRequest(),
      'Scene': 0,
      'Msg': {
        'Type': this.conf.MSG_TYPE_TEXT,
        'Content': content,
        'FromUserName': this.user.UserName,
        'ToUserName': to,
        'LocalID': clientMsgId,
        'ClientMsgId': clientMsgId
      }
    }
    return post(this.conf.API_SEND_TEXT, params, data)
  }

  sendMsgEmoticon(to, id) {
    var params = {
      'fun': 'sys',
      'pass_ticket': this.props.passTicket,
      'lang': 'zh_CN'
    }
    var clientMsgId = getClientMsgId()
    var data = {
      'BaseRequest': this._getBaseRequest(),
      'Scene': 0,
      'Msg': {
        'Type': this.conf.MSG_TYPE_EMOTICON,
        'EmojiFlag': 2,
        'FromUserName': this.user.UserName,
        'ToUserName': to,
        'LocalID': clientMsgId,
        'ClientMsgId': clientMsgId
      }
    }
    
    if (id.indexOf('@') === 0) {
      data.Msg.MediaId = id
    } else {
      data.Msg.EMoticonMd5 = id
    }

    return post(this.conf.API_SEND_EMOTICON, params, data)
  }

  uploadMedia(to, file, filename) {
    var name,
        type,
        size,
        ext,
        mediatype,
        data;
    name = file.name || 'file'
    type = file.type
    size = file.size
    data = file
  }


}