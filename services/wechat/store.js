module.exports.cookie = {}
module.exports.contacts = []
module.exports.getUserNameByNickName = (name) => {
  var obj = contacts.find(item => item.NickName == name)
  if (obj){
    return obj.UserName
  }
  throw new Error('user not found')
}