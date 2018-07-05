const URL_base = 'https://trce3aqb.engine.lncld.net/1.1/functions/';
const md5 = require('MD5').hexMD5
const COS = require('cos-wx-sdk-v5')
var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    var authorization = COS.getAuthorization({
      SecretId: '',
      SecretKey: 'A',
      Method: params.Method,
      Key: params.Key
    });
    callback(authorization);
  }
});
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
};
function scfRequest(fUrl,parmart){
  return new Promise((resolve, reject) => {
    wx.request({      //service-ocoqdd0t-1254065455.ap-beijing.apigateway.myqcloud.com
      url: 'https://wxlogin.sxlyqdzsw.cn/lyqWxLogin/'+fUrl,
      method: 'POST',
      header: {"content-type": 'application/x-www-form-urlencoded'},
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
cosUploadFile: function(filePath){
  let Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
  cos.postObject({
    Bucket: 'lg-la2p7duw-1254249743',
    Region: 'ap-shanghai',
    Key: Key,
    FilePath: filePath,
    onProgress: function (info) { console.log(JSON.stringify(info)) }
  }, requestCallback);
},

lcRequest: lcRequest,
scfRequest: scfRequest,
signRecognition: function(){
  return Promise.resolve(lcRequest('setRole',))
},

signAiQQ: function(params,appKey){
  let paramsKey = Object.keys(params).sort();  // 1. 字典升序排序
  let str = '';
  paramsKey.forEach(paramKey=>{    // 2. 拼按URL键值对
    if (params[paramKey] !== '') { str += paramKey+'='+encodeURI(params[paramKey])+'&'; }
  })
  str += 'app_key=' + appKey;    // 3. 拼接app_key
  return md5(str).toUpperCase();    // 4. MD5运算+转换大写，得到请求签名
}

}
