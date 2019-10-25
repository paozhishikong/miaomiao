import Vue from 'vue'
import App from './App.vue'
import router from './routers'
import store from './store'
import Scroller from './components/Scroller'
import Loading from './components/Loading'

import axios from 'axios'

Vue.prototype.axios = axios
// setWH是过滤器的名字，把传进来的url，通过正则匹配的方式，获取到w，h。注意‘.’是特殊字符，需要使用‘\’放置转义
// arg是要替换的内容，也就是宽高
Vue.filter('setWH', (url, arg) => {
  return url.replace(/w\.h/, arg)
})

// 注册全局组件
Vue.component('Scroller', Scroller)
Vue.component('Loading', Loading)

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
