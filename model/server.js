var AV = require('leanengine');


AV.Cloud.define('wxLogin0', function(request) {
  const appid = 'wxfbbbc7b7f73ae7fb';     //微信小程序appid
const secret = '56639d5b9f3344c4f5ad66099662c333';     //微信小程序secret
var requestWx=require('request');
var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+request.params.code+'&grant_type=authorization_code';
return new Promise( (resolve, reject) => {
  requestWx({ url:wxurl, header: {'content-type':'application/json'},},function(err, res, body) {
    if (!err){
      var wxLoginInfo = JSON.parse(body);
      if (wxLoginInfo.unionid){
        resolve({uId:wxLoginInfo.unionid,oId:wxLoginInfo.openid,session:wxLoginInfo.session_key});
      } else {
        var crypto = require('crypto');
        var wxsk=String(wxLoginInfo.session_key);
        var encryptedData = new Buffer(request.params.encryptedData, 'base64');
        var iv = new Buffer(request.params.iv, 'base64');
        var wxSession = new Buffer(wxsk, 'base64');
        try {                    // 解密
          var decipher = crypto.createDecipheriv('aes-128-cbc', wxSession, iv);    // 设置自动 padding 为 true，删除填充补位
          decipher.setAutoPadding(true);
          var decoded = decipher.update(encryptedData, 'binary', 'utf8');
          decoded = decoded + decipher.final('utf8');
          decoded = JSON.parse(decoded);
          if (decoded.watermark.appid == appid) {
            resolve({uId:decoded.unionId,oId:wxLoginInfo.openid,ip:request.meta.remoteAddresse,session:wxLoginInfo.session_key});
          } else {
            reject('解密后appid不一致');
          }
       } catch (cerr) {
          reject('解密中出现错误：'+cerr);
        }
      }
    } else {
       reject(err);
    }
  }
  );
});
});
AV.Cloud.define('vsmp', function(request) {
  if (request.user){
   var mobile=Number(request.params.mbn);
   var crypto = require('crypto');
   var dtime= Math.round(new Date().getTime()/1000);
   var stime=String(dtime);
   var srandom=parseInt(Math.random()*900000+100000)+"";
   var strsig="appkey=eeeec2344fcff81392c54bf1a50d6fbb&random="+srandom+"&time="+stime+"&mobile="+mobile;
   var s=crypto.createHash('sha256');
   s.update(strsig);
   var ssig=s.digest('hex');
   var data={
     "tel": {"nationcode": "86", "mobile": mobile },
      "type": 0,
      "msg": srandom+"为您的登录验证码，请于10分钟内填写。如非本人操作，请忽略本短信。",
      "sig": ssig,
      "time": dtime,
      "extend": "",
       "ext": ""
     };
  var code = AV.Object.extend('code');
  var validate = new code();
  validate.set('mcode', srandom);
  validate.set('man', mobile);
  return new Promise( (resolve, reject) => {
    if ( mobile==19903518888 ){
      validate.save().then(function (scode) {
        resolve({"mobile":mobile});
      });
    }else{
      var requestMs = require('request');
      requestMs({
        method: 'POST',
        url: 'https://yun.tim.qq.com/v5/tlssmssvr/sendsms?sdkappid=1400023891&random='+srandom,
        json: data,
      }, function(err, res, body) {
        var result=res.toJSON();
        if (result.body.result===0) {
          validate.save().then(function (scode) {
            resolve('mobile');
          });
        }
        if (err) {
          reject('Request failed with response code ' + res.statusCode);
        }
      });
    }
  });
}
});
AV.Cloud.define('vSmsCode', function(request) {
  var query = new AV.Query('code');
query.equalTo('man', Number(request.params.mbn));
query.descending('createdAt');
return query.first().then(function (result) {
  if (result.get('mcode')==request.params.mcode) {
    var userSet=new AV.Query('_User');
    return userSet.get(request.user.id).then(function(mUser){
      mUser.set('mobilePhoneVerified', true );
      return mUser.save().then(function(){
        return '手机号验证成功';
      },function(error){
        return error;
      });
    },function(error){
      return error;
    });
  }else {
    return '1';
  }
},function(error){
  return error;
});
});
AV.Cloud.define('gRole', function(request) {
  const rols={"au01": "592e7f8f7a1ff90032531b62",
"au02": "592e7fb77a1ff90032531b65",
"au10": "592e8107315c1e0050c9b214",
"au11": "592e8148315c1e0050c9b222",
"au12": "592e82627a1ff90032531bb1",
"au20": "592e8343315c1e0050c9b30c",
"au21": "592e8350315c1e0050c9b30d",
"au22": "592e83577a1ff90032531bb4",
"au30": "592e8366315c1e0050c9b314",
"au31": "592e83737a1ff90032531bb5",
"au32": "592e837a315c1e0050c9b31a",
"bu00": "592e8414315c1e0050c9b348",
"bu10": "592e841c7a1ff90032531bb9",
"bu11": "592e84227a1ff90032531bba",
"bu01": "592e842d7a1ff90032531bbc",
"bu02": "592e8438315c1e0050c9b352",
"bu12": "592e8440315c1e0050c9b353",
"bu20": "592e8450315c1e0050c9b354",
"bu21": "592e8458315c1e0050c9b35a",
"bu22": "592e845e315c1e0050c9b35b",
"bu30": "592e84687a1ff90032531bbd",
"bu31": "592e846e7a1ff90032531bbe",
"bu32": "592e84767a1ff90032531bbf",
"cu00": "59ce950d9545040067999f95",
"cu01": "59ce951217d0090063a0f6d3",
"cu02": "59ce9520a22b9d0061333f33",
"cu10": "59ce9576570c35088c8a56b2",
"cu11": "59ce9584128fe1529c2c35f1",
"cu12": "59ce9593ee920a0044c16116",
"cu20": "59ce959817d0090063a0f7ae",
"cu21": "59ce95a2570c35088c8a56ee",
"cu22": "59ce95ac67f356003a603989",
"cu30": "59ce95b8fe88c2003c3ef616",
"cu31": "59ce95c317d0090063a0f7f2",
"cu32": "59ce95cb67f356003a6039bb"};
var sUser = AV.Object.createWithoutData('_User',request.params.operation);
if (request.params.sRole=='sessionuser'){
  var rQuery = AV.Object.createWithoutData('userInit', "59af7119ac502e006abee06a");
  sUser.set('emailVerified', false );
  sUser.set('unit', '0' );
} else {
  var rQuery = AV.Object.createWithoutData('userInit', rols[request.params.rHander+request.params.sRole]);  //设定菜单为
  sUser.set('emailVerified', true );
}
sUser.set('userRolName',request.params.sRole);
sUser.set('userRol',rQuery);
return sUser.save().then(function(){
  return '授权成功';
},function(error){
  return error;
});
});
AV.Cloud.define('gPN', function(request) {
  const appid = 'wxfbbbc7b7f73ae7fb';     //填写微信小程序appid
const secret = '56639d5b9f3344c4f5ad66099662c333';     //填写微信小程序secret
var requestWx=require('request');
var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+request.params.code+'&grant_type=authorization_code';
requestWx({ url:wxurl, header: {'content-type':'application/json'},
  },function(err, res, body) {
  return new Promise( (resolve, reject) => {
	  if (!err){
	  	var wxLoginInfo = JSON.parse(body);
	  	var crypto = require('crypto');
  		var recd=String(request.params.encryptedData);
  		var riv=String(request.params.iv);
  		var wxsk=String(wxLoginInfo.session_key)
  		var encryptedData = new Buffer(recd, 'base64');
  		var iv = new Buffer(riv, 'base64');
  		var wxSession = new Buffer(wxsk, 'base64');
  		try {                    // 解密
  		  var decipher = crypto.createDecipheriv('aes-128-cbc', wxSession, iv);    // 设置自动 padding 为 true，删除填充补位
  	  	  decipher.setAutoPadding(true);
  	  	  var decoded = decipher.update(encryptedData, 'binary', 'utf8');
  	  	  decoded = decoded + decipher.final('utf8');
  	  	  decoded = JSON.parse(decoded);
  	  	  if (decoded.watermark.appid == appid) {
  	  	    resolve(decoded.purePhoneNumber);
	      } else {
	        reject('解密后appid不一致');
	      }
	  	} catch (err) {
	      reject('解密中出现错误：'+err);
	  	}
	  } else {
	  	 reject(err);
	  }
  });
}
);
});
AV.Cloud.define('setRole', function(request) {
  var crypto = require('crypto');

var secretId  = 'AKIDHQL2Uj2X5OTLyNuVFk15yd4GDwQhcV4Q',
    secretKey = 'GJ7i4B4kBNL4ZrvlNlvqXzDCCyXszsb8',
    appid     = '1256932165',
    pexpired  = 86400,
    userid   = 0;
return new Promise( (resolve, reject) => {
  var now = parseInt(Date.now() / 1000),
    rdm = parseInt(Math.random() * Math.pow(2, 32)),
    plainText = 'a=' + appid + '&k=' + secretId + '&e=' + (now+pexpired) + '&t=' + now + '&r=' + rdm + '&u=' + userid + '&f=',
    data = new Buffer(plainText,'utf8'),
    res = crypto.createHmac('sha1',secretKey).update(data).digest(),
    bin = Buffer.concat([res,data]);
    resolve(bin.toString('base64'));
}).catch(function(error){
  reject(error);
});
});
AV.Cloud.define('writers', function(request) {
  var reqweb = require('request');
var Header = {
          'X-LC-Id': "R6LpUANq3zsMDlB7gVTQtPVE-gzGzoHsz",
          'X-LC-Key': "vgc6JQUC11lNUXgdIl7KvVRj",
       //   'Accept': 'application/json'
          'Content-Type': "application/json"
      };
return new Promise( (resolve, reject) => {
  resolve(request.meta)
});
});
AV.Cloud.define('wxLogin2', function(request) {
  const appid = 'wx18e4eaa7777903af';     //微信小程序appid
const secret = 'eca58ab7c018b468a40fe620fec5c751';     //微信小程序secret
var requestWx=require('request');
var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+request.params.code+'&grant_type=authorization_code';
return new Promise( (resolve, reject) => {
  requestWx({ url:wxurl, header: {'content-type':'application/json'},},function(err, res, body) {
    if (!err){
      var wxLoginInfo = JSON.parse(body);
      if (wxLoginInfo.unionid){
        resolve({uId:wxLoginInfo.unionid,oId:wxLoginInfo.openid,session:wxLoginInfo.session_key});
      } else {
        var crypto = require('crypto');
        var wxsk=String(wxLoginInfo.session_key);
        var encryptedData = new Buffer(request.params.encryptedData, 'base64');
        var iv = new Buffer(request.params.iv, 'base64');
        var wxSession = new Buffer(wxsk, 'base64');
        try {                    // 解密
          var decipher = crypto.createDecipheriv('aes-128-cbc', wxSession, iv);    // 设置自动 padding 为 true，删除填充补位
          decipher.setAutoPadding(true);
          var decoded = decipher.update(encryptedData, 'binary', 'utf8');
          decoded = decoded + decipher.final('utf8');
          decoded = JSON.parse(decoded);
          if (decoded.watermark.appid == appid) {
            resolve({uId:decoded.unionId,oId:wxLoginInfo.openid,ip:request.meta.remoteAddresse,session:wxLoginInfo.session_key});
          } else {
            reject('解密后appid不一致');
          }
       } catch (cerr) {
          reject('解密中出现错误：'+cerr);
        }
      }
    } else {
       reject(err);
    }
  }
  );
});
});
