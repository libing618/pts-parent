var app = getApp()
Page({
  data:{ grids: []},
  onLoad:function(options){
    var that=this ;
    that.setData({grids: app.wmenu[2]}) 
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})