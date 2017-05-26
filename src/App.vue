<template>
  <div id="app">
    <!--<img src="./assets/logo.png">-->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
var screenFit = require('./screenFit')
screenFit.screenFit(document, window)
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
@media screen and (max-width: 320px) {
  body{font-size: 14px;}
}
@media screen and (min-width: 321px) and (max-width: 413px) {
  body{font-size: 16px;}
}
@media screen and (min-width: 414px) and (max-width: 639px) {
  body{font-size: 17px;}
}
@media screen and (min-width: 640px) {
  body{font-size: 18px;}
}
html {
  font-size: 20px;
}
</style>
