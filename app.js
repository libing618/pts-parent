App({
  globalData:{
    history: [],
    user: null,
    sysinfo: null
  },
  logData: [],
  aData: {
    artupdateAt :{
      "artlastdate":0,
      "artnowdate":0
      },
    articles: [ [], [], [] ],
    artdata: {}
  },

  onLaunch: function () {
    var that = this;
    that.globalData.sysinfo = wx.getSystemInfoSync();                     //读设备信息
    that.aData = wx.getStorageSync('aData') || this.aData;              //读文章的缓存
    wx.getStorage({
      key: 'loginInfo',
      success: (res) => {
        that.globalData.user = res.data
      },
      fail: (res) => {
        that.globalData.user = null
      }
    })
    wx.getStorage({
      key: 'history',
      success: (res) => {
        that.globalData.history = res.data
      },
      fail: (res) => {
        that.globalData.history = []
      }
    })
  },
  // 权限询问
  getRecordAuth: function() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              console.log("succ auth")
            }, fail() {
              console.log("fail auth")
            }
          })
        } else {
          console.log("record has been authed")
        }
      }, fail(res) {
        console.log("fail:"+res)
      }
    })
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
    wx.stopBackgroundAudio()
  },

  onError: function(msg) {
    this.logData.push( [Date.now(),msg] );
  }

})
