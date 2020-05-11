const rp = require('request-promise')
const APPID ='wx5131c1f7d47c63d6'
const APPSECRET = '8687d723981066b6680524bae715493d'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')
// console.log(fileName)

const updateAccessToken = async ()=>{
    const resStr = await rp(URL)
    const res = JSON.parse(resStr)
    console.log(res)
    if(res.access_token){
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.access_token,
            createTme: new Date()
        }))
    }else{
        await updateAccessToken()
    }
}

const getAccessToken = async ()=>{
    // 读取文件
    try{
        const readRes = fs.readFileSync(fileName, 'utf8')
        const readObj = JSON.parse(readRes)
        // console.log(readObj)
        const createTme = new Date(readObj.createTme).getTime()
        const nowTime = new Date().getTime()
        if((nowTime - createTme)/ 1000 / 60 / 60 >= 2){
            await updateAccessToken()
            await getAccessToken()
        }

        return readObj.access_token
    }catch(error){
        await updateAccessToken()
        await getAccessToken()
    }
}

setInterval(async ()=>{
    await updateAccessToken()
}, (7200 - 30) * 1000)


module.exports = getAccessToken