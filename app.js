const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const ENV = 'boss-astw9'

// 跨域
app.use(cors({
    orgin: ['http://localhost:9528/'],
    credentials: true
}))

// 接受post参数解析
app.use(koaBody({
    multipart: true
}))

app.use(async (ctx, next) =>{
    console.log('全局中间件')
    ctx.state.env = ENV
    await next()
})

const applicant = require('./controller/applicant.js')
router.use('/applicant', applicant.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, ()=>{
    console.log('服务开启在3000端口')
})