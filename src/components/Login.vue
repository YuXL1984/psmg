<template>
  <div id="login">
    <div>
      <img class="headerImage" src="../assets/logo2.png">
    </div>
    <span class="headerText">{{ msg }}</span>
    <div class="userNameView">
      <span>用户登录：</span>
      <input type="text" placeholder="请输入邮件地址" v-model="usernameinput">
    </div>
    <div class="passWordView" v-if="isForgetPassword == false">
      <span>用户密码：</span>
      <input type="password" placeholder="请输入密码" v-model="passwordinput">
    </div>
    <div class="checkPssWordView" v-if="isRegister">
      <span>确认密码：</span>
      <input type="password" placeholder="请再次输入密码" v-model="checkPasswordinput">
    </div>
    <div class="btn">
      <button class="loginBtn" v-if="isLogin" @click="loginClick">登录</button>
      <button class="regBtn" v-if="isLogin" @click="registerClick">注册</button>
    </div>
    <div v-if="isRegister">
      <button class="FGPasswordBtn" v-on:click="goRegisterClick">点击注册</button>
    </div>
    <a href="#" class="FGPassword" v-if="isLogin" v-on:click="FGPasswordClick">忘记密码</a>
    <div v-if="isForgetPassword">
      <button class="FGPasswordBtn" v-on:click="sendMailClick">发送重置请求到邮箱</button>
    </div>
  </div>
</template>

<script>
  var lean = require('../leanReq')
  export default {
    name: 'login',
    data () {
      return {
        msg: '欢迎使用站点管理系统',
        usernameinput: '',
        passwordinput: '',
        checkPasswordinput: '',
        objectId: '',
        isLogin: true,
        isRegister : false,
        isForgetPassword: false,
      }
    },
    methods: {
      loginClick () {
        var userName = this.usernameinput
        var passWord = this.$data.passwordinput
        if (userName.length < 1) {
          alert('用户名不能为空！')
          return
        } else if (passWord.length < 1) {
          alert('密码不能为空！')
          return
        }

        var that = this
        lean.login(userName, passWord, function (userInfo) {
          if (userInfo) {
            var objectId = userInfo.getObjectId()
            that.objectId = objectId
            that.$router.replace({name: 'StationList', params: { objectId: objectId }})
          } else {
            alert('登录失败')
          }
        })
      },
      registerClick () {
        this.isLogin = false
        this.isRegister = true
        this.isForgetPassword = false
      },
      goRegisterClick () {
        this.isLogin = true
        this.isRegister = false
        this.isForgetPassword = false
        var userName = this.$data.usernameinput
        var passWord = this.$data.passwordinput
        var checkPassword = this.$data.checkPasswordinput
        if (userName.length < 1) {
          alert('用户名不能为空！')
          return
        } else if (passWord.length < 1) {
          alert('密码不能为空！')
          return
        } else if (passWord !=checkPassword) {
          alert('两次输入的密码不一致！')
          return
        }
        lean.register(userName, passWord, function (userInfo) {
          if (userInfo) {
            console.log(userInfo)
            alert('注册成功！')
          }
        })
      },
      FGPasswordClick () {
        this.isLogin = false
        this.isRegister = false
        this.isForgetPassword = true
      },
      sendMailClick () {
        this.isLogin = true
        this.isRegister = false
        this.isForgetPassword = false
        var userName = this.$data.usernameinput
        lean.passwordReset(userName, function (userInfo) {
          if (userInfo) {
            console.log(userInfo)
            alert('重置邮件已经发送，请到邮箱中重置密码！')
          }
        })
      }
    }
  }

</script>

<style>
  #login {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .headerImage {
    width: 4rem;
    height: 4rem;
    margin:1rem;
  }
  .headerText {
    margin-bottom: 0.5rem;
    font-size: 0.5rem;
  }
  .loginBtn, .regBtn {
    margin: 0.2rem 0.4rem;
    height: 0.5rem;
    width: 1rem;
    line-height: 0.4rem;
    font-size: 0.2rem;
  }

  .userNameView,.passWordView,.FGPassword,.checkPssWordView{
    margin-top: 0.1rem;
    /*height: 0.4rem;*/
    /*line-height: 0.4rem;*/
    font-size: 0.3rem;
  }
  .FGPasswordBtn {
    margin: 0.5rem;
    /*border: 1rem;*/
    font-size: 0.2rem;
  }
  .userNameView input,.passWordView input,.checkPssWordView input {
    /*margin: 0 0.05rem;*/
    margin-bottom: 0.05rem;
    width: 2rem;
    height: 0.3rem;
    /*line-height: 0.3rem;*/
    font-size: 0.2rem;
  }
  .userNameView span,.passWordView span,.checkPssWordView span {
    height: 0.3rem;
    line-height: 0.3rem;
    font-size: 0.3rem;
  }
</style>
