<template>
<div class="tab">
  <!-- tag是一个属性 让我们可以设置router-link渲染成一个什么标签 -->
  <router-link tag="div" class="tab-item" to="recommend">recommend</router-link>
  <router-link tag="div" class="tab-item" to="/rank">rank</router-link>
  <router-link tag="div" class="tab-item" to="/singer">singer</router-link>
  <router-link tag="div" class="tab-item" to="search">search</router-link>
</div>
</template>

<script type="text/ecmascript-6">
export default {}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .tab
    display: flex
    height: 44px
    line-height: 44px
    font-size: $font-size-medium
    .tab-item
      flex: 1
      text-align: center
      .tab-link
        padding-bottom: 5px
        color: $color-text-l
      &.router-link-active
        color: $color-theme
        border-bottom: 2px solid $color-theme
</style>
