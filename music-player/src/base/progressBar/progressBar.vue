<template>
  <div class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div><!-- 走过的位置 -->
      <div class="progress-bar-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend.prevent="progressTouchEnd"
      ><!-- 当前位置 -->
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>

</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const BallWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      /* 用于在不同事件之中共享值 */
      this.touch = {}
    },
    methods: {

      progressTouchStart(e) {
        this.touch.isTouch = true
        this.touch.startX = e.touches[0].pageX
        /* 所以这个left是当你已经播放了一段时间后再次移动这个播放条*/
        this.touch.left = this.$refs.progress.clientWidth
      },

      progressTouchMove(e) {
        if (!this.touch.isTouch) {
          /* 没有touchstart的时候就return */
          return
        }
        const delta = e.touches[0].pageX - this.touch.startX
        let offsetWidth

        if(this.touch.left + delta < 0) {
          offsetWidth = 0
        } else if (this.touch.left + delta >this.$refs.progressBar.clientWidth - BallWidth ){
          offsetWidth = this.$refs.progressBar.clientWidth - BallWidth
          console.log(offsetWidth)
        } else{
          offsetWidth =this.touch.left + delta
        }

        this._offset(offsetWidth)
      },
      progressTouchEnd(e) {
        this.touch.isTouch = false
        const newP = this._getScrolledPercent()
        this.$emit('scrollSong',newP)
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      /* 滚动之后的barwidth */
      _getScrolledPercent() {
        const progressBarWidth = this.$refs.progressBar.clientWidth - BallWidth
        const newPercent = this.$refs.progress.clientWidth / progressBarWidth
        return newPercent
      }
    },
    watch: {
      percent(newPercent) {
        const progressBarWidth = this.$refs.progressBar.clientWidth - BallWidth
        const offsetWidth = progressBarWidth * newPercent
        if (offsetWidth >= 0 && !this.touch.isTouch) {
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-bar-wrapper
        position: relative
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          -webkit-box-sizing: border-box
          -moz-box-sizing: border-box
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background-color: $color-theme

</style>
