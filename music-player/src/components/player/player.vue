<template>
  <div class="player" v-show="playlist.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img height="100%" width="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="triggerFullScreen">
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{currentSong.name}}</h1>
          <h2 class="subtitle">{{currentSong.singer}}</h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="wrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left">
              <i class="icon-prev"></i>
            </div>
            <div @click="togglePlay" class="icon i-center">
              <i  class="icon-play"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini" >
      <div class="mini-player" v-show="!fullScreen" @click="triggerFullScreen">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name">{{currentSong.name}}</h2>
          <p class="desc">{{currentSong.singer}}</p>
        </div>
        <div class="control" >
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 还要调用audio的play属性才能播放 -->
    <audio ref="audio" :src="currentSong.url"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')

  export default {
    data() {
      return {}
    },
    computed: {
      ...mapGetters([
        `fullScreen`,
        `playlist`,
        'currentSong',
        `playing`
      ])
    },
    created() {

    },
    mounted() {
    },
    methods: {
      triggerFullScreen() {
        /* state只能通过mutations来改!! */
        this.setFullScreen(!this.fullScreen)
      },
      enter(el, done) {
      /* done是回调函数,done执行的时候就会跳到下一个钩子函数 */
        const {x,y,scale} = this.getPosAndScale()
        console.log(x,y,scale)
        /* 让大图片从原来位置移动到小图片,0帧的时候开始移动 */
        let animation = {
          0: {
            /* 要知道一开始的位置 */
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.2)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        /* 之所以要用create-keyframe-animation是因为你需要动态的获取到它的偏移量 */

        animations.registerAnimation({
          name: 'move', /* 动画名称 */
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        /* 动画结束后调用done函数 */
        animations.runAnimation(this.$refs.wrapper, 'move', done)
        console.log(`Enter`)

      },
      afterEnter(){
        /* 动画完成时要清空 */
        animations.unregisterAnimation('move')
        this.$refs.wrapper.style.animation = ''
      },
      leave(el, done){
        this.$refs.wrapper.style.transition = 'all 0.4s'
        const {x,y,scale} = this.getPosAndScale()
        this.$refs.wrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.wrapper.addEventListener('transitionend', done)

      },
      afterLeave() {
        this.$refs.wrapper.style.transition = ''
        this.$refs.wrapper.style[transform] = ''
      },
      /* 得到初始位置 */
      getPosAndScale() {
        /* miniplayer的宽度 */
        const targetWidth = 40
        /* 圆圈中心离最左边的宽度 */
        const paddingLeft = 40
        /* 圆圈中心离下面的高度 */
        const paddingBottom = 30
        /* 大的圆圈顶部离顶部的高度 */
        const paddingTop = 80
        /* cd-wrapper的宽度 */
        const width = window.innerWidth*0.8
        const scale = targetWidth/ width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - (width / 2) - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlay() {
        this.setPlaying(! this.playing)
        if (! this.playing) {
          this.$refs.audio.pause()
        } else {
          this.$refs.audio.play()
        }
      },

      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlaying: 'SET_PLAYING'
      })
    },
    /* 当currentSong变化的时候你就开始播放了 */
    watch: {
      currentSong() {
        /* 要在dom ready的时候才能调用play */
        this.$nextTick(() => {
          this.$refs.audio.play()
        })
      }
    },

    components: {}
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 200
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          /* cubic-bezier则是控制transition在0.4s内动画变化的趋势 */
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

</style>