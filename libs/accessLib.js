const URL_base = 'https://trce3aqb.engine.lncld.net/1.1/functions/';
const COS = require('../libs/cos-wx-sdk-v5')
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
function scfRequest(fUrl,header,parmart){
  return new Promise((resolve, reject) => {
    wx.request({
      url: fUrl,
      method: 'GET',
      header: header,
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

signRecognition: function(){
  return Promise.resolve(lcRequest('setRole',))
}

}
