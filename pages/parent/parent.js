var app = getApp()
Page({
  data:{
    grids:[],
    course1:['语文','英语','数学','语文','英语',
            '地理','生物','历史','品德','信息',
            '英语','数学','体育','英语','语文',
            '数学','语文','英语','数学','音乐'],
    course2:['英语','地理','生物','历史','美术',
            '生物','数学','语文','英语','体育'],
    scrollHeight: app.globalData.sysinfo.windowHeight-380
   },
  onLoad:function(options){
    var that=this ;
    that.setData({
      grids: app.wmenu[3]
    }); 
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