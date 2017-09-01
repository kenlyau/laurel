const axios = require('axios')
const debug = require('debug')('wechat')

var instance = null
var getPgv = c => {
  return (c || '') + Math.round(2147483647 * (Math.random() || 0.5)) * (+new Date() % 1E10)
}
var getClientMsgId = () => {
  return (Date.now() + Math.random().toFixed(3)).replace('.', '')
}

var getDeviceID = () => {
  return 'e' + ('' + Math.random().toFixed(15)).substring(2, 17)
}
module.exports = class WeBot {
  constructor() {
    this.props = {}
    this.Cookie = {
      'pgv_pvi': getPgv(),
      'pgv_si': getPgv('s')
    }
    axios.interceptors.request.use(config => {
      config.headers['cookie'] = Object.keys(this.Cookie)
        .map(key => {
          return `${key}=${this.Cookie[key]}`
        }).join('; ')
        return config
    }, err => Promise.reject(err))
    axios.interceptors.response.use(res => {
      var setCookie = res.headers['set-cookie']
      if (setCookie){
        setCookie.forEach(item => {
          var pm = item.match(/^(.+?)\s?\=\s?(.+?);/)
          if (pm){
            this.Cookie[pm[1]] = pm[2]
          }
        })
      }
      return res
    }, err => {
      if (err && err.response){
        delete err.response.request
        delete err.response.config
      }
      return Promise.reject(err)
    })
    if (!instance){
      instance = this
    }
    
    return instance
  }
  async getCode() {
    var url = 'https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=en_US&_=' + Date.now()
    var response = await axios.get(url)
    var code = response.data.match(/[A-Za-z_\-\d]{10}==/)[0]
    this.props.code = code
    this._checkCode()
    return code
  }

  async _checkCode() {
    if (this.auth){
      return
    }
    var url = 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login'
    var response = await axios.get(url, {
      params: {
        loginicon: true,
        uuid: this.props.code,
        tip: 0,
        r: Date.now()
      }
    })
    var window = {}
    eval(response.data)
    if (window.code != 200) {
      this._checkCode()
      return
    }
    this._login(window.redirect_uri)
  }
  async _login(authAddress) {
    this.baseURL = authAddress.match(/^https:\/\/(.*?)\//)[0]
    this.baseDomain = authAddress.match(/^https:\/\/(.*?)\//)[1]
    var response = await axios.get(authAddress, {
      params: {
        fun: 'new',
        version: 'v2'
      }
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
    
    debug('wechat login success!')

    this._init()
  }

  async _init() {
    debug('wechat initialize data')
    this._initUser()
    this._heartbeat()
  }

  async _initUser(){
    var url = `${this.baseURL}cgi-bin/mmwebwx-bin/webwxinit?r=${-new Date()}&pass_ticket=${this.props.passTicket}`
    var response = await axios.post(url, {
      BaseRequest: {
        Sid: this.props.wxsid,
        Uin: this.props.wxuin,
        Skey: this.props.skey
      }
    })
    this.user = response.data.User
    debug('init user data')
  }

  _heartbeat() {
    setInterval(() => {
      var text = '心跳检测：' + new Date().toLocaleString()
      this.sendText(text, 'filehelper')
    }, 180000)
    debug('hearbeat check start')
  }

  async getContacts(seq = 0) {
    var url =`${this.baseURL}cgi-bin/mmwebwx-bin/webwxgetcontact`
    var response = await axios({
      method: 'POST',
      url: url,
      params: {
        'lang': 'zh_CN',
        'pass_ticket': this.props.passTicket,
        'seq': seq,
        'skey': this.props.skey,
        'r': Date.now()
      },
      data: {
        BaseRequest: {
          Sid: this.props.wxsid,
          Uin: this.props.wxuin,
          Skey: this.props.skey
        }
      }
    })
    console.log('getcontacts =>', response.data)
    return response.data;
  }

  async sendText(msg, to){
    var url = `${this.baseURL}cgi-bin/mmwebwx-bin/webwxsendmsg`
    var clientMsgId = getClientMsgId()
    var response = await axios({
      method: 'POST',
      url: url,
      params: {
        'pass_ticket': this.props.passTicket,
        'lang': 'zh_CN'
      },
      data: {
        BaseRequest: {
          Sid: this.props.wxsid,
          Uin: this.props.wxuin,
          Skey: this.props.skey
        },
        'Scene': 0,
        'Msg': {
          'Type': 1,
          'Content': msg,
          'FromUserName': this.user.UserName,
          'ToUserName': to,
          'LocalID': clientMsgId,
          'ClientMsgId': clientMsgId
        }
      }
    })
    debug('send text result =>', response.data)
  }
} 
