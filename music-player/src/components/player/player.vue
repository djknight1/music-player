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
        <div class="middle"
             @touchstart="touchstart"
             @touchmove="touchmove"
             @touchend="touchend"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="wrapper">
              <div class="cd" :class="{'play' : playing ,'play pause' : !playing }">
                <img class="image" :src="currentSong.image">
              </div>
            </div>

            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{currentPlayingLyric}}</div>
            </div>

          </div>

          <!-- 当传进来一个currentLyric的时候调用refresh方法 -->
          <scroll class="middle-r" ref="scroll" :data="currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   v-for="(line, index) in currentLyric.lines"
                   :class="{'current' : index === currentLineNumber}"
                >
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>

        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active' : !currentShow}"></span>
            <span class="dot" :class="{'active' : currentShow}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l" v-model="currentTime">{{currentTime}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @scrollProgress="scrollProgress"
              >

              </progress-bar>
            </div>
            <span class="time time-r">{{totalTime}}</span>
          </div>

          <div class="operators">
            <div
              class="icon i-left"
              @click="changePlayMode"
            >
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left">
              <i @click="prev" class="icon-prev" :class="{'disable' : !songReady}"></i>
            </div>
            <div @click="togglePlay" class="icon i-center" :class="{'disable' : !songReady}">
              <i :class="isPlaying"></i>
            </div>
            <div class="icon i-right" :class="{'disable' : !songReady}">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="triggerFullScreen">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="{'play' : playing ,'play pause' : !playing }">
        </div>
        <div class="text">
          <h2 class="name">{{currentSong.name}}</h2>
          <p class="desc">{{currentSong.singer}}</p>
        </div>
        <div class="control">
          <progress-circle
            :radius="32"
            :percent="percent"
          >
            <i @click.stop="togglePlay"
               :class="isPlayingMini"
               class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 还要调用audio的play属性才能播放,准备播放的时候会触发canplay事件,发生错误的时候就会触发error事件 -->
    <audio ref="audio"
           :src="currentSong.url"
           @canplay="ready"
           @error="error"
           @timeupdate="timeLine"
           @ended="songEnd"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progressBar/progressBar.vue'
  import ProgressCircle from 'base/progressCircle/progressCircle'
  import {ModeList} from 'store/state'
  import {Shuffle} from 'common/js/shuffle'
  import LyricParser from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  /* transitionDuration包含在transition里面 是transition里面的时间 */
  const transitionDuration = prefixStyle('transitionDuration')

  const cdWrapper = 0
  const lyricPage = 1

  export default {
    data() {
      return {
        iconPlay: '',
        miniIconPlay: '',
        songReady: false,
        currentTime: 0,
        totalTime: 0,
        originalTime: 0,
        radius: 32,
        currentLyric: {},
        currentLineNumber: 0,
        currentShow: cdWrapper,
        currentPlayingLyric: ''
      }
    },
    computed: {
      isPlaying() {
        if (this.playing) {
          this.iconPlay = 'icon-pause'
        } else {
          this.iconPlay = 'icon-play'
        }
        return this.iconPlay
      },

      isPlayingMini() {
        if (this.playing) {
          this.miniIconPlay = 'icon-pause-mini'
        } else {
          this.miniIconPlay = 'icon-play-mini'
        }
        return this.miniIconPlay
      },

      percent() {
        return this.originalTime / this.currentSong.duration
      },

      iconMode() {
        if (this.mode === ModeList.sequence) {
          return 'icon-sequence'
        } else if (this.mode === ModeList.loop) {
          return 'icon-loop'
        } else {
        }
        return 'icon-random'
      },

      ...mapGetters([
        `fullScreen`,
        `playlist`,
        'currentSong',
        `playing`,
        'currentIndex',
        'mode'
      ])
    },
    created() {
      this.touches = {}
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
        const {x, y, scale} = this.getPosAndScale()
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

      },
      afterEnter() {
        /* 动画完成时要清空 */
        animations.unregisterAnimation('move')
        this.$refs.wrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.wrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this.getPosAndScale()
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
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - (width / 2) - paddingBottom
        return {
          x,
          y,
          scale
        }
      },

      togglePlay() {
        this.setPlaying(!this.playing)
        if (!this.playing) {
          this.$refs.audio.pause()
          this.currentLyric.togglePlay()
        } else {
          this.$refs.audio.play()
          this.currentLyric.togglePlay()
        }
      },

      next() {
        /* 修改了currentIndex的值,currentSong就变化了,然后数据渲染到audio的src,然后再调用watch */
        /*if(!this.songReady) {
          return
        }*/

        /* 考虑边界情况,如果歌单里只有一首歌,那你点击下一首,currentIndex没有变 playlist没有变 */
        /* 那currentSong没有变,但是我们下面的逻辑都是基于currentSong变化的情况下的 */

        if (this.playlist.length === 1) {
          this.loop()
        } else {
          if (this.currentIndex === this.playlist.length - 1) {
            this.setCurrentIndex(0)
          } else {
            this.setCurrentIndex(this.currentIndex + 1)
          }
          if (!this.playing) {
            this.setPlaying(true)
          }
        }
        this.songReady = false
      },

      prev() {
        if (!this.songReady) {
          return
        }

        if (this.currentIndex === 0) {
          this.setCurrentIndex(this.playlist.length - 1)
        } else {
          this.setCurrentIndex(this.currentIndex - 1)
        }

        if (!this.playing) {
          this.setPlaying(true)
        }
        this.songReady = false

      },

      /* ready做标识位功能,当你error时,要让之后的歌都能播放,所以在出错的时候也要将它变成true */
      ready() {
        this.songReady = true
      },

      error() {
        this.songReady = true
      },

      songEnd() {
        if (this.mode === ModeList.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.currentLyric.seek(0)
      },

      timeLine(e) {
        /* 现在的audio里面的currentTime是秒数 */
        this.originalTime = e.target.currentTime
        this.totalTime = this.formatTime(e.target.duration)
        this.currentTime = this.formatTime(e.target.currentTime)
      },

      formatTime(timestamp) {

        timestamp = timestamp | 0
        const minute = timestamp / 60 | 0
        const second = this._pad(timestamp % 60)
        return `${minute}:${second}`

      },

      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },

      scrollProgress(percent) {

        const currentTime = this.currentSong.duration * percent

        this.$refs.audio.currentTime = currentTime

        if (!this.playing) {
          this.togglePlay()
        }

        if (this.currentLyric.lines) {
          this.currentLyric.seek(currentTime * 1000)
        }

      },

      mixPlaylist(mode) {
        let list = []
        if (mode === ModeList.random) {
          list = Shuffle(this.playlist)
          return list
        } else {
          list = this.playlist
          return list
        }
      },

      /* 在你修改list之后,原来觉得currentSong的currentIndex就不再是currentIndex了 */
      resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return this.currentSong.id === item.id
        })
        this.setCurrentIndex(index)
      },

      changePlayMode() {
        const NextMode = (this.mode + 1) % 3
        this.setMode(NextMode)
      },

      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          /* 在初始化的时候调用回调函数,当歌词的每一行发生改变的时候调用该回调函数!!! */
          this.currentLyric = new LyricParser(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          /* 歌词获取失败 要进行清楚工作 */
          this.currentLyric = null
          this.currentPlayingLyric = ''
          this.currentLineNumber = 0
        })
      },

      /* 这个函数接受一个对象,对它进行解构 */
      handleLyric({lineNum, txt}) {
        this.currentLineNumber = lineNum

        if (lineNum < 5) {
          this.$refs.scroll.scrollTo(0, 0, 1000)
        } else {
          /* 让当前的line一直在中间 */
          this.$refs.scroll.scrollToElement(this.$refs.lyricLine[lineNum - 5], 1000)
        }

        this.currentPlayingLyric = txt
      },

      touchstart(e) {
        this.touches.initiated = true
        this.touches.firstTouchX = e.touches[0].pageX
        this.touches.firstTouchY = e.touches[0].pageY
      },

      touchmove(e) {
        if (this.touches.initiated) {
          this.touches.finalTouchX = e.touches[0].pageX
          this.touches.finalTouchY = e.touches[0].pageY
          const deltaX = this.touches.finalTouchX - this.touches.firstTouchX
          const deltaY = this.touches.finalTouchY - this.touches.firstTouchY

          /* 这句话是因为当你移动歌词的时候,有时候不小心也会左右滑动,我们为了用户的体验写了这个 */
          if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return
          }
          /* 向左滑动多少,lyric也滑动多少,window.innerWidth是窗口的显示宽度,不是浏览器的宽度。不包括工具条和滚动条 */
          /* 如果当前是cd界面,那lyric离最窗口的最右侧为0,如果是lyric,那它离最右侧为-window.innerWidth */

          let left
          if (this.currentShow === cdWrapper) {
            left = 0
          } else {
            left = -window.innerWidth
          }
          /* deltaX小于0,lyric最多只能拉到最右边,当你是lyric界面的时候,如果你滑到了最左边
          那 -(left + deltaX) < -window.innerWidth */

          /* 同时,它往右边滑lyric离右边的距离也不能小于0,所以 slideWidth是一个 负数到0的值 */

          //下面这段代码可以进行简化

          /*let slideWidth = Math.max(-window.innerWidth, left + deltaX)
          if(slideWidth > 0 ) {
            slideWidth = 0
          }*/

          const slideWidth = Math.min(Math.max(-window.innerWidth, left + deltaX), 0)
          this.touches.percent = Math.abs(slideWidth / window.innerWidth)

          /* 在end的时候设置了transition 那你在move的时候就要取消它！！ */
          this.$refs.scroll.$el.style[transitionDuration] = ``
          this.$refs.scroll.$el.style[transform] = `translate3d(${slideWidth}px,0,0)`

          this.$refs.middleL.style[transitionDuration] = 0
          this.$refs.middleL.style.opacity = 1 - this.touches.percent
        }

      },

      touchend(e) {
        /* 考虑从右向左滑,和从左向右滑,都只滑动10%就让它完全滚动过去 */
        let offWidth
        let opacity
        /* 右向左滑 */
        if (this.currentShow === cdWrapper) {
          if (this.touches.percent > 0.1) {
            offWidth = -window.innerWidth
            opacity = 0
            this.currentShow = lyricPage
          } else {
            offWidth = 0
            opacity = 1
          }
          /* 从左向右滑 */
        } else {
          if (this.touches.percent < 0.9) {
            offWidth = 0
            opacity = 1
            this.currentShow = cdWrapper
          } else {
            opacity = 0
            offWidth = -window.innerWidth
          }
        }
        this.$refs.scroll.$el.style[transitionDuration] = '.5s'
        this.$refs.scroll.$el.style[transform] = `translate3d(${offWidth}px,0,0)`

        this.$refs.middleL.style[transitionDuration] = `.5s`
        this.$refs.middleL.style.opacity = opacity

      },

      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlaying: 'SET_PLAYING',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setMode: 'SET_MODE',
        setPlaylist: 'SET_PLAYLIST'
      })
    },
    /* 当currentSong变化的时候你就开始播放了 */
    watch: {
      currentSong(newSong, oldSong) {
        /* 要在dom ready的时候才能调用play */
        this.$nextTick(() => {
          if (newSong.id !== oldSong.id) {

            if (this.currentLyric.lines) {
              this.currentLyric.stop()
            }

            this.$refs.audio.play()
            /*getLyric返回一个promise对象 */
            this.getLyric()
          }
        })
      },
      mode(newMODE) {
        const newList = this.mixPlaylist(newMODE)
        this.resetCurrentIndex(newList)
        this.setPlaylist(newList)
      },
    },

    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
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

  @keyframes rotate
    0%
      -webkit-transform: rotate (0deg)
      -moz-transform: rotate (0deg)
      -ms-transform: rotate (0deg)
      -o-transform: rotate (0deg)
      transform: rotate (0deg)
    100%
      -webkit-transform: rotate(360deg)
      -moz-transform: rotate(360deg)
      -ms-transform: rotate(360deg)
      -o-transform: rotate(360deg)
      transform: rotate(360deg)
</style>
