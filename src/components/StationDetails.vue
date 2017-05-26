<template>
  <div id="stationDetailView">
    <div class="headerView">
      <button class="btnClass" v-on:click="backClick">返回</button>
      <span class="headerViewText">站点详情</span>
      <button class="btnClass" v-on:click="updateClick">更新</button>
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
      <div class="toolsBtnView">
        <!--<input type="text" v-model="mapSearchInput" placeholder="请输入地址进行搜索">-->
        <span class="toolsBtn">{{geolInfoMsg}}</span>
        <div class="toolsBtn" v-on:click="geoLocationClick">{{geolBtnInfoMsg}}</div>
        <div class="toolsBtn1" v-if="geoLocationOK" v-on:click="walkingClick">步行</div>
        <div class="toolsBtn1" v-if="geoLocationOK" v-on:click="drivingClick">驾车</div>
      </div>
    </div>
    <div id="container"></div>
    <div id="panel"></div>
  </div>
</template>

<script>
  var lean = require('../leanReq')
  var map
  export default {
    name: 'stationDetailView',
    data () {
      return {
        stationId: '',
        stationName: '',
        stationCode: '',
        stationAddress: '',
        positionData: new Array(),
        havePositionData: false,
        positionResult: null,
        geolInfoMsg: '定位信息',
        geolBtnInfoMsg: '开始定位',
        geolocationData: new Array(),
        geolAddress: '',
        geoLocationOK: false
      }
    },
    methods: {
      backClick () {
        this.$router.go(-1)
      },
      updateClick () {
        var stationId = this.stationId
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
        lean.postFromLeanCloud('updateStationDataForOid', {'objectId': stationId, 'newStationName': stationName, 'newStationAddress': stationAddress,'newStationCode': stationCode,'newPositionData': positionData}, function (resData) {
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
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
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
                that.geolAddress = result.formattedAddress
//                alert(that.geolocationData[0])
//                alert(result.formattedAddress)
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
  //          console.log('status='+status)
  //          alert('status='+status)
  //          console.log('result='+result)
  //          alert('result='+result)
  //          console.log(result)
  //          alert(result.position)
          })
        });
      },
      walkingClick () {
        //步行导航
        var walking = new AMap.Walking({
          map: map,
          panel: "panel"
        });
        if (this.positionData.length > 0 && this.geolocationData.length >0) {
//          console.log(this.positionData)
//          console.log(this.geolocationData)
          //根据起终点坐标规划步行路线
          walking.search(this.geolocationData, this.positionData);
        } else if (this.geolAddress.length > 0 && this.stationAddress.length > 0) {
          var startAddress = this.geolAddress
          var endAddress = this.stationAddress
          walking.search([
            {keyword: startAddress,city:'北京'},
            {keyword: endAddress,city:'北京'}
          ]);
        } else {
            alert('坐标和地址异常')
        }

      },
      drivingClick () {
        //构造路线导航类
        map.getMarks().clear()
        var driving = new AMap.Driving({
          map: map,
          panel: "panel"
        });
        if (this.positionData.length > 0 && this.geolocationData.length >0) {
//          console.log(this.positionData)
//          console.log(this.geolocationData)
          //根据起终点坐标规划步行路线
          driving.search(this.geolocationData, this.positionData);
        } else if (this.geolAddress.length > 0 && this.stationAddress.length > 0) {
          var startAddress = this.geolAddress
          var endAddress = this.stationAddress
          driving.search([
            {keyword: startAddress,city:'北京'},
            {keyword: endAddress,city:'北京'}
          ]);
        } else {
          alert('坐标和地址异常')
        }

      }
    },
    mounted () {
        var that = this
        if (this.havePositionData) {
          //有坐标
          console.log('有坐标')
          var lng = that.positionData[0]
          var lat = that.positionData[1]
          map = new AMap.Map("container", {
            resizeEnable: true,
            zoom: 20,
            center: [lng, lat]
          });
          AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType','AMap.Driving','AMap.Walking'],
            function () {
              map.addControl(new AMap.ToolBar());
              map.addControl(new AMap.Scale());
              map.addControl(new AMap.MapType());
              map.addControl(new AMap.Driving());
              map.addControl(new AMap.Walking());
            });
          AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker) {
            map.plugin('AMap.Geocoder', function () {
              var geocoder = new AMap.Geocoder({
                city: "010", //城市，默认：“全国”
                radius: 1000 //范围，默认：500
              });
              var positionPicker = new PositionPicker({
                mode: 'dragMarker',
                map: map
              });
              positionPicker.start()
              positionPicker.on('success', function (positionResult) {
                that.positionResult = positionResult
                var lng = positionResult.position.lng
                var lat = positionResult.position.lat
                if (that.positionData.length > 0) {
                  that.positionData[0] = lng
                  that.positionData[1] = lat
                } else {
                  that.positionData.push(lng,lat)
                }
                that.stationAddress = positionResult.address
              });
            })
          });

        } else {
          //没有坐标
          console.log('没有坐标')
          map = new AMap.Map("container", {
            resizeEnable: true,
            zoom: 16,
            center: [116.329878, 39.9655]
          });
          AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType','AMap.Driving','AMap.Walking'],
            function () {
              map.addControl(new AMap.ToolBar());
              map.addControl(new AMap.Scale());
              map.addControl(new AMap.MapType());
              map.addControl(new AMap.Driving());
              map.addControl(new AMap.Walking());
            });
          AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker) {
            map.plugin('AMap.Geocoder', function () {
              var geocoder = new AMap.Geocoder({
                city: "010", //城市，默认：“全国”
                radius: 1000 //范围，默认：500
              });
              geocoder.getLocation(that.stationAddress, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                  var positionPicker = new PositionPicker({
                    mode: 'dragMarker',
                    map: map
                  });
                  positionPicker.start(result.geocodes[0].location)
                  positionPicker.on('success', function (positionResult) {
                    that.positionResult = positionResult
                    var lng = positionResult.position.lng
                    var lat = positionResult.position.lat
                    if (that.positionData) {
                      that.positionData[0] = lng
                      that.positionData[1] = lat
                    } else {
                      var positionData = [lng,lat]
                      that.positionData = positionData
                    }
                    that.stationAddress = positionResult.address
                  });
                }
              });
            })
          });
        }
    },
    created () {
      this.stationId = this.$route.params.stationId
      this.stationName = this.$route.params.stationName
      this.stationAddress = this.$route.params.stationAddress
      this.stationCode = this.$route.params.stationCode
      this.positionData = this.$route.params.positionData
      if (!this.stationAddress) {
        this.$router.go(-1)
      } else {
          if (!this.positionData ) {
            this.havePositionData = false
          } else {
            this.havePositionData = true
//            console.log(this.havePositionData )
          }
      }
    }
  }
</script>

<style>
  #stationDetailView {
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

  /*.infoInputView {*/
    /*margin: 0 0.1rem;*/
    /*padding: 0.1rem;*/
    /*display: flex;*/
    /*flex-direction: row;*/
    /*justify-content: space-between;*/
    /*text-align: left;*/
    /*border: 1px solid #efeff4;*/
    /*border-radius: 5px;*/
    /*font-size: 0.2rem;*/
  /*}*/

  /*.addInputView {*/
    /*!*width: auto;*!*/
    /*padding: 0 0.1rem;*/
    /*height: 0.5rem;*/
    /*display: flex;*/
    /*flex-direction: column;*/
    /*text-align: left;*/
    /*border: 1px solid #efeff4;*/
    /*border-radius: 5px;*/
    /*font-size: 0.2rem;*/
  /*}*/

  /*.nameView, .AddressView {*/
    /*margin: 0.01rem 0;*/
    /*height: 0.22rem;*/
    /*font-size: 0.15rem;*/
    /*display: flex;*/
    /*flex-direction: row;*/
    /*justify-content: flex-start;*/
  /*}*/

  /*.nameView input, .AddressView input {*/
    /*width: 4rem;*/
  /*}*/

  #container {
    height: 13rem;
  }

  .toolsBtnView {
    display: flex;
    flex-direction: row;
    height: 0.5rem;
  }

  .searchAddressView input {
    /*width: 4rem;*/
    font-size: 0.2rem;
  }

  .toolsBtn {
    width: 1rem;
    height: 0.5rem;
    line-height: 0.5rem;
    border: 1px solid #efeff4;
    text-align: center;
  }
  .toolsBtn1 {
    width: 0.6rem;
    height: 0.5rem;
    line-height: 0.5rem;
    border: 1px solid #efeff4;
    text-align: center;
  }
  #panel {
    position: fixed;
    background-color: white;
    max-height: 90%;
    overflow-y: auto;
    bottom: 0.1rem;
    left: 0.1rem;
    width: 4rem;
  }
</style>
