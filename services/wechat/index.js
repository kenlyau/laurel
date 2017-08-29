const tough = require('tough-cookie')
const rp = require('request-promise')


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
    var response = await rp(url)
    var code = response.match(/[A-Za-z_\-\d]{10}==/)[0]
    this.code = code
    this.checkCode()

    return code
  }
  async checkCode() {
    var _this = this
    if (this.auth) {
      return
    }
    
    var url = 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login'
    var response = await rp(url, {
      qs: {
        loginicon: true,
        uuid: _this.code,
        tip: 0,
        r: Date.now()
      }
    })
    
    var window = {}
    eval(response)
    
    switch (window.code) {
      case 200:
        var authAddress = window.redirect_uri
        this.baseURL = authAddress.match(/^https:\/\/(.*?)\//)[0]
        this.wxdomain = authAddress.match(/https:\/\/(.*?)\//)[1]
        var authResponse = await rp(authAddress, {
          qs: {
            fun: 'new',
            version: 'v2'
          }
        })
        var auth = {
          skey: authResponse.match(/<skey>(.*?)<\/skey>/)[1],
          passTicket: authResponse.match(/<pass_ticket>(.*?)<\/pass_ticket>/)[1],
          wxsid: authResponse.match(/<wxsid>(.*?)<\/wxsid>/)[1],
          wxuin: authResponse.match(/<wxuin>(.*?)<\/wxuin>/)[1]
        }

        //setting cookies
        var cookie = new tough.Cookie([
          {key: 'wxuin', value: auth.wxuin},
          {key: 'wxsid', value: auth.wxsid}
        ])
        this.cookiejar = rp.jar()
        this.cookiejar.setCookie(cookie, this.baseURL)
        
        this.auth = auth
        this.initUser()
        break
      case 201:
        this.avatar = window.userAvatar
        this.checkCode()
        break
      case 400:
        this.checkCode()
        break
      default:
       
        this.checkCode()  
    }

  }
  async initUser(){
    console.log('initUser start -------')
    var url = `${this.baseURL}cgi-bin/mmwebwx-bin/webwxinit?r=${-new Date()}&pass_ticket=${this.auth.passTicket}`

    var response = await rp({
            uri: url,
            method: 'POST',
            jar: this.cookiejar,
            json: true,
            body: {
              BaseRequest: {
                Sid: this.auth.wxsid,
                Uin: this.auth.wxuin,
                Skey: this.auth.skey,
              }
            } 
        });
       
      await rp({
          uri: `${this.baseURL}cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=en_US&pass_ticket=${this.auth.passTicket}`,
          method: 'POST',
          jar: this.cookiejar,
          json: true,
          body: {
            BaseRequest: {
              Sid: this.auth.wxsid,
              Uin: this.auth.wxuin,
              Skey: this.auth.skey,
            },
            ClientMsgId: +new Date(),
            Code: 3,
            FromUserName: response.User.UserName,
            ToUserName: response.User.UserName,
          }
      });

    //获取好友数据
    
    console.log('contact', response.ContactList)
    this.user = response.User;
  }
  async getContactList(){
    var friendResponse = await rp(`${this.baseURL}cgi-bin/mmwebwx-bin/webwxgetcontact`,{
      jar: this.cookiejar,
      qs: {
        r: Date.now(),
        seq: 0,
        skey: this.auth.skey
      },
      json: true
    })

    console.log('friend ==>',friendResponse)
    return friendResponse
  }
}
