<template>
  <div class="city_body">
    <div class="city_list">
      <Loading v-if="isLoading"/>
      <Scroller v-else ref="city_List">
        <div>
          <div class="city_hot">
            <h2>热门城市</h2>
            <ul class="clearfix">
              <li v-for="item in hotList" :key="item.id" @tap="handleToCity(item.nm,item.id)">{{item.nm}}</li>
            </ul>
          </div>
          <div class="city_sort" ref="city_sort">
            <div v-for="item in cityList" :key="item.index">
              <h2>{{item.index}}</h2>
              <ul>
                <li v-for="itemList in item.list" :key="itemList.id" @tap="handleToCity(itemList.nm,itemList.id)">
                  {{itemList.nm}}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Scroller>
    </div>
    <div class="city_index">
      <ul>
        <li v-for="(item,index) in cityList" :key="item.index" @touchstart="handleToIndex(index)">{{item.index}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'City',
  data () { // 在data中定义响应式数据，把经过处理后取得的cityList与hotList渲染到页面上去
    return {
      cityList: [],
      hotList: [],
      isLoading: true
    }
  },
  mounted () {
    let cityList = window.localStorage.getItem('cityList')
    let hotList = window.localStorage.getItem('hotList')

    if (cityList && hotList) {
      this.cityList = JSON.parse(cityList)
      this.hotList = JSON.parse(hotList)
      this.isLoading = false
    } else {
      this.axios.get('/api/cityList').then((res) => {
        var msg = res.data.msg // 判断数据请求是否成功
        if (msg === 'ok') { // 如果数据请求成功，再进行下一步操作
          this.isLoading = false
          var cities = res.data.data.cities // data是城市列表信息
          // 数据改造的理想格式：[{index:'A',list:[{nm:'阿城'，id:123}]}]
          var { cityList, hotList } = this.formatCityList(cities) // 把经过处理后的城市列表以及热门城市列表取出来，使用对象的结构法
          this.cityList = cityList
          this.hotList = hotList
          window.localStorage.setItem('cityList', JSON.stringify(cityList))
          window.localStorage.setItem('hotList', JSON.stringify(hotList))
        }
      })
    }
  },
  methods: {
    // 定义一个函数，专门用来处理城市的数据格式
    formatCityList (cities) {
      var cityList = [] // cityList是城市的分类
      var hotList = [] // 热门城市集

      for (var k = 0; k < cities.length; k++) {
        if (cities[k].isHot === 1) {
          hotList.push(cities[k])
        }
      }

      for (var i = 0; i < cities.length; i++) {
        var firstLetter = cities[i].py.substring(0, 1).toUpperCase() // 各个城市的拼音首字母
        if (toCom(firstLetter)) { // 新添加index
          cityList.push({ index: firstLetter, list: [{ nm: cities[i].nm, id: cities[i].id }] })
          // 新添加到cityList中的元素格式如上，有首字母，城市名以及城市id
        } else { // 累加到已有index中
          for (var j = 0; j < cityList.length; j++) {
            if (cityList[j].index === firstLetter) {
              cityList[j].list.push({ nm: cities[i].nm, id: cities[i].id })
            }
          }
        }
      }
      // 对cityList按字母顺序进行排序
      cityList.sort((n1, n2) => {
        if (n1.index > n2.index) {
          return 1
        } else {
          return -1
        }
      })

      function toCom (firstLetter) { // 该函数用于判断城市有没有存在于结果集当中
        for (var i = 0; i < cityList.length; i++) {
          if (cityList[i].index === firstLetter) {
            return false
          }
        }
        return true
      }

      return { // 以对象的形式返回城市列表以及热门城市列表
        cityList,
        hotList
      }
    },
    handleToIndex (index) { // 使用$ref方法获得city_sort
      var h2 = this.$refs.city_sort.getElementsByTagName('h2')
      // city_sort的父元素的滚动距离如下
      // this.$refs.city_sort.parentNode.scrollTop = h2[index].offsetTop
      // 在父组件中调用子组件的方法，实现点击跳转的功能
      this.$refs.city_List.toScrollTop(-h2[index].offsetTop)
    },
    handleToCity (nm, id) {
      this.$store.commit('city/CITY_INFO', { nm, id })
      window.localStorage.setItem('nowNm', nm)
      window.localStorage.setItem('nowID', id)
      this.$router.push('movie/nowPlaying')
    }
  }
}
</script>

<style scoped>
  #content .city_body {
    margin-top: 45px;
    display: flex;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .city_body .city_list {
    flex: 1;
    overflow: auto;
    background: #FFF5F0;
  }

  .city_body .city_list::-webkit-scrollbar {
    background-color: transparent;
    width: 0;
  }

  .city_body .city_hot {
    margin-top: 20px;
  }

  .city_body .city_hot h2 {
    padding-left: 15px;
    line-height: 30px;
    font-size: 14px;
    background: #F0F0F0;
    font-weight: normal;
  }

  .city_body .city_hot ul li {
    float: left;
    background: #fff;
    width: 29%;
    height: 33px;
    margin-top: 15px;
    margin-left: 3%;
    padding: 0 4px;
    border: 1px solid #e6e6e6;
    border-radius: 3px;
    line-height: 33px;
    text-align: center;
    box-sizing: border-box;
  }

  .city_body .city_sort div {
    margin-top: 20px;
  }

  .city_body .city_sort h2 {
    padding-left: 15px;
    line-height: 30px;
    font-size: 14px;
    background: #F0F0F0;
    font-weight: normal;
  }

  .city_body .city_sort ul {
    padding-left: 10px;
    margin-top: 10px;
  }

  .city_body .city_sort ul li {
    line-height: 30px;
    line-height: 30px;
  }

  .city_body .city_index {
    width: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    border-left: 1px #e6e6e6 solid;
  }

</style>
