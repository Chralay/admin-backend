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
    var i, len
    // 1.删interviewer里的记录 2.删他发布过的职位job 3.删interview-manage涉及对应职位的 
    const params = ctx.request.query
    // 先得到他曾发布过的职位id
    const query1 = `db.collection('interviewer').doc('${params.id}').get()`
    const res1 = await callCloudDB(ctx, 'databasequery', query1)
    const jobs = JSON.parse(res1.data).jobs
    console.log(jobs)
    // 然后删除删interviewer里的记录
    const query2 = `db.collection('interviewer').doc('${params.id}').remove()`
    const res = await callCloudDB(ctx, 'databasedelete', query2)
    if(res.deleted > 0){
        console.log('成功删除interviewer里的数据')
        for(i = 0, len = jobs.length; i < len; i++){
            // 删除jobsTry里的
            let a = await callCloudFn(ctx, 'job-s', {
                $url: 'delJob',
                jobId: jobs[i]
            })
            console.log(a)
            // 删除interview-manage里的
            let b = await callCloudFn(ctx, 'manage', {
                $url: 'delInfo',
                jobId: jobs[i]
            })
            console.log(b)
            console.log(JSON.parse(a.resp_data).stats.removed)
            if(!JSON.parse(a.resp_data).stats.removed || !JSON.parse(b.resp_data).stats.removed){
                break
            }
        }
        if(i < len){
            console.log('至少有一个删除错误')//但应该影响不大
        }
    }
    ctx.body = {
        code: 20000,
        data: res
    }
})

router.get('/getByName', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('interviewer').where({\"basicInfo.nickName\":\"${params.nickName}\"}).get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    console.log(res)
    let returnData = []
    if (res.data.length != 0) {
        // 能找到对应的招聘者
        let obj = JSON.parse(res.data[0])
        let fileList = [{
            fileid: obj.basicInfo.avatarUrl,
            max_age: 7200
        }]
        const dlRes = await callCloudStorage.download(ctx, fileList)
        let dlList = dlRes.file_list
        obj.basicInfo.avatarUrl = dlList[0].download_url
        returnData.push({
            ...obj.basicInfo,
            _id: obj._id,
            _openid: obj._openid
        })
    }
    ctx.body = {
        code: 20000,
        data: returnData
    }
})

module.exports = router