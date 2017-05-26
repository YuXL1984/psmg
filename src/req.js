/**
 * Created by Ray on 2017/5/10.
 */
import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

function post (method, data, successCb) {
  var header = {}
  header['X-LC-Id'] = 'kUtHLJ5yjfTWngQ6AoispIe0-gzGzoHsz'
  header['X-LC-Key'] = '1NMjNSW5V1h3SsWXpkdoum6x'
  header['X-Requested-With'] = 'XMLHttpRequest'
  var url = 'https://api.leancloud.cn/1.1/functions/' + method
  Vue.http.post(url, data, {headers: header}).then(function (response) {
    // 响应成功回调
    console.log(response)
    successCb(response.data)
  }, function (response) {
    // 响应错误回调
    console.log('系统错误')
    console.log('response')
  })
}

export {
  post
}
// import {post} from './req'
