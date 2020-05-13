const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')

router.get('/list', async (ctx, next) => {
    const query = ctx.request.query
    const res = await callCloudFn(ctx, 'user', {
        $url: 'getAllInfo',
        dbname: 'applicant',
        start: parseInt(query.start),
        count: parseInt(query.count)
    })
    let data = []
    if (res.resp_data) {
        data = JSON.parse(res.resp_data).data
    }
    ctx.body = {
        data,
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

module.exports = router