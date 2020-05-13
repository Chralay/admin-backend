const getAccessToken = require('./getAccessToken.js')
const rp = require('request-promise')

const cloudStorage = {
    async download(ctx, fileList) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.env,
                file_list: fileList
            },
            json: true
        }

        return await rp(options)
            .then((res) => {
                return res
            })
            .catch(function(err){
                console.log(err)
            })
    }
}

module.exports = cloudStorage