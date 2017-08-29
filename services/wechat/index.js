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
    var response = (url, {
      params: {
        loginicon: true,
        uuid: _this.code,
        tip: 0,
        r: Date.now()
      }
    })
    
    var window = {}
    eval(response.data)
    
    switch (window.code) {
      case 200:
        try{
        var authAddress = window.redirect_uri
        this.baseURL = authAddress.match(/^https:\/\/(.*?)\//)[0]
        this.wxdomain = authAddress.match(/https:\/\/(.*?)\//)[1]
        var authResponse = await axios.get(authAddress, {
          params: {
            fun: 'new',
            version: 'v2'
          }
        })
        var auth = {
          skey: authResponse.data.match(/<skey>(.*?)<\/skey>/)[1],
          passTicket: authResponse.data.match(/<pass_ticket>(.*?)<\/pass_ticket>/)[1],
          wxsid: authResponse.data.match(/<wxsid>(.*?)<\/wxsid>/)[1],
          wxuin: authResponse.data.match(/<wxuin>(.*?)<\/wxuin>/)[1]
        }

        //setting cookies
        var cookie = new tough.Cookie([
          {key: 'wxuin', value: auth.wxuin},
          {key: 'wxsid', value: auth.wxsid}
        ])
        
        var cookiejar = new tough.CookieJar()
       
        cookiejar.setCookieSync(`wxuin=${auth.wxuin}; wxsid=${auth.wxsid}; domain=${this.wxdomain};`, this.baseURL)
        
        axios.defaults.jar = cookiejar
        axios.defaults.withCredentials = true
        this.auth = auth
        this.initUser()
        }catch(e){
          console.log(e)
        }
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
    var response = await axios.post(`${this.baseURL}/cgi-bin/mmwebwx-bin/webwxinit?r=${-new Date()}&pass_ticket=${this.auth.passTicket}`, {
            BaseRequest: {
                Sid: this.auth.wxsid,
                Uin: this.auth.wxuin,
                Skey: this.auth.skey,
            }
        });
       

        await axios.post(`${this.baseURL}/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=en_US&pass_ticket=${this.auth.passTicket}`, {
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
