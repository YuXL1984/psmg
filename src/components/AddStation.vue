<template>
  <div id="addStationView">
    <div class="headerView">
      <button class="btnClass" v-on:click="backClick">返回</button>
      <span class="headerViewText">添加站点</span>
      <button class="btnClass" v-on:click="saveClick">保存</button>
    </div>
    <div class="infoInputView">
      <div class="addInputView">
        <div class="nameAndCodeView">
          <span class="nameSpan">站点名称：</span>
          <input class="nameInput" type="text" v-model="stationName" placeholder="请输入站点名称">
          <span class="codeSpan">站点编号：</span>
          <input  class="codeInput" type="text" v-model="stationCode" placeholder="请输入站点编号">
        </div>
        <div class="AddressView">
          <span>站点地址：</span>
          <input type="text" v-model="stationAddress" placeholder="请输入站点地址">
        </div>
      </div>
      <div>
        <div class="searchAddressView">
          <input type="text" v-model="mapSearchInput" placeholder="请输入地址进行搜索">
          <div class="searchBtn" v-on:click="searchMapClick">搜索</div>
        </div>
      </div>
    </div>
    <div id="container"></div>
  </div>
</template>

<script>
  var lean = require('../leanReq')
  var map
  var marker
  export default {
    name: 'addStationView',
    data () {
      return {
        msg: '',
        userId: '',
        stationName: '',
        stationCode: 'HD',
        stationAddress: '',
        mapSearchInput: '',
        positionResult: null,
        positionData: new Array(),
        markerList: new Array(),
        geoAddress: ''
      }
    },
    mounted () {
      map = new AMap.Map("container", {
        resizeEnable: true,
        zoom: 20,
        center: [116.329878, 39.9655]
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType'],
        function () {
          map.addControl(new AMap.ToolBar());
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.MapType());
        });
      this.geoLocationClick()
    },
    created () {
      this.userId = this.$route.params.objectId
      if (!this.userId) {
        this.$router.go(-1)
      }
    },
    methods: {
      searchMapClick () {
        var that = this
        that.stationName = that.mapSearchInput
        var searchStr = ''
        if (that.mapSearchInput.length < 1) {
          searchStr = that.geoAddress
        } else {
          searchStr = that.mapSearchInput
        }
        AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker) {
          map.plugin('AMap.Geocoder', function () {
            var geocoder = new AMap.Geocoder({
              city: "010", //城市，默认：“全国”
              radius: 1000 //范围，默认：500
            });
            geocoder.getLocation(searchStr, function (status, result) {
              if (status === 'complete' && result.info === 'OK') {
                var positionPicker = new PositionPicker({
                  mode: 'dragMap',
                  map: map
                });
                positionPicker.start(result.geocodes[0].location)
                positionPicker.on('success', function (positionResult) {
                  that.positionResult = positionResult
                  var lng = positionResult.position.lng
                  var lat = positionResult.position.lat
//                  that.positionData = lng + ',' + lat
//                  console.log(that.positionData)
                  if (that.positionData.length > 0) {
                    that.positionData[0] = lng
                    that.positionData[1] = lat
                  } else {
                    that.positionData.push(lng,lat)
                  }
                  that.stationAddress = positionResult.address
                });
              }
            });
          })
        });
      },
      backClick () {
        this.$router.go(-1)
      },
      saveClick () {
        var userId = this.userId
        var stationName = this.stationName
        var stationAddress = this.stationAddress
        var stationCode = this.stationCode.toUpperCase()
        var positionData = this.positionData
        if (stationName.length < 1) {
          alert('站点名称不能为空')
          return
        } else if (stationAddress.length < 1) {
          alert('站点地址不能为空')
          return
        }
        lean.postFromLeanCloud('addStationDataForUserId', {'userId': userId, 'stationName': stationName, 'stationAddress': stationAddress,'stationCode': stationCode,'positionData': positionData}, function (resData) {
//          console.log(resData)
          var code = resData['code']
          var resultData = resData['resultData']
          var errorMsg = resData['error']
          if (code === '1000') {
            alert('添加成功')
          } else if (code === '1002') {
            alert(errorMsg)
          } else {
            alert('出现未知错误，请刷新页面重试！')
          }
        })
      },
      geoLocationClick () {
        var that = this
        map.plugin('AMap.Geolocation', function() {
          var geolocation
          geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: false,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            GeoLocationFirst: true
          });
//          console.log(geolocation)
          map.addControl(geolocation);
          geolocation.getCurrentPosition(function(status,result){
            if (status == 'complete') {
              if (result) {
                that.geolInfoMsg='定位成功'
                that.geolBtnInfoMsg = '重新定位'
                that.geoLocationOK = true
                var lng = result.position.getLng()
                var lat = result.position.getLat()
                if (that.geolocationData) {
                  that.geolocationData[0] = lng
                  that.geolocationData[1] = lat
                } else {
                  var geolocationData = [lng,lat]
                  that.geolocationData = geolocationData
                }
                that.stationAddress = result.formattedAddress
                that.geoAddress = result.formattedAddress
                that.searchMapClick()
              }
            } else if (status == 'error') {
              that.geolInfoMsg='定位失败'
              that.geolBtnInfoMsg = '重新定位'
              that.geoLocationOK = false
            } else {
              that.geolInfoMsg='定位失败'
              that.geolBtnInfoMsg = '重新定位'
              that.geoLocationOK = false
            }
          })
        });
      },
    }
  }
</script>

<style>

  #addStationView {
    background-color: white;
    display: flex;
    flex-direction: column;
  }

  .headerView {
    margin: 0 0.1rem;
    padding: 0 0.1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border: 2px solid #efeff4;
  }

  .headerViewText {
    margin: 0.1rem 0;
    height: 0.5rem;
    line-height: 0.5rem;
    font-size: 0.4rem;
  }

  .btnClass {
    margin: 0.1rem 0;
    width: 1rem;
    height: 0.5rem;
    font-size: 0.2rem;
    border-radius: 5px;
    background-color: white;
  }

  .infoInputView {
    margin: 0 0.1rem;
    padding: 0.1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    border: 1px solid #efeff4;
    border-radius: 5px;
    font-size: 0.2rem;
  }

  .addInputView {
    /*width: auto;*/
    padding: 0 0.1rem;
    height: 0.5rem;
    display: flex;
    flex-direction: column;
    text-align: left;
    border: 1px solid #efeff4;
    border-radius: 5px;
    font-size: 0.2rem;
  }
  .nameAndCodeView {
    display: flex;
    flex-direction: row;
    margin: 0.01rem 0;
    height: 0.22rem;
    text-align: left;
    font-size: 0.15rem;
  }
  .nameSpan {
    width: 0.75rem;
  }
  .nameInput {
    width: 3rem;
  }
  .codeSpan {
    width: 0.75rem;
    margin-left: 0.1rem;
  }
  .codeInput {
    width: 1rem;
  }

  .AddressView {
    margin: 0.01rem 0;
    height: 0.22rem;
    font-size: 0.15rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
  .AddressView input {
    width: 5rem;
  }
  .AddressView span {
    width: 0.75rem;
  }
  #container {
    height: 13rem;
  }

  .searchAddressView {
    display: flex;
    flex-direction: row;
    height: 0.5rem;
  }

  .searchAddressView input {
    /*width: 4rem;*/
    font-size: 0.2rem;
    width: 1.8rem;
  }

  .searchBtn {
    width: 0.8rem;
    height: 0.5rem;
    line-height: 0.5rem;
    border: 1px solid #efeff4;
    text-align: center;
  }
</style>
