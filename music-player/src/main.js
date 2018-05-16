// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router' /* 这个是export出来的router的实例 */
import VueLazyLoad from 'vue-lazyload'
import 'common/stylus/index.styl'
import 'fastclick'

/* 把fastclick绑定在document.body 整个界面都不会有 */
/* eslint-disable no-new */
Vue.use(VueLazyLoad,{
  /* loading就是在图片未加载的时候你所需要出现的图片 */
  loading:require('common/image/default.png')
})

new Vue({
  el: '#app',
  render: h => h(App),
  router
})
