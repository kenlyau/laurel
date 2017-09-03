const express = require('express')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const app = express()

const router = require('./router')
const WechatBot = require('./services/wechat/')

new WechatBot()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

app.use(expressLayouts)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use('/', router)

app.listen('8080', () => console.log('app runing on port:8080'))

