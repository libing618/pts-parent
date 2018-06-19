var app = getApp()
Page({
  data:{
    articles: require('../../libs/articles').articles,
    artdata: require('../../libs/articles').artdata,
    grids: require('../../libs/allmenu').iMenu('index')
  },
  onLoad:function(options){
    var that = this;

  }
})
