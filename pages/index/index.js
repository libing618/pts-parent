const AV = require('../../libs/leancloud-storage.js');

var app = getApp()
Page({
  data:{
    articles: {},
    artdata: {},
    grids: []
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      articles: app.aData.articles,
      artdata: app.aData.artdata
    });
    let mData = wx.getStorageSync('menudata');
    if (mData){
      app.wmenu = mData.initVale;
      that.setData({ grids: app.wmenu[0] });
    }
    app.openWxLogin(app).then(function(initstate){
      app.logData.push( [Date.now(),'系统初始化']);                      //本机初始化时间记入日志
      if (initstate){ that.setData({grids: app.wmenu[0]}) };
      that.updateData(true);                       //更新缓存以后有变化的数据
    }).catch((error)=>{ console.log(error) });
  },

  updateData: function(isDown){    //更新页面显示数据,isDown下拉刷新
    var that = this;
    var readArticles = new AV.Query('articles');                                      //进行数据库初始化操作
    if (isDown){
      readArticles.greaterThan('updatedAt',app.aData.artupdateAt.artnowdate ? new Date(app.aData.artupdateAt.artnowdate) : new Date("1970-01-01"));          //查询本地最新时间后修改的记录
      readArticles.ascending('updatedAt');           //按更新时间升序排列
      readArticles.limit(1000);                      //取最大数量新闻
    }else{
      readArticles.lessThan('updatedAt',new Date(app.aData.artupdateAt.artlastdate));          //查询最后更新时间前修改的记录
      readArticles.descending('updatedAt');           //按更新时间降序排列
    };
    readArticles.find().then( (art)=>{
      var lena = art.length;
      if (lena>0)
      {
        let article = {}, newData = {}, artPlace = -1, keyName ='' ;
        if (isDown){
          app.aData.artupdateAt.artnowdate = art[lena-1].updatedAt;                          //更新本地最新时间
          app.aData.artupdateAt.artlastdate = app.aData.artupdateAt.artlastdate || art[0].updatedAt; //若本地记录时间为空，则更新本地最后更新时间
        }else{
          app.aData.artupdateAt.artlastdate = art[lena-1].updatedAt;          //更新本地最后更新时间
        };
        for ( var j=0 ; j<lena ; j++){
          article = art[j].toJSON();                            //文章类别afamily，0新闻2班级动态3帮助
          if (isDown){
            artPlace = app.aData.articles[article.afamily].indexOf(article.objectId )
            if (artPlace>=0) {app.aData.articles[article.afamily].splice(artPlace,1)}           //删除本地的重复记录列表
            app.aData.articles[article.afamily].unshift(article.objectId);                   //文章类别0新闻2班级动态3帮助
          }else{          
            app.aData.articles[article.afamily].push(article.objectId);                   //文章类别0新闻1品牌2扶持政策3宣传4帮助
          };
          app.aData.artdata[article.objectId] = article;
        };
        that.setData({ artdata: app.aData.artdata });
        that.setData({articles: app.aData.articles});
      }      
    }).catch( (error)=>{ console.log(error) } );
  },

  onPullDownRefresh:function(){
    this.updateData(true);
  },
  onReachBottom:function(){
    this.updateData(false);
  }
})