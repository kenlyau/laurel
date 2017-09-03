module.exports.getCONF = (host = 'https://wx.qq.com/') => {
  var pushURL = 'https://webpush.weixin.qq.com/'
  var fileURL = 'https://file.wx.qq.com/'
  if (host.indexOf('wx2.qq.com') > -1){
    fileURL = 'https://file.wx2.qq.com/'
    pushURL = 'https://webpush.wx2.qq.com/'
  }else if(host.indexOf('wx8.qq.com') > -1){
    fileURL = 'https://file.wx8.qq.com/'
    pushURL = 'https://webpush.wx8.qq.com/'
  }else if(host.indexOf('qq.com') > -1){
    fileURL = 'https://file.wx.qq.com/'
    pushURL = 'https://webpush.wx.qq.com/'
  }else if(host.indexOf('web2.wechat.com') > -1){
    fileURL = 'https://file.web2.wechat.com/'
    pushURL = 'https://webpush.web2.wechat.com/'
  }else if(host.indexOf('wechat.com') > -1){
    fileURL = 'https://file.web.wechat.com'
    pushURL = 'https://webpush.web.wechat.com'
  }

  return {
    'API_LOGIN': 'https://login.wx.qq.com/jslogin',
    'API_LOGIN_CHECK': 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login',
    'API_INIT': host + 'cgi-bin/mmwebwx-bin/webwxinit',
    'API_GET_CONTACTS': host + 'cgi-bin/mmwebwx-bin/webwxgetcontact',
    'API_SYNC_CHECK': pushURL + 'cgi-bin/mmwebwx-bin/synccheck',
    'API_SYNC': host + 'cgi-bin/mmwebwx-bin/webwxsync', 
    'API_SEND_TEXT': host + 'cgi-bin/mmwebwx-bin/webwxsendmsg',
    'API_SEND_IMG': host + 'cgi-bin/mmwebwx-bin/webwxsendmsgimg',
    'API_SEND_VEDIO': host + 'cgi-bin/mmwebwx-bin/webwxsendvideomsg',
    'API_SEND_EMOTICON': host + 'cgi-bin/mmwebwx-bin/webwxsendemoticon',
    'API_SEND_APPMSG': host + 'cgi-bin/mmwebwx-bin/webwxsendappmsg',
    'API_GET_HEADIMG': host + 'cgi-bin/mmwebwx-bin/webwxgetheadimg',
    'API_GET_IMG': host + 'cgi-bin/mmwebwx-bin/webwxgetmsgimg',
    'API_GET_MEDIA': host + 'cgi-bin/mmwebwx-bin/webwxgetmedia',
    'API_GET_VIDEO': host + 'cgi-bin/mmwebwx-bin/webwxgetvideo',
    'API_GET_VOICE': host + 'cgi-bin/mmwebwx-bin/webwxgetvoice',
    'API_LOGOUT': host + 'cgi-bin/mmwebwx-bin/webwxlogout',
    'API_UPDATE_ROOM': host + 'cgi-bin/mmwebwx-bin/webwxupdatechatroom',
    'API_CRATE_ROOM': host + 'cgi-bin/mmwebwx-bin/webwxcreatechatroom',
    'API_STATUS_NOTIFY': host + 'cgi-bin/mmwebwx-bin/webwxstatusnotify',
    'API_CHECK_URL': host + 'cgi-bin/mmwebwx-bin/webwxcheckurl',
    'API_VERIFY_USER': host + 'cgi-bin/mmwebwx-bin/webwxverifyuser',
    'API_FEEDBACK': host + '/cgi-bin/mmwebwx-bin/webwxsendfeedback',
    'API_REPORT': host + '/cgi-bin/mmwebwx-bin/webwxstatreport',
    'API_SEARCH': host + '/cgi-bin/mmwebwx-bin/webwxsearchcontact',
    'API_OPLOG': host + '/cgi-bin/mmwebwx-bin/webwxoplog',
    'API_CHECK_UPLOAD': host + '/cgi-bin/mmwebwx-bin/webwxcheckupload',
    'API_REVOKE_MSG': host + '/cgi-bin/mmwebwx-bin/webwxrevokemsg',
    'NPC_HEARTBEAT': 'filehelper',
    'CONTACT_CONTACT': 1,
    'CONTACT_CHAT': 2,
    'CONTACT_ROOM': 4,
    'CONTACT_BLACK_LIST': 8,
    'CONTACT_DOMAIN': 16,
    'CONTACT_HIDE': 32,
    'CONTACT_FAVOUR': 64,
    'CONTACT_3RDAPP': 128,
    'CONTACT_SNS_BLACK_LIST': 256,
    'CONTACT_NOTIFY_CLOSE': 512,
    'CONTACT_TOP': 2048,
    'MSG_TYPE_TEXT': 1,
    'MSG_TYPE_IMAGE': 3,
    'MSG_TYPE_VOICE': 34,
    'MSG_TYPE_VERIFY': 37,
    'MSG_TYPE_POSSIBLEFRIEND': 40,
    'MSG_TYPE_SHARECARD': 42,
    'MSG_TYPE_VIDEO': 43,
    'MSG_TYPE_MICROVIDEO': 62,
    'MSG_TYPE_EMOTICON': 47,
    'MSG_TYPE_LOCATION': 48,
    'MSG_TYPE_APP': 49,
    'MSG_TYPE_VOIPMSG': 50,
    'MSG_TYPE_STATUSNOTIFY': 51,
    'MSG_TYPE_VOIPNOTIFY': 52,
    'MSG_TYPE_VOIPINVITE': 53,
    'MSG_TYPE_SYSNOTICE': 9999,
    'MSG_TYPE_RECALLED': 10002,
    'MSG_TYPE_SYS': 1e4,
    'MSG_SEND_STATUS_READY': 0,
    'MSG_SEND_STATUS_SENDING': 1,
    'MSG_SEND_STATUS_SUCC': 2,
    'MSG_SEND_STATUS_FAIL': 5,
    'APPMSG_TYPE_TEXT': 1,
    'APPMSG_TYPE_IMAGE': 2,
    'APPMSG_TYPE_AUDIO': 3,
    'APPMSG_TYPE_VIDEO': 4,
    'APPMSG_TYPE_URL': 5
  }
}