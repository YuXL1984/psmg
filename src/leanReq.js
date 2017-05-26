/**
 * Created by Ray on 2017/5/11.
 */
import AV from 'leancloud-storage'
// import router from './router/index'

AV.init({
  appId: process.env.LEANCLOUD_APP_ID || 'kUtHLJ5yjfTWngQ6AoispIe0-gzGzoHsz',
  appKey: process.env.LEANCLOUD_APP_KEY || '1NMjNSW5V1h3SsWXpkdoum6x'
})

function postFromLeanCloud (method, data, successCb) {
  AV.Cloud.run(method, data).then(function (response) {
    // 响应成功回调
    successCb(JSON.parse(response))
    // console.log(response)
  }, function (response) {
    // 响应错误回调
    // console.log(response)
    console.log('系统错误')
  })
}

function register (userName, passWord, successCb) {
  // 新建 AVUser 对象实例
  var user = new AV.User();
  // 设置用户名
  user.setUsername(userName);
  // 设置密码
  user.setPassword(passWord);
  // 设置邮箱
  user.setEmail(userName);
  user.signUp().then(function (loginedUser) {
    successCb(loginedUser)
    console.log(loginedUser);
  }).catch (function (error) {
    if (error.code === 125) {
      alert('邮箱地址无效')
    } else if (error.code === 203) {
      alert('改邮箱地址已经被占用')
    } else {
      alert('未知错误，请联系管理员！')
    }
    console.error(error.code)
    console.error(error.message)
  })
}

function passwordReset(userName, successCb) {
  AV.User.requestPasswordReset(userName).then(function (success) {
    successCb(success)
    console.log(success);
  }, function (error) {
    console.log(error);
  });
}

function login (userName, passWord, successCb) {
  AV.User.logIn(userName, passWord).then(function (loginedUser) {
    successCb(loginedUser)
  }).catch(function (error) {
    if (error.code === 211) {
      alert('用户未注册！')
    } else if (error.code === 210) {
      alert('用户密码错误！')
    } else if (error.code === 1) {
      alert('登录失败次数超过限制,15分钟后重试！')
    } else {
      alert('未知错误，请联系管理员！')
    }
    // console.error(error.code)
    // console.error(error.message)
  })
}

function currentStatus () {
  var currentUser = AV.User.current()
  if (currentUser) {
    // 跳转到首页
    console.log('用户已登录')
  } else {
    // currentUser 为空时，可打开用户注册界面…
    console.log('用户未登录')
  }
  return currentUser
}

function logOut () {
  AV.User.logOut()
  // 现在的 currentUser 是 null 了
  var currentUser = AV.User.current()
  if (currentUser) {
    console.log('用户未登出')
  } else {
    console.log('用户已经登出')
  }
  return currentUser
}

export {
  login,
  // loadStationData,
  currentStatus,
  postFromLeanCloud,
  logOut,
  register,
  passwordReset,
}
// "vue-resource":"1.3.1",
// "leancloud-storage":"2.2.1",
