<template>
  <div id="stationlist">
    <div>
      <span class="listHeaderViewText">站点列表</span>
    </div>
    <div class="listHeaderView">
      <button class="btnClass" v-on:click="loginOrLogOutClick">{{ loginOrlogout }}</button>
      <div class="searchView">
        <button class="searchAndShowBtn" v-on:click='allBtnClick'>{{showDataBtnTitle}}</button>
        <div class="searchInput">
          <input class="searchTextInput" type="text" placeholder='请输入搜索内容' v-model="searchInput">
          <div class="searchRadioInput">
            <input type="radio" name="searchType" value="stationName" id="stationName" v-model="searchType">按名称搜索
            <input type="radio" name="searchType" value="stationCode" id="stationCode" v-model="searchType">按编号搜索
          </div>
        </div>
        <button class="searchAndShowBtn" v-on:click='searchClick'>开始搜索</button>
      </div>
      <button class="btnClass" v-on:click="addStationClick">添加</button>
    </div>
    <div class="list" v-for="(item ,index) in stationList" v-on:click="stationClick(index)" :key="item.objectId">
      <div class="stationNameAndNumber">
        <span class="stationListName">站点名称：{{ item.stationName }}</span>
        <span class="stationListCode">站点编号：{{ item.stationCode }}</span>
      </div>
      <span>站点地址：{{ item.stationAddress }}</span>
    </div>
  </div>
</template>

<script>
  var lean = require('../leanReq')
  var compare = function (obj1, obj2) {
    var val1 = obj1.stationCode;
    var val2 = obj2.stationCode;
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  }
  export default {
    name: 'stationlist',
    data () {
      return {
        loginOrlogout: '',
        stationList: null,
        isLogin: false,
        userId: '',
        objectId: '',
        searchInput: '',
        isShowAll: false,
        showDataBtnTitle:'显示全部',
        searchType: 'stationName',
      }
    },
    methods: {
      loginOrLogOutClick () {
        if (this.isLogin) {
          var currentStatus = lean.logOut()
          if (!currentStatus) {
            this.isLogin = false
            alert('用户注销成功')
          } else {
            alert('用户注销失败')
            return
          }
        }
        this.$router.replace('./Login')
      },
      getStationData () {
        var currentStatus = lean.currentStatus()
        if (currentStatus) {
          var that = this
          that.isLogin = true
          that.userId = currentStatus.id
          that.loginOrlogout = '注销'
          var stationName = that.searchInput
          var userId = that.userId
          lean.postFromLeanCloud('loadStationDataForUserId',{'userId': userId}, function (resData) {
            var stationList = resData['resultData']
            that.stationList =stationList.sort(compare)
          })
        } else {
          this.loginOrlogout = '登录'
          this.$router.replace('./Login')
        }
        this.objectId = this.$route.params.objectId
      },
      stationClick (index) {
        var station = this.stationList[index]
//        this.stationId = station.objectId
        var stationId = station.objectId
        var stationName = station.stationName
        var stationCode = station.stationCode
        var stationAddress = station.stationAddress
        var positionData = station.positionData
//        console.log(stationId)
//        console.log(stationName)
//        console.log(stationAddress)
//        console.log(positionData)
        this.$router.push({name: 'StationDetails', params: { stationId: stationId ,stationName: stationName ,stationAddress: stationAddress ,stationCode: stationCode ,positionData: positionData}})
      },
      searchClick () {
        if (this.searchInput.length < 1) {
          alert('请输入要搜索的站点名称')
          return
        }
        var that = this
        var searchInput = that.searchInput
        if (that.searchType == 'stationName') {
//          console.log(that.searchType)
          lean.postFromLeanCloud('searchStationDataBlurryForStationName', {'stationName': searchInput}, function (resData) {
//          console.log(resData)
            var code = resData['code']
            var resultData = resData['resultData']
            var errorMsg = resData['error']
            if (code === '1000') {
              var searchList = resultData
              if (searchList && searchList.length > 0) {
                that.stationList = that.stationList.splice(0, that.stationList.length)
                that.stationList = searchList.sort(compare)
              }
            } else if (code === '1002') {
              alert(errorMsg)
            } else {
              alert('出现未知错误，请刷新页面重试！')
            }
          })
        } else if (that.searchType == 'stationCode') {
//            console.log(that.searchType)
          var stationCode = searchInput.toUpperCase()
//          console.log(stationCode)
          lean.postFromLeanCloud('searchStationDataBlurryForStationCode', {'stationCode': stationCode}, function (resData) {
//          console.log(resData)
            var code = resData['code']
            var resultData = resData['resultData']
            var errorMsg = resData['error']
            if (code === '1000') {
              var searchList = resultData
              if (searchList && searchList.length > 0) {
                that.stationList = that.stationList.splice(0, that.stationList.length)
                that.stationList = searchList.sort(compare)
              }
            } else if (code === '1002') {
              alert(errorMsg)
            } else {
              alert('出现未知错误，请刷新页面重试！')
            }
          })
        }
      },
      allBtnClick () {
        var that = this
        var userId = that.userId
        if (this.isShowAll) {
          this.isShowAll = false
          this.showDataBtnTitle = '显示全部'
          lean.postFromLeanCloud('loadStationDataForUserId',{'userId': userId}, function (resData) {
            var stationList = resData['resultData']
            that.stationList =stationList.sort(compare)
          })

        } else {
          this.isShowAll = true
          this.showDataBtnTitle = '显示个人'
          lean.postFromLeanCloud('loadStationData',{'userId': userId, 'stationName': 'all'}, function (resData) {
            var stationList = resData['resultData']
            that.stationList =stationList.sort(compare)
          })
        }
      },
      addStationClick () {
        this.$router.push({name: 'AddStation', params: { objectId: this.userId }})
      }
    },
    beforeCreate () {
    },
    mounted () {
      this.getStationData()
    },
    created () {
    },
    watch:{
        searchType(curVal,oldVal) {
            if (curVal == 'stationCode') {
              this.searchInput = 'HD'
            } else {
              this.searchInput = ''
            }
        }
    }
  }
</script>

<style>
  #stationlist {
    background-color: white;
  }
  .listHeaderViewText {
    height: 0.6rem;
    line-height: 0.6rem;
    font-size: 0.5rem;
  }
  .listHeaderView {
    margin: 0 0.1rem;
    padding: 0 0.1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border: 2px solid #000;
  }

  .btnClass {
    /*margin: 0rem 0 0.1rem 0;*/
    width: 1rem;
    height: 0.5rem;
    font-size: 0.2rem;
    border-radius: 5px;
    background-color: white;
    border: 2px solid #000;
  }

  .searchView {
    padding: 0.05rem 0;
    display: flex;
    flex-direction: row;
    /*border: 1px solid #efeff4;*/
  }
  .searchTextInput {
    width: 2.5rem;
    height: 0.25rem;
    display: flex;
    flex-direction: column;
    margin-top: 0.05rem;
    font-size: 0.15rem;

  }
  .searchRadioInput {
    width: 2.5rem;
    height: 0.16rem;
    line-height: 0.16rem;
    font-size: 0.15rem;
  }
  .searchRadioInput input{
    margin:0.05rem 0.02rem 0 0.1rem;
    border: 1px solid #000;
  }
  .searchAndShowBtn {
    width: 0.8rem;
    height: 0.5rem;
    line-height: 0.5rem;
    /*height: .3rem;*/
    margin: 0.05rem 0.3rem;
    border-radius: 5px;
    background-color: white;
    border: 2px solid #000;
    font-size: 0.15rem;
    padding: 0;
  }
  .list {
    margin: 0.1rem 0.1rem;
    padding: 0.1rem;
    display: flex;
    flex-direction: column;
    text-align: left;
    border: 1px solid #000000;
    border-radius: 5px;
    font-size: 0.2rem;
  }
  .stationNameAndNumber {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 0.2rem;
  }
</style>
