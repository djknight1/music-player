<template>
  <div class="recommend">
    <!-- scroll是在mounted的时候初始化的,但是你得到数据可能在mounted的时候还没得到,所以有可能出现无法滚动的情况
     这时候我们传一个data进去,一开始disclist如果没有的话,传进去是空,然后有了,就会触发watch,调用refresh方法-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <!-- 在v2.0版本中 使用vfor必须要绑定一个key -->
            <div class='slider-item' v-for="item in recommends" :key="item.id">
              <a :href='item.linkUrl'>
                <img @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item,index) in discList" :key="item.id" class="item">
              <div class="icon">
                <!-- 想用vue-lazy插件,把:src换成v-lazy就行 同时再main.js里使用Vue.use -->

                <img width="60" height="60" v-lazy="item.al.picUrl"/>
              </div>
              <div class="text">
                <h2 class="name">{{item.name}}</h2>
                <p class="desc">xxx</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script type='text/ecmascript-6'>
  import Slider from 'base/slider/slider.vue'
  import {getPlayList} from 'api/recommend.js'
  import Scroll from  'base/scroll/scroll'

  export default {
    data() {
      return {
        recommends: [],
        discList: []
      }
    },
    created() {
      /*在create的时候获取数据,当网络较差的时候会有延迟,直接进到mounted,但是mounted初始化的时候你啥也没有 所以会报错*/
      /* 得到循环数据是先于playlist的,所以你只要有playlist就可以保证scroll初始化成功 */

      /* 你可能不知道两块哪个先 */
      /* 就算你用了计算属性,当两个数组出现的时候调用refresh方法 */
      /* 但是img请求的时候也是异步的呀 */
      /* 所以最好的方法就是在img加载 onload的时候,再调用一次refresh方法 */
     setTimeout( () =>{
       this.get_Recommend_data()
     },1000)
      this.getPlayList_data()
    },
    methods: {
      get_Recommend_data() {
        const strArr = [{
          'linkUrl': 'https://y.qq.com/m/digitalbum/gold/index.html?_video=true&id=4017464&g_f=shoujijiaodian',
          'picUrl': 'http://y.gtimg.cn/music/photo_new/T003R720x288M0000024viBR3EOkDA.jpg',
          'id': 15286
        },
          {
            'linkUrl': 'https://y.qq.com/msa/dati/0_5203.html?ADTAG=jiaodiantu',
            'picUrl': 'http://y.gtimg.cn/music/photo_new/T003R720x288M000002xRl0Z2f7wEC.jpg',
            'id': 15330
          },
          {
            'linkUrl': 'http://y.qq.com/w/album.html?albummid=0044JAte0c4YRX',
            'picUrl': 'http://y.gtimg.cn/music/photo_new/T003R720x288M0000043R8JM28J71F.jpg',
            'id': 15358
          },
          {
            'linkUrl': 'https://y.qq.com/msa/270/0_5207.html',
            'picUrl': 'http://y.gtimg.cn/music/photo_new/T003R720x288M000000hobvk2ly4vn.jpg',
            'id': 15352
          },
          {
            'linkUrl': 'https://y.qq.com/msa/362/8_5217.html',
            'picUrl': 'http://y.gtimg.cn/music/photo_new/T003R720x288M000000qlVB833WALk.jpg',
            'id': 15338
          }]
        this.recommends = strArr
        console.log(this.recommends)
      },
      getPlayList_data() {
        /* this.discList = getPlayList('playlist').data.playlist.trackIds*/
        getPlayList('playlist').then((res) => {
          this.discList = res.playlist.tracks
          console.log(this.discList)
        })

      },
      loadImage () {
        /* 但是你总不能每一张图片加载的时候都调用loadimage方法吧 这是一种浪费 */
        /* 所以设置一个标志位,第一次使用后,再把标识位变成1 */
        if (!this.checkloaded){
          /* 父组件调用子组件的方法 */
          this.$refs.scroll.refresh()
          this.checkloaded = 1
        }
      }

    },
    components: {
      Slider,
      Scroll
    }
  };
</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center /* 因为它只有一行 设置在辅轴上的对齐方式 */
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center /* 主轴方向上的对齐方式 */
            flex: 1

            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
