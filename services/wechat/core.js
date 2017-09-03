const debug = require('debug')('wecaht')
const Store = require('./store')
const conf = require('./conf')
const {
  getPgv,
  getDeviceID,
  getClientMsgId,
  get,
  post,
  isContact,
  isOfficial,
  isBrand
} = require('./util')

module.exports = class WechatCore {
  constructor() {
    this.props = {}
    this.handlers = {}
    this.conf = conf.getCONF()
    this.deviceId = getDeviceID()
    debug('initialize wechat core')
    this._getUUID()
  }
  on(type, handler) {
    if (!this.handlers[type]) {
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
  }
  emit(type, arg) {
    if (this.handlers[type]){
      var handlers = this.handlers[type]
        for (var i = 0, len = handlers.length; i < len; i++) {
          handlers[i](arg)
        }
    }
  }
  _getBaseRequest() {
    return {
      'Uin': this.props.wxuin,
      'Sid': this.props.wxsid,
      'Skey': this.props.skey,
      'DeviceID': this.deviceId
    }
  }
  async _getUUID() {
    var response = await get(this.conf.API_LOGIN,{
      'appid': 'wx782c26e4c19acffb',
      'redirect_uri': 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage',
      'fun': 'new',
      'lang': 'en_US',
      'r': Date.now()
    })
    var uuid = response.data.match(/[A-Za-z_\-\d]{10}==/)[0]
    this.props.uuid = uuid
    debug('get uuid is ok')
    this._checkLogin()
  }
  async _checkLogin() {
    if (this.auth) {
      return
    }
    var response = await get(this.conf.API_LOGIN_CHECK, {
      loginicon: true,
      uuid: this.props.uuid,
      tip: 0,
      r: Date.now()
    })
    var window = {}
    eval(response.data)
    if (window.code != 200) {
      setTimeout(() => this._checkLogin(), 1000)
      return
    }
    debug('check login sucess')
    this.auth = true
    this._login(window.redirect_uri)
  }
  async _login(redirectURI) {
    var baseURL = this.baseURL = redirectURI.match(/^https:\/\/(.*?)\//)[0]
    this.conf = conf.getCONF(baseURL)
    var response = await get(redirectURI, {
        fun: 'new',
        version: 'v2'
    })
    this.props.skey = response.data.match(/<skey>(.*)<\/skey>/)[1]
    this.props.wxsid = response.data.match(/<wxsid>(.*)<\/wxsid>/)[1]
    this.props.wxuin = response.data.match(/<wxuin>(.*)<\/wxuin>/)[1]
    this.props.passTicket = response.data.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]

    response.headers['set-cookie'].forEach(item => {
      if (/webwx.*?data.*?ticket/i.test(item)){
        this.props.webwxDataTicket = item.match(/=(.*?);/)[1]
      }else if (/wxuin/i.test(item)){
        this.props.wxuin = item.match(/=(.*?);/)[1]
      }else if (/wxsid/i.test(item)){
        this.props.wxsid = item.match(/=(.*?);/)[1]
      }
    })
    
    debug('login success!')
    this._init()
  }

  async _init() {
    var response = await post(this.conf.API_INIT, {r: Date.now}, {
      'BaseRequest': this._getBaseRequest()
    })
    this.user = response.data.User
    debug('user info =>', this.user)
    this._heartbeat()
    this._updateSyncKey(response.data)
    this._checkSync()
    this.getContacts()
  }

  async _heartbeat() {
    var msg = '心跳检测' + (new Date()).toLocaleString()
    var clientMsgId = getClientMsgId()
    var to = this.conf.NPC_HEARTBEAT
    var from = this.user.UserName
    var response = await post(this.conf.API_SEND_TEXT, {
        'pass_ticket': this.props.passTicket,
        'lang': 'zh_CN'
    }, {
      'BaseRequest': this._getBaseRequest(),
      'Scene': 0,
      'Msg': {
        'Type': 1,
        'Content': msg,
        'FromUserName': from,
        'ToUserName': to,
        'LocalID': clientMsgId,
        'ClientMsgId': clientMsgId
      }
    })
    debug('heartbeat check =>', response.data)
    setTimeout(() => this._heartbeat(), 180000)
  }

  async _checkSync() {
    var response = await get(this.conf.API_SYNC_CHECK, {
      'r': Date.now(),
      'sid': this.props.wxsid,
      'uin': this.props.wxuin,
      'skey': this.props.skey,
      'deviceid': this.deviceId,
      'synckey': this.props.synckey
    })
    var window = {
      synccheck: {}
    }

    try {
      eval(response.data)
      var selector = window.synccheck.selector
      debug('check sync selector =>', selector)
    } catch(e) {
      window.synccheck = {retcode: '0', selector: '0'}
    }
    
    if (selector > 0) {
      this._sync()
    }

    setTimeout(() => this._checkSync(), 30000)

  }

  async _sync() {
    var response = await post(this.conf.API_SYNC, {
      'sid': this.props.wxsid,
      'skey': this.props.skey,
      'pass_ticket': this.props.passTicket,
      'r': Date.now()
    }, {
      'BaseRequest': this._getBaseRequest(),
      'SyncKey': this.props.originSynckey,
      'rr': Date.now()
    })
    this._updateSyncKey(response.data)
    this.props.skey = response.data.SKey || this.props.skey
    this.lastSyncTime = Date.now()
    this.emit('messages', response.data.AddMsgList)
    debug('sync success messages =>', response.data)
  }

  async _updateSyncKey(data) {
    if (data.SyncKey){
      this.props.originSynckey = data.SyncKey
    }
    if (data.SyncCheckKey) {
      var synckeyList = []
      for (let e = data.SyncCheckKey.List, i = 0, n = e.length; i < n; i ++){
        synckeyList.push(e[i]['Key'] + '_' + e[i]['Val'])
      }
      this.props.synckey = synckeyList.join('|')
    } else if(!this.props.synckey && data.SyncKey) {
      var synckeyList = []
      for (let e = data.SyncKey.List, i = 0, n = e.length; i < n; i ++) {
        synckeyList.push(e[i]['Key'] + '_' + e[i]['Val'])
      }
      this.props.synckey = synckeyList.join('|')
    }
    debug('update synckey') 
  }

  async getContacts(seq = 0) {
    var params = {
      'pass_ticket': this.props.passTicket,
      'seq': seq,
      'skey': this.props.skey,
      'lang': 'zh_CN',
      'r': Date.now()
    }
    var data = {
      'BaseRequest': this._getBaseRequest()
    }
    var response = await post(this.conf.API_GET_CONTACTS, params, data)
    var contacts = response.data.MemberList.filter(user => {
      return isContact(user) && !isOfficial(user) && !isBrand(user)
    })
    contacts.forEach(user => {
      user.HeadImgUrl = this.baseURL + user.HeadImgUrl.substr(1)
    })
    this.contacts = contacts
    debug('update contacts success')
  }

}