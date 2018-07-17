var host = 'https://wxlogin.sxlyqdzsw.cn/prepub'
module.exports = {
  signAiParmas: {
    "app_id": '10000',
    "time_stamp": '1493449657',
    "nonce_str": '20e3408a79',
    'key1': '腾讯AI开放平台',
    'key2': '示例仅供参考'
  },
  qcloudConf: {
    service: {
      host,
      // 登录地址，用于建立会话
      loginUrl: `${host}/l2`,

      // 测试的请求地址，用于测试会话
      requestUrl: `${host}/user`,

      // 测试的信道服务地址
      tunnelUrl: `${host}/tunnel`,

      // 上传图片接口
      uploadUrl: `${host}/upload`
    }
  }
}
