<!-- APP.vue相当于父组件 -->
<template>
  <div id="app">
    <m-header></m-header>
    <!-- router-link点击的时候会自动出现一个classname便于操作 -->
    <tab></tab>
    <!--router渲染的组件-->
    <!-- 让router-view放在缓存中,不会再次发送请求 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script type="text/ecmascript-6">
/* 横杠两边转化的时候要大写 fkES6 */
import MHeader from 'components/m-header/m-header.vue'
import Tab from 'components/tab/tab.vue'
/* import的东西都是要大写的 但是标签是小写的 */
export default {
  components: {
    MHeader,
    Tab
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
