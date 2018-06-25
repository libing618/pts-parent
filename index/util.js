const COS = require('../libs/cos-wx-sdk-v5')
var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    var authorization = COS.getAuthorization({
      SecretId: require('./confqcloud').qcloudId1,
      SecretKey: require('./confqcloud').qcloudKey1,
      Method: params.Method,
      Key: params.Key
    });
    callback(authorization);
  }
});
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function recordTime(date) {
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var app = getApp();

module.exports = {
  formatTime: formatTime,
  recordTime: recordTime,

  cosUploadFile: function(filePath){
    let Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
    cos.postObject({
      Bucket: 'sxzq-cos-1256932165',
      Region: 'ap-beijing',
      Key: Key,
      FilePath: filePath,
      onProgress: function (info) { console.log(JSON.stringify(info)) }
    }, requestCallback);
  },

  hTabClick: function (e) {                                //点击头部tab
    this.setData({
      "ht.pageCk": Number(e.currentTarget.id)
    });
  },

  qcRecognition: function(uId,faceUrl){       //人脸检索

  }
}
