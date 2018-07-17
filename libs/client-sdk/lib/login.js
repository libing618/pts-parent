var constants = require('./constants');
var Session = require('./session');

/***
 * @class
 * 表示登录过程中发生的异常
 */
var LoginError = (function () {
    function LoginError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    LoginError.prototype = new Error();
    LoginError.prototype.constructor = LoginError;

    return LoginError;
})();

/**
 * 微信登录，获取 code 和 encryptData
 */

var noop = function noop() {};
var defaultOptions = {
    method: 'GET',
    success: noop,
    fail: noop,
    loginUrl: require('../../../confqcloud').qcloudConf.service.loginUrl,
    withCredentials: true,
    lang: 'zh_CN',
};



/* @method
 * 服务器登录，以获得登录会话
 *
 * @param {Object} options 登录配置
 * @param {string} options.loginUrl 登录使用的 URL，服务器应该在这个 URL 上处理登录请求
 * @param {string} [options.method] 请求使用的 HTTP 方法，默认为 "GET"
 * @param {Function} options.success() 登录成功后的回调函数
 * @param {Function} options.fail(error) 登录失败后的回调函数，参数 error 错误信息
 */
var requestLogin = function requestLogin(options) {
  return new Promise((resolve, reject) =>{
    if (!/http/.test(defaultOptions.loginUrl)) {
      reject(new LoginError(constants.ERR_INVALID_PARAMS, '登录错误：缺少登录地址，请通过 setLoginUrl() 方法设置登录地址'));
      return;
    };
    // 构造请求头，包含 code、encryptedData 和 iv
    var code = options.code;
    var encryptedData = options.encryptedData;
    var iv = options.iv;
    var header = {};

    header[constants.WX_HEADER_CODE] = code;
    header[constants.WX_HEADER_ENCRYPTED_DATA] = encryptedData;
    header[constants.WX_HEADER_IV] = iv;

    // 请求服务器登录地址，获得会话信息
    wx.request({
      url: defaultOptions.loginUrl,
      header: header,
      method: defaultOptions.method,

      success: function (res) {        // 成功地响应会话信息
        if (res) {
          if (res.oId) {
            // 可直接存res.skey，存res是为了兼容login方法。
            Session.set(res);
            resolve(res)
          } else {
            var errorMessage = '登录失败(' + res.error + ')：' + (res.message || '未知错误');
            var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
            reject(noSessionError);
          }

          // 没有正确响应会话信息
        } else {
          var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, JSON.stringify(res));
          reject(noSessionError);
        }
      },

      // 响应错误
      fail: function (loginResponseError) {
        var error = new LoginError(constants.ERR_LOGIN_FAILED, '登录失败，可能是网络错误或者服务器发生异常');
        reject(error);
      },
    });
  })




}

module.exports = {
    LoginError: LoginError,
    requestLogin: requestLogin
};
