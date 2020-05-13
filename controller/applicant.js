const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')
const callCloudStorage = require('../utils/callCloudStorage')

router.get('/list', async (ctx, next) => {
    const query = ctx.request.query
    const res = await callCloudFn(ctx, 'user', {
        $url: 'getAllInfo',
        dbname: 'applicant',
        start: parseInt(query.start),
        count: parseInt(query.count)
    })
    let data = []
    let returnData = []
    if (res.resp_data) {
        data = JSON.parse(res.resp_data).data
        // 图片文件下载链接
        let fileList = []
        for (let i = 0, len = data.length; i < len; i++) {
            fileList.push({
                fileid: data[i].basicInfo.avatarUrl,
                max_age: 7200
            })
        }
        const dlRes = await callCloudStorage.download(ctx, fileList)
        let dlList = dlRes.file_list
        for (let i = 0, len = data.length; i < len; i++) {
            data[i].basicInfo.avatarUrl = dlList[i].download_url
            returnData.push({
                ...data[i].basicInfo,
                _id: data[i]._id,
                _openid: data[i]._openid
            })
        }
        // console.log(data)
    }
    ctx.body = {
        data: returnData,
        code: 20000
    }
})

// 这个好像没有用，因为对用户不能修改，只能删除
router.get('/getById', async (ctx, next) => {
    const query = `db.collection('applicant').doc('${ctx.request.query.id}').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        code: 20000,
        data: JSON.parse(res.data)
    }
})

router.get('/del', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('applicant').doc('${params.id}').remove()`
    const res = await callCloudDB(ctx, 'databasedelete', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})

router.get('/getByName', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('applicant').where({\"basicInfo.nickName\":\"${params.nickName}\"}).get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    console.log(res)
    let returnData = []
    if (res.data.length != 0) {
        // 能找到对应的应聘者
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