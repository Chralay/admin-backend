const Koa = require('koa')
const app = new　Koa()

app.use(async (ctx)=>{
    ctx.body = 'Hello World'
})

app.listen(3000, ()=>{
    console.log('服务开启在3000端口')
})