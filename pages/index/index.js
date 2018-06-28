const { openWxLogin } = require('../../model/accessData');
var app = getApp();
Page({
  data:{
    autoplay: true,
    articles: require('../../libs/articles').articles,
    artdata: require('../../libs/articles').artdata,
    unAuthorize: true,
    grids: []
  },
  onLoad:function(options){
    var that = this;
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: ({authSetting})=> {
          if (authSetting['scope.userInfo']) {
            wx.checkSession({
              success: function(){    //session_key 未过期，并且在本生命周期一直有效
                resolve(app.roleData.user);
              },
              fail: function(){    // session_key 已经失效，需要重新执行登录流程
                resolve(false);
              }
            })
          } else { reject('微信用户未授权！') };
        },
        fail: function (err) {
          reject(err.errMsg); }     //获取微信用户权限失败
      })
    }).then(logined=>{
      return new Promise((resolve, reject) => {
        if (logined) {
          resolve(true)
        } else {
          openWxLogin().then(wxId => {      //登录
            app.roleData.user = wxId;
            resolve(true);
          }).catch(error => { reject(error) })
        };
      })
    }).then(() => {
      that.setData({
        unAuthorize: false,
        grids: require('../../libs/allmenu').iMenu('index')
      })
    }).catch((err)=>{
      console.log(err);
    })
  },

  userInfoHandler: function (e) {
    var that = this;
    openWxLogin().then( ()=> {
      that.grids = require('../../libs/allmenu').iMenu('index');
      that.grids[0].mIcon=app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({ unAuthorize: false, grids: that.grids })
    }).catch( console.error );
  }

})
