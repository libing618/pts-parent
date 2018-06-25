// 浏览pages

var app=getApp()
Page({
  data:{
    pNo: 'articles',
    statusBar: app.sysinfo.statusBarHeight,
    sPages: ['viewRecord'],
    vData: {},
    vFormat: []
  },
  inFamily:false,

  onLoad: function(options) {
    var that = this ;
    that.data.pNo = options.pNo;
    that.inFamily = (typeof app.fData[that.data.pNo].afamily != 'undefined');
    that.data.vData = app.aData[that.data.pNo][options.artId];
    that.data.vFormat = app.fData[that.data.pNo].pSuccess;
    that.data.navBarTitle += '的' + (that.inFamily ? app.fData[that.data.pNo].afamily[that.data.vData.afamily] : app.fData[that.data.pNo].pName);
    that.setData(that.data);
  }
})
