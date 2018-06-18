const AV = require('./libs/leancloud-storage.js');
const Realtime = require('./libs/leancloud-realtime.js').Realtime;
const TypedMessagesPlugin = require('./libs/leancloud-realtime-plugin-typed-messages.js').TypedMessagesPlugin;
const ImageMessage = require('./libs/leancloud-realtime-plugin-typed-messages.js').ImageMessage;
AV.init({                                    // 初始化存储 SDK
  appId: 'PKX4oY9yEtM0EOtenv0u1xWj-9Nh9j0Va',
  appKey: 'hDki5cyAiJQgNFrN5zOlxdUO'
});

App({
  globalData:{
    user: null,
    sysinfo: null
  },
  wmenu: [],
  logData: [],
  aData: {
    artupdateAt :{
      "artlastdate":0,
      "artnowdate":0
      },
    articles: [ [], [], [] ],
    artdata: {}
  },
 realtime : new Realtime({             // 初始化实时通讯 SDK
 appId: 'PKX4oY9yEtM0EOtenv0u1xWj-9Nh9j0Va',
 noBinary: true,
 plugins: [TypedMessagesPlugin], // 注册富媒体消息插件
}),
  openWxLogin: function(that) {            //注册登录
    var code = '';
    var userSet = '';
    return new AV.Promise((resolve, reject) => {
      wx.login({
        success: function(wxlogined) {
          if ( wxlogined ) { resolve(wxlogined); }
          else { reject('微信用户授权登录失败！'); }
        },
        fail: function(err) { reject(err); }
        });
    }).then(function(wxlogined) {
      code = wxlogined.code;
      return new AV.Promise((resolve, reject) => {
        wx.getUserInfo({
          success: function(wxuserinfo) {
            if (wxuserinfo) { resolve(wxuserinfo); }
            else { reject('获取微信客户信息失败！'); }
          },
          fail: function(err) { reject(err); }
        });
      });
    }).then(function(wxuserinfo) {
      userSet = wxuserinfo.userInfo;
      return new AV.Promise((resolve, reject) => {
      var lcuser = AV.User.current();                          //本机登录状态
      if ( !lcuser ) {                         //用户如已注册并在本机登录过,则有数据缓存，否则进行注册登录。
        AV.Cloud.run( 'plogin',{ code:code, encryptedData:wxuserinfo.encryptedData, iv:wxuserinfo.iv }  // 发送服务平台小程序解码请求
        ).then(function(wxuid) {
          AV.User.logIn(wxuid.openId,wxuid.watermark.timestamp).then( function(cuser){
            cuser.set(userSet).save().then( (wxuser) =>{
              that.globalData.user = wxuser.toJSON();
              resolve(2);                        //客户登录成功
            }).catch((error)=>{return AV.Promise.reject('保存客户信息失败')});
          }).catch( (error) => {
            let signUser = new AV.User();
            signUser.setUsername(wxuid.openId);
            signUser.setPassword(wxuid.watermark.timestamp);
            signUser.signUp().then( signuped =>{
              userSet.roleObjectId = '58d48acfb1acfc0056b41704';                      //注册时给一个最低权限
              signuped.set(userSet).save().then(wxuser =>{
                that.globalData.user = wxuser.toJSON();
                resolve(1);                  //客户注册成功
              });
            }).catch((error)=>{return AV.Promise.reject('客户注册失败')});
          });
        }).catch((error)=>{return AV.Promise.reject('客户信息解码失败')});
      }else{
        that.globalData.user = lcuser.toJSON();           //读缓存的用户信息
        new AV.Query('_User').get(that.globalData.user.objectId).then( (auser) =>{
          that.globalData.user = auser.toJSON();
          that.globalData.user.avatarUrl=userSet.avatarUrl;
          that.globalData.user.nickName=userSet.nickName;
          let menuData = wx.getStorageSync('menudata') || [];
          if ( menuData ){
            if ( menuData.objectId==that.globalData.user.roleObjectId ){           //客户已登录且菜单权限没变化
              resolve(0)
            }else{
              resolve(3)                  //客户已登录但菜单权限发生变化
            }
          }else{ resolve(3);}
        })
      }
      });
    }).then(function(loginState){
      if (loginState){
        var usersmenu = new AV.Query('userInit');
        usersmenu.get(that.globalData.user.roleObjectId).then(function(rolemenu) {
          let rmJson = rolemenu.toJSON();
          that.wmenu = rmJson.initVale;
          wx.setStorage({ key: 'menudata', data: rmJson })
          return AV.Promise.resolve(loginState)
        })
      }else{ return AV.Promise.resolve(loginState) };
    }).catch((error)=>{return AV.Promise.reject(error)});
  },

  onLaunch: function () {
    this.globalData.sysinfo = wx.getSystemInfoSync();                     //读设备信息
    this.aData = wx.getStorageSync('aData') || this.aData;              //读文章的缓存
  },

  onHide: function () {             //进入后台时缓存数据。
    var that=this;
    wx.getStorageInfo({             //查缓存的信息
      success: function(res) {
        if ( res.currentSize>(res.limitSize-512) ) {          //如缓存占用大于限制容量减512kb，将大数据量的缓存移除。
          wx.removeStorage({key:"aData"});
        }else{
          wx.setStorage({key:"aData", data:that.aData});
        }
      }
    });
    let logData = that.logData.concat(wx.getStorageSync('loguser') || []);  //如有旧日志则拼成一个新日志数组
    if (logData.length>0){
      wx.getNetworkType({
        success: function(res) {
          if (res.networkType=='none')                      //如果没有网络
          {
            wx.setStorageSync('loguser', logData)           //缓存操作日志
          }else
          {
            let loguser = AV.Object.extend('loguser');       //有网络则上传操作日志
            let userlog = new loguser();
            userlog.set('userObjectId',that.globalData.user.objectId);
            userlog.set('workRecord',logData);
            userlog.save().then( resok =>{
              wx.removeStorageSync('loguser');              //上传成功清空日志缓存
            }).catch( error =>{                            //上传失败保存日志缓存
              wx.setStorage({ key: 'loguser', data: logData })
            })
          }
        }
      })
    }
  },

  onError: function(msg) {
    this.logData.push( [Date.now(),msg] );
  }

})
