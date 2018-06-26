const wxappNumber = 2;    //本小程序在开放平台中自定义的序号
const {lcRequest,cosUploadFile} = require('../libs/accessLib')
var app = getApp();

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
  },

  simpleUpload:function () {
    wx.chooseImage({    // 选择文件
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          cosUploadFile(res.tempFilePaths[0]);
        }
    })
  }
}
