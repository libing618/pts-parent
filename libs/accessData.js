const URL_base = 'https://trce3aqb.engine.lncld.net/1.1/functions/';
const wxappNumber = 2;    //本小程序在开放平台中自定义的序号

function lcRequest(f,parmart){
  return new Promise((resolve, reject) => {
    wx.request({
      url: URL_base+f,
      method: 'POST',
      header: {
        'X-LC-Id': 'Trce3aqbc6spacl6TjA1pndr-gzGzoHsz',
        'X-LC-Key': 'CBbIFAhL4zOyCT9PQM5273bP',
        'Accept': 'application/json'                 //这有一个大坑，不能用Content-Type：'application/json'
      },
      data: parmart,
      success: function(res){     //这要注意返回的json名称有变化，要在控制台进行查看,千万不要用id这样的保留字作自定义的列名
        resolve(res);
      },
      fail: function(error){
        reject(error);
      }
    })
  })
}
module.exports = {
openWxLogin: function() {              //取无登录状态数据
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (wxlogined) {
        if (wxlogined.code) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (wxuserinfo) {
              if (wxuserinfo) {
                lcRequest('wxLogin' + wxappNumber,{ code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv }).then(({data:{result},errMsg,header})=>{
                  console.log(result)
                  if (errMsg == "request:ok"){
                    wx.setStorage({key:'loginInfo',data:result})
                    resolve(result)
                  } else {
                    reject({ec:2,ee:errMsg})
                  }
                }).catch((error) => { reject({ ec: 1, ee: error }) });       //云端登录失败
              }
            }
          })
        } else { reject({ ec: 3, ee: '微信用户登录返回code失败！' }) };
      },
      fail: function (err) { reject({ ec: 4, ee: err.errMsg }); }     //微信用户登录失败
    })
  });
}

}
