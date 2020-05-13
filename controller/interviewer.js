const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')
const callCloudStorage = require('../utils/callCloudStorage')

router.get('/list', async (ctx, next) => {
    const query = ctx.request.query
    const res = await callCloudFn(ctx, 'user', {
        $url: 'getAllInfo',
        dbname: 'interviewer',
        start: parseInt(query.start),
        count: parseInt(query.count)
    })
    let data = []
    if (res.resp_data) {
        data = JSON.parse(res.resp_data).data
        // 图片文件下载链接
        let fileList = []
        for(let i = 0, len = data.length; i < len; i++){
            fileList.push({
                fileid: data[i].basicInfo.avatarUrl,
                max_age: 7200
            })
        }
        const dlRes = await callCloudStorage.download(ctx, fileList)
        let dlList = dlRes.file_list
        let returnData = []
        for(let i = 0, len = data.length; i < len; i++){
            data[i].basicInfo.avatarUrl = dlList[i].download_url
            returnData.push({
                ...data[i].basicInfo,
                _id: data[i]._id,
                _openid: data[i]._openid
            })
        }
        // console.log(data)
        ctx.body = {
            data: returnData,
            code: 20000
        }
    }
})

router.get('/del', async(ctx, next)=>{
    const params = ctx.request.query
    const query = `db.collection('interviewer').doc('${params.id}').remove()`
    const res = await callCloudDB(ctx, 'databasedelete', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})

module.exports = router