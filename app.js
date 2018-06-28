const {lcRequest,signAiQQ,scfRequest} = require('libs/accessLib');
App({
  history: [],
  roleData: require('globaldata.js').roleData,
  fData: require('./model/procedureclass'),
  logData: [],
  mData: require('globaldata.js').mData,                          //以objectId为key的数据记录
  aData: require('globaldata.js').aData,              //读数据记录的缓存

  onLaunch: function () {
    var that = this;
    ['roleData', 'mData', 'aData'].forEach(dataName=>{
      wx.getStorage({
        key: dataName,
        success: function (res) {
          if (res.data) {that[dataName] = res.data};
        }
      })
    });
    scfRequest('index',{iv:'a95eceb1ac8c24ee28b70f7dbba912bf'})
    wx.getSystemInfo({                     //读设备信息
      success: function (res) {
        that.sysinfo = res;
        let sdkvc = res.SDKVersion.split('.');
        let sdkVersion = parseFloat(sdkvc[0] + '.' + sdkvc[1] + sdkvc[2]);
        if (sdkVersion < 2.09) {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法正常使用，请升级到最新微信版本后重试。',
            compressed(res) { setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000); }
          })
        };
      }
    });
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType == 'none') {
          that.netState = false;
          wx.showToast({ title: '请检查网络！' });
        } else {
          that.netState = true;
          lcRequest('writers', ).then(myip => { that.sysinfo.userip = myip; })
        }
      }
    });
    wx.onNetworkStatusChange(res => {
      if (!res.isConnected) {
        that.netState = false;
        wx.showToast({ title: '请检查网络！' });
      } else {
        that.netState = true;
      }
    });
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
            userlog.set('userObjectId',that.roleData.user.uId);
            userlog.set('wxappNumber',2);
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
