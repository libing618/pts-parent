module.exports={
  roleData:{
    user: {},                                     //用户的原始定义
    wmenu: {
      updatedAt: 0
    },
    uUnit:{updatedAt: 0},                           //用户单位信息（若有）
    sUnit:{updatedAt: 0}                           //上级单位信息（若有）
  },
  mData: {
    proceduresAt:[                                //缓存中流程更新时间
      new Date(0),                          //最早更新时间
      new Date(0)                          //目前记录时间
    ],
    articles: [[], [], []],              //已发布文章分类缓存数组
    pCk1: 1,            //已发布文章分类阅读选中序号
    proceduresCk: '0',
    pAt:{"articles":[0, 0],"_Role":{}}
  },
  aData:{"articles":{},"_Role":{}}
}
