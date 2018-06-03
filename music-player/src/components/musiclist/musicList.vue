<template>
  <div class="music-list">
    <div class="back" @click="getBack">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" ref="title">{{title}}</h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-if="songs.length" ref="playButton" @click="randomPlayAll">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!-- filter是一个蒙层 -->
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 这个一个滚动层,为了让img和下面的列表一起向上滚动 -->
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll"
            :listenScroll="listenScroll"
            class="list"
            ref="scroll">
      <div class="song-list-wrapper"> <!-- 为了控制样式而加的 -->
        <song-list :songs="songs" @select="selectItem">

        </song-list>
      </div>
    </scroll>

  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import songList from 'base/songList/songList'
  import {prefixStyle} from 'common/js/dom'
  import {mapActions} from 'vuex'
  /* 预留高度,你最小上划可以达到的高度 */
  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const filter = prefixStyle('filter')

  export default {
    data() {
      return {
        scrollY: 0,
        minTranslateY: 0
      }
    },
    props: {
      bgImg: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImg})`
      },
    },
    created() {
      this.listenScroll = true
    },
    mounted() {
      this.$nextTick(() => {
        /* scroll选中的是一个vue组件,用$el换成dom元素 */
        this.$refs.scroll.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
        /* 最小只能滚动到bgimg的顶部,把它记录下来 */
        this.minTranslateY = -(this.$refs.bgImage.clientHeight - RESERVED_HEIGHT)
        this.imageHeight = this.$refs.bgImage.clientHeight

        window.addEventListener('resize', () => {
          this.$refs.scroll.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
        })
      })
    },
    watch: {
      scrollY(newY) {
        /* 让bglayer跟scroll层一样也往上运动,但是zindex比bgimg高,这样效果就是遮盖住了bgimg */
        /* transform的意思是变形,translate3d有三个参数分别是xyz,代表3d变换,这里就是让他往y轴正偏多少位置 */
        let zIndex = 0
        let scale = 1
        let blur = 0
        let percent = Math.abs(newY / this.imageHeight) //缩放比例
        let translateY = Math.max(this.minTranslateY, newY)
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`

        /*下滑对图片进行缩放,缩放多少？有个公式 */
        if (newY > 0) {
          scale = 1 + percent
          /* 如果不设置zindex,会被下面的list或者其他的元素所遮盖住 */
          zIndex = 10
          blur = 1 + 4 * percent
        }

        /* 当你滑到顶部的时候,需要让图片的高度变成很小,就让那很小的一部分遮住一个个list,然后让layer停止 */
        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          /* 很好奇这个paddingTOP给了0 就会出错是为什么。。 */
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.playButton.style.display = 'none'
        } else {
          this.$refs.bgImage.style.height = 0
          this.$refs.bgImage.style.paddingTop = `70%`
          this.$refs.playButton.style.display = 'block'
        }
        this.$refs.bgImage.style.zIndex = zIndex
        /* 之所以从头部往下拉,是因为transform-origin: top 从头上开始变形 */
        this.$refs.bgImage.style[transform] = `scale(1,${scale})`
        this.$refs.bgImage.style[filter] = `blur(${blur}px)`

        /* 该句话与下面的if else效果相同 */
        /*if (-newY < this.minTranslateY - RESERVED_HEIGHT)
        {
          this.$refs.layer.style['transform'] = `translate3d(0,${newY}px,0)`
          this.$refs.layer.style['webkitTransform'] = `translate3d(0,${newY}px,0)`

        }
        else {
          this.$refs.layer.style['transform'] = `translate3d(0,${-this.minTranslateY + 40}px,0)`
          this.$refs.layer.style['webkitTransform'] = `translate3d(0,${-this.minTranslateY + 40}px,0)`
        }*/


      }
    },
    methods: {
      scroll(pos) {
        this.scrollY = pos.y
      },
      selectItem(item, index) {
        /* 如果没有封装selectPlay就要使用this.$store.dispatch('selectPlay') */
        console.log(this.songs)
        this.selectPlay({
          list: this.songs,
          index: index
        })
      },

      randomPlayAll() {
        this.randomPlayALL(this.songs)
        console.log(this.songs)
      },

      getBack() {
        this.$router.push('/singer')
      },
      ...mapActions([
        `selectPlay`,
        'randomPlayALL'
      ])
    },
    components: {
      songList,
      Scroll
    },

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
