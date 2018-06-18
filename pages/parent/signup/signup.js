const AV = require('../../../libs/leancloud-storage.js');
var app = getApp()
Page({
  data:{
	user: {},
	swcheck : true,
	phonen: '',
	vcoden: '',
	activeIndex: "0",
	timg: '../../../images/timg.jpg',
	yzb: "验\u3000\u3000\u3000证",           //u3000在在js中插入全角空格，&#3000;这种形式在在wxml中不转义
	tk : "除非你已阅读并接受本协议所有条款，否则你无权使用微信公众平台服务。你对本服务的登录、查看、发布信息等行为即视为你已阅读并同意本协议的约束。如果你未满18周岁，请在法定监护人的陪同下阅读本协议及其他上述协议，并特别注意未成年人使用条款。\n一、【协议的范围】\n\u3000\u30001.1 本协议是你与腾讯之间关于你使用微信公众平台服务所订立的协议。“腾讯”是指腾讯公司及其相关服务可能存在的运营关联单位。“用户”是指注册、登录、使用微信公众帐号的个人或组织，在本协议中更多地称为“你”。“其他用户”是指包括其他微信公众帐号用户和微信用户等除用户本人外与微信公众平台服务相关的用户。"
	},

  editenable: function(e) {                         //点击条目进入编辑或选择操作
		this.setData({activeIndex : app.globalData.user.pMobile ? e.currentTarget.id : "0" })
  },

  fswcheck: function(e) {                         //“同意条款”选择
		this.setData({swcheck : !this.data.swcheck})
  },

getvcode: function(e) {							//验证号码是否符合规则并增加学生
		var phone = e.detail.value.inputmpn;
		var vcode = e.detail.value.inputvc;
		var pRelation = e.detail.value.inputpr;
		if (e.detail.value.fswcheck.checked) {	
			if ( phone && /^1\d{10}$/.test(phone) ) {                  //结束输入后验证手机号格式
				this.data.user.pMobile = phone;
			}else{
				wx.showModal({
				title: '手机号输入错误',
				content: '请重新输入正确的手机号！'
				});
				this.data.user.pMobile = '';
			};
			if( ! vcode && /\d{18}$/.test(vcode) ) {                   //验证学籍号是否符合规则
	  		this.data.user.salt = vcode;
			}else{
				wx.showModal({
				title: '身份证输入错误',
				content: '请重新输入正确的身份证号!'
				});
				this.data.user.salt = '';
			};
			if ( this.data.user.pMobile && this.data.user.salt && pRelation)

				AV.User.current()
					.set(this.data.user)  // 设置并保存手机号
					.save();

		}else{
			wx.showToast({title: '同意相关协议才能注册！'})
		}
  },


  inputpimg: function(e) {                         //上传学生照片
		var that = this;
		wx.showModal({
		title: '请拍摄学生的照片进行注册',
		content: '请在拍摄时保证头部清楚，不被遮挡。',
		success: function(res) {
			if (res.confirm) {                          //用户点击确定
			wx.chooseImage({
				count: 1,
				sizeType: ['original', 'compressed'],
				sourceType: ['camera'],                      //用户拍摄头像
				success: function(res) {
				var tempFilePath = res.tempFilePaths[0];
				new AV.File('file-name', {
				blob: {
					uri: tempFilePath,
				},
				}).save().then(	file => {
					that.setData({pimg : file.url()});
				}).catch(console.error)
				}
				});
			}
			}
		})
  },
  makeunit: function(e) {                         //创建学生
	var reqData = e.detail.value;
	var fSeatch = new AV.Query('student');
	fSeatch.equalTo('sName',reqData.unitname);
	fSeatch.select(['sName']);
	fSeatch.find().then(results=>{
	  if (results.length==0){                      //申请班级名称无重复
		reqData.headId = app.globalData.user.objectId;            //申请设立班级班主任的ID
//		let approveclass= new AV.Query('liucheng').get('587c6a494eb00200577be0ec').then((appclass)=>{return appclass.toJSON});
		var fmakeUnit=new AV.Objict.extend('sengpi');        //申请设立班级
		fmakeUnit.set('dUseFlow','587c6a494eb00200577be0ec');                //流程ID为新建班级
		fmakeUnit.set('dResult',1);                //流程处理结果1为提交
		fmakeUnit.set('dIdear','发起审批流程');                //流程处理意见
		fmakeUnit.set('cInstance','');             //班级ID
		fmakeUnit.set('dFlowStep','58b83c7dd506d200511ba497');              //下一流程审批人
		fmakeUnit.set('dObject',reqData);
		var acl = new AV.ACL();      // 新建一个 ACL 实例
		acl.setReadAccess('58b83c7dd506d200511ba497',true);
		acl.setWriteAccess(app.globalData.user.objectId,true);
		fmakeUnit.setACL(acl);         // 将 ACL 实例赋予fmakeUnit对象
		fmakeUnit.save().then(function() {
			wx.showToast({title: '班级设置流程已提交,请查询审批结果。'}) // 保存成功
		}).catch(function(error) {
			console.log(error);
		});
		}
	}).catch(function(error) {
		console.log(error)                                      //打印错误日志
	});
	},

  onLoad: function () {
	var that = this;
	that.setData({		    		// 获得当前用户
	  user: app.globalData.user,
	  activeIndex : app.globalData.user.mobilePhoneVerified ? "1" : "0"
	});
  }

})