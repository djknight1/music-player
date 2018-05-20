<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    @scroll="scroll">
    <!-- 派发scroll事件,你也接受到了,还会额外派发给你一个参数,pos参数 -->
    <ul>
      <!-- 第一层循环是读取ABCDEFG -->
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <!-- 具体的歌手类型 -->
          <li
            v-for="item in group.item"
            class="list-group-item"
            @click="selectItem(item)"
            >
            <!-- 左边是头像 -->
            <img class="avatar" v-lazy="item.avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut"
         @touchstart="onShortcutTouchStart"
         @touchmove.prevent="onShortcutTouchMove">
      <ul>
        <li class="item"
            v-for="(item,index) in shortcutList"
            :data-index="index"
            :class="{'current':currentIndex == index }"> <!-- prevent阻止浏览器默认的原生滚动事件 -->
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed">
      <h1 class="fixed-title"
          v-for="(item,index) in shortcutList"
          v-if="currentIndex == index && scrollY<=0">
        {{item}}</h1>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'

  export default {
    data() {
      return {
        heightList: [],
        scrollY: 0,
        currentIndex: 0
      }
    },
    created() {
      this.touch = {}
      this.listenScroll = true
    },
    props: {
      /* 接受外来的数据,是否滚动这种类型的数据 */
      data: {
        type: Array,
        default: []
      }
    },
    components: {
      Scroll
    },
    /* computed属性函数值,可以直接理解为data,你只要return了一次 就相当于存入到data中 */
    computed: {
      /* 返回一个只有abcdefg的数组 */
      shortcutList() {
        /* 一个必须要有的参数,每个元素的值 */
        return this.data.map((item) => {
          return item.title.substr(0, 1)
        })
      }
    },
    methods: {
      selectItem(item) {
        /* item是一个对象，像父组件发送一个自定义事件 */
        console.log(item)
        this.$emit('switchRouter',item)

      },
      onShortcutTouchStart(el) {
        /* target返回dom节点,这个currentIndex其实是个字符串类型 */
        let currentIndex = getData(el.target, 'index')
        let firstTouch = el.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.currentIndex = currentIndex
        this.$refs.listview.scrollTo(this.$refs.listGroup[currentIndex], 1000)
        this.scrollY = -this.heightList[currentIndex]
      },
      /* 原理如下: */
      /* 当你滚动右侧栏的时候,你第一次鼠标放上去的位置,和你最后一次鼠标离开的位置记录下来 */
      /* 将他们相减,你可以得到一个偏移量delta,又因为每一个ABCDEFG...的高度是一定的,你除以这个dom元素的高度 */
      /* 你就可以知道滚动到了哪里,然后用scrollTo去scroll */

      /* 那么怎么实现呢？ */
      /* 你得先知道第一次手指触碰的位置,和最后一次手指触碰的位置,然后再将他们储存起来 */
      /* 记录位置用touchs属性实现,它是一个数组,记录手指触碰的位置，然后把他们储存起来 */
      /* !!!!特别的是,touches其实就有一个元素,当你每次滑动的时候,都会产生新数组,所以touchmove这个动作产生的touches数组其实就是滑动结束的位置!!! */
      /* 这里不放在data和prop还有computed里面储存,因为这些属性里面都会加入getter和setter,会实时监听变化 */
      /* 我们不需要知道变化,只需要记录一下它就行了,所以放在created里面 */
      onShortcutTouchMove(el) {
        let firstTouch = el.touches[0].pageY
        this.touch.y2 = firstTouch
        let delta = this.touch.y2 - this.touch.y1
        /* 18是每一个元素的高度 */
        let offset = parseInt(delta / 18)
        /* offet还要加上第一次点击的时候的index,因为offset是偏移量 */
        /* currentIndex是个字符串类型,我们要把他变成int */
        offset = parseInt(this.touch.currentIndex) + offset
        this.$refs.listview.scrollTo(this.$refs.listGroup[offset], 1000)
      },
      /* 为下面计算你目前滚动到了哪里做准备 */
      getGroupHeight() {
        let list = this.$refs.listGroup
        let height = 0
        this.heightList.push(height)
        for (let i in list) {
          /* 确定各个group高度的上下限,而不是他们本身自己的高度 */
          height += list[i].offsetHeight
          this.heightList.push(height)
        }
      },
      /* This其实是一个vue实例,也就是一个对象,在此基础上加的scrollY的都是对象的一个属性 */
      scroll(pos) {
        this.scrollY = pos.y
      }
    },
    /* 当有参数传进来的时候,即data变化的时候就开始获得高度 */
    watch: {
      data() {
        /* 当你检测数据变化的时候,数据变化不会马上dom渲染,需要nexttick或者settimeout */
        this.$nextTick(() => {
          this.getGroupHeight()
        })
      },
      /* 检测到scrollY变化的时候,参数是新值,变化之后的值 */
      /* 往上拉是负的 */
      scrollY(newY) {
        const heightList = this.heightList
        if (newY > 0) {
          this.currentIndex = 0
        }
        else if (newY <= 0) {
          for (let i = 0; i < heightList.length; i++) {
            let height1 = heightList[i]
            let height2 = heightList[i + 1]
            /* 如果height2没了,或者已经找到了,则index等于i */
            /* 要是这两个条件都不满足,说明index为0 */
            if (!height2 || (-newY >= height1 && -newY <height2)) {
              this.currentIndex = i
              return
            }
          }
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
