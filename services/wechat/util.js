const axios = require('axios')
const {cookie} = require('./store')

const CONTACTFLAG_CONTACT = 1
const CONTACTFLAG_TOPCONTACT = 2048
const MM_USERATTRVERIFYFALG_BIZ_BRAND = 8
const CHATROOM_NOTIFY_CLOSE = 0
const CONTACTFLAG_NOTIFYCLOSECONTACT = 512

//设置axios拦截器
axios.interceptors.request.use(config => {
  config.headers['cookie'] = Object.keys(cookie)
    .map(key => {
      return `${key}=${cookie[key]}`
    }).join('; ')
    return config
}, err => Promise.reject(err))
axios.interceptors.response.use(res => {
  var setCookie = res.headers['set-cookie']
  if (setCookie){
    setCookie.forEach(item => {
      var pm = item.match(/^(.+?)\s?\=\s?(.+?);/)
      if (pm){
        cookie[pm[1]] = pm[2]
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

module.exports.getPgv = c => {
  return (c || '') + Math.round(2147483647 * (Math.random() || 0.5)) * (+new Date() % 1E10)
}

module.exports.getClientMsgId = () => {
  return (Date.now() + Math.random().toFixed(3)).replace('.', '')
}

module.exports.getDeviceID = () => {
  return 'e' + ('' + Math.random().toFixed(15)).substring(2, 17)
}

module.exports.isContact = (user) => {
  return user.ContactFlag & CONTACTFLAG_CONTACT
}

module.exports.isChatRoom = (userid) => {
  return userid && userid.startsWith('@@')
}

module.exports.isChatRoomOwner = (user) => {
  return isChatRoom(user.UserName) && user.IsOwner
}

module.exports.isRoomRemoved = (user) => {
  return isChatRoom(user.UserName) && user.ContactFlag === 0
}

module.exports.isOfficial = (user) => {
  return !(user.VerifyFlag !== 24 && user.VerifyFlag !== 8 && user.UserName.startsWith('@'));
}

module.exports.isTop = (user) => {
  if (user.isTop !== void 0) {
    return user.isTop
  }
  return user.ContactFlag & CONTACTFLAG_TOPCONTACT
}

module.exports.isBrand = (user) => {
  return user.VerifyFlag & MM_USERATTRVERIFYFALG_BIZ_BRAND
}

module.exports.get = (url, params = {}) => {
  return axios({
    url: url,
    params: params
  })
}

module.exports.post = (url, params = {}, data = {}) => {
  return axios({
    method: 'POST',
    url: url,
    params: params,
    data: data
  })
}