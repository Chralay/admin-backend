const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')
const callCloudStorage = require('../utils/callCloudStorage')

router.get('/list', async (ctx, next) => {
    const params = ctx.request.query
    const res = await callCloudFn(ctx, 'company', {
        $url: 'getAllInfo',
        start: parseInt(params.start),
        count: parseInt(params.count)
    })
    let data = []
    if (res.resp_data) {
        data = JSON.parse(res.resp_data).data
        // 以云存储保存的公司头像图片文件下载链接
        let fileList = []
        for (let i = 0, len = data.length; i < len; i++) {
            if(!/^(https||http):\/\/.*/i.test(data[i].companyAvatar)){
                // 不是以https或http开头
                fileList.push({
                    fileid: data[i].companyAvatar,
                    max_age: 7200
                })
            }
        }
        const dlRes = await callCloudStorage.download(ctx, fileList)
        let dlList = dlRes.file_list
        for (let i = 0, len = data.length; i < len; i++) {
            if(!/^(https||http):\/\/.*/i.test(data[i].companyAvatar)){
                // 不是以https或http开头
                data[i].companyAvatar = dlList[i].download_url
            }
        }
        // console.log(data)
    }
    ctx.body = {
        data: data,
        code: 20000
    }
})

router.post('/updatePass', async(ctx, next)=>{
    const params = ctx.request.body
    const query = `
        db.collection('companyTry').doc('${params.id}').update({
            data:{
                isPass: ${params.n}
            }
        })
    `
    const res = await callCloudDB(ctx, 'databaseupdate', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})

module.exports = router