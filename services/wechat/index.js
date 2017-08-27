const axios = require('axios')

var instance = null
module.exports = class {
  constructor() {
    this.code
    this.auth
    if (!instance) {
      instance = this
    }
    return instance
  }
  async getCode() {
    var url = 'https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=en_US&_=' + Date.now()
    var response = await axios.get(url)
    var code = response.data.match(/[A-Za-z_\-\d]{10}==/)[0]
    this.code = code
    this.checkCode()
    return code
  }
  async checkCode() {
    if (this.auth) {
      return
    }
    var url = 'https://login.web.wechat.com/cgi-bin/mmwebwx-bin/login'
    var response = await axios.get(url, {
      params: {
        loginicon: true,
        uuid: this.code,
        tip: 0,
        r: Date.now()
      }
    })

    var window
    eval(response.data)
    switch (window.code) {
      case 200:
        var authAddress = window.redirect_uri
        axios.default.baseURL = authAddress.match(/^https:\/\/(.*?)\//)[0]
        var authResponse = await axios.get(authAddress, {
          params: {
            fun: 'new',
            version: 'v2'
          }
        })
        var auth = {
          baseURL: axios.default.baseURL,
          skey: authResponse.data.match(/<skey>(.*?)<\/skey>/)[1],
          passTicket: authResponse.data.match(/<pass_ticket>(.*?)<\/pass_ticket>/)[1],
          wxsid: authResponse.data.match(/<wxsid>(.*?)<\/wxsid>/)[1],
          wxuin: authResponse.data.match(/<wxuin>(*.?)<\/wxuin>/)[1]
        }
        this.auth = auth
        this.initUser()
        break
      case 201:
        this.avatar = window.userAvatar
        console.log('111111111')
        this.checkCode()
        break
      case 400:
        tis.checkCode()
        break
      default:
        this.checkCode()  
    }

  }
  async initUser(){
    var response = await axios.post(`/cgi-bin/mmwebwx-bin/webwxinit?r=${-new Date()}&pass_ticket=${self.auth.passTicket}`, {
            BaseRequest: {
                Sid: this.auth.wxsid,
                Uin: this.auth.wxuin,
                Skey: this.auth.skey,
            }
        });

        await axios.post(`/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=en_US&pass_ticket=${self.auth.passTicket}`, {
            BaseRequest: {
                Sid: this.auth.wxsid,
                Uin: this.auth.wxuin,
                Skey: this.auth.skey,
            },
            ClientMsgId: +new Date(),
            Code: 3,
            FromUserName: response.data.User.UserName,
            ToUserName: response.data.User.UserName,
        });

        this.user = response.data;
        console.log(this.user)
  }
}
