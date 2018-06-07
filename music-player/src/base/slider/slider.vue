<template>
  <div  class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <!-- 即是一个插槽,父组件中调用slider组件,<slider>你好</slider>你好就会被插入到slot部分 -->
      <slot>

      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key='index' :class="{active : currentPageIndex === index }"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  /* 用betterscroll来做轮播 */
  import BScroll from 'better-scroll'

  export default {
    data() {
      return {
        dots: [],
        currentPageIndex:0
      }
    },
    /* 从外部控制属性 是否可以轮播 */
    props: {
      /* 是否轮播 */
      loop: {
        type: Boolean,
        default: true
      },
      /* 是否自动播放 */
      autoPlay: {
        type: Boolean,
        default: true
      },
      /* 间隔 */
      interval: {
        type: Number,
        default: 4000
      }
    },
    mounted() {
      /* 也可以用setTimeout20ms来代替nextTick,因为浏览器的刷新频率大概是17ms */
      /* Vue.nextTick和$nextTick是一样的,只不过$nextTick函数里面的this会被绑定到vue实例上去 */
      this.$nextTick(() => {
        this._setSliderWidth();
        this.initDots();
        /*因为你加了betterscroll 所以你dots的初始化要在better scroll初始化之前*/
        this.initSlider()

        if(this.autoPlay){
          this._play()
        }
      });

      /*当窗口变化的时候,一开始给slider设置的宽度也得变化,所以设置一个监听器*/
      window.addEventListener('resize', () => {
        /* 表示slider未初始化 */
        if (!this.slider) {
          return
        } else {
          /* 重新计算宽度 */
          /*你第一次计算出来的宽度是已经加过 两个空白页面的宽度,所以呀！不能再加了 加个判断位判断是否resize*/
          this._setSliderWidth(1)
          this.slider.refresh()
        }
      });
    },

    destroyed() {
      clearTimeout(this.timer)
    },

    methods: {
      /* 要设定slider的宽度,所以要获得到 dom元素 */
      /* vue不建议直接操作dom,要是想要获取dom元素要使用api */
      /* 在html上使用ref='xx'就可以通过$ref获取到dom */
      _setSliderWidth(isResize) {
        /* 获取到它有多少个孩子 */
        this.children = this.$refs.sliderGroup.children
        /* 这个轮播的想法是设置一个slider只显示一张图片大小,而slidergroup是所有元素的总和大小 */
        let width = 0
        /*获取每一张图片的宽度*/
        let sliderWidth = this.$refs.slider.clientWidth
        console.log(sliderWidth)
        /*让每一张图片都有一个classname 叫classItem*/
        /*让每一张图片都充满整个slider*/

        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          /* 轮播的时候左右两边需要再加两张图片保证轮播的流畅性 */
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'

      },

      initSlider() {
        /*初始化betterscroll*/
        this.slider = new BScroll(this.$refs.slider, {
          //横向滚动
          scrollX: true,
          scrollY: false,
          momentum: false, /*惯性*/
          /*新写法*/
          snap: {
            loop: this.loop,
            threshold: 0.3,
            speed: 400
          },
          click: true
        })
        /* 当这个对象触发一个事件 */
       this.slider.on('scrollEnd', () =>{
         /* 获得这是第几个子元素 */
         let pageIndex = this.slider.getCurrentPage().pageX
         this.currentPageIndex = pageIndex

         /* 自动轮播timeout一次会触发滑动结束事件,这时候如果你是用手滑的
          * 也会触发滑动结束事件事件所以当滑动结束事件出现时,直接循环即可 */
         if (this.autoPlay){
           clearTimeout(this.timer)
           this._play()
         }
       })

      },

      _play() {
        /* 箭头函数里面的this不会再指向timer此类 */
        /* 在vue中写定时器最好用timeout 少用interval 因为清除的时候不好清楚 */
         this.timer = setTimeout( () =>{
          this.slider.next(400)
        },this.interval)

      },

      initDots() {
        /* 建立一个五个元素的空数组 */
        this.dots = new Array(this.children.length)

      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    position: relative
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
