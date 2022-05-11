const proxy = require('http-proxy-middleware')

module.exports = function expressMiddleware (router) {
  // router.use('/articles', proxy({
  //   target:       'https://',
  //   ws:           true,
  //   changeOrigin: true,
  //   pathRewrite:  {
  //     '/articles': '/bin'
  //   }
  // }))
}
