<template>
  <div class="singer">
    <!-- listview也是html元素,不要想复杂了,它会渲染出好几个div -->
    <listview :data="singers"
              @switchRouter="switchRouter"></listview>

    <keep-alive>
      <!-- 只是下面的被渲染了,上面的还在,可是它本身的zindex比较高,所以看不到了 -->
      <router-view></router-view>
    </keep-alive>
  </div>

</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import Listview from 'base/listview/listview'
  import singerDetail from 'components/singer-detail/singerDetail'
  import {mapMutations} from 'vuex'
  /* mapMutations你就不需要写this.$store.commit(mutation的名字) */
  /* 将你得到的数据的前十条作为热门数据 */
  /* 记得要语义化 */
  const Hot_Name = '热门'
  const Hot_Length = 10

  export default {
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    mounted() {

    },
    methods: {
      switchRouter(item) {
        this.$router.push({
          path: `/singer/${item.id}`
        })
        this.setSinger(item)
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = res.data.list
            this.normalizeList()
          }
        })
      },
      normalizeList() {
        /* 创建一个对象，得到自己想要的数据 */
        let map = {
          /* 这是热门数据 */
          hot: {
            title: Hot_Name,
            item: []
          }
        }
        /* 前十条定义成热门数据 */
        this.singers.forEach((item, index) => {
          if (index < Hot_Length) {
            map.hot.item.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
          }
          /* 热门数据完成,接下来是关于INDEX的数据 */

          const key = item.Findex
          /* 如果map没有abcdefg类似的的索引,给map加上,并且加上具有这个索引的所有歌手 */
          if (!map[key]) {
            map[key] = {
              title: key,
              item: []
            }
          }
          /* 开始push具有同一个index的歌手 */
          /* 一旦开始复制代码,就要思考能不能将这些复制的代码抽象化,这里复制了singer这个类,将它抽象化 */
          map[key].item.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
        })

        // 为了得到有序列表,我们要处理map
        let hot = []
        let rest = []
        for (let key in map) {
          let val = map[key]
          /* 遍历map对象 val是对象里的每一个值 */
          /* 当val的title是abcde的时候,我们要用rest来导入它 */
          /* match匹配的是正则表达式 */
          if (val.title.match(/[a-zA-Z]/)) {
            rest.push(val)
          } else if (val.title === Hot_Name) {
            hot.push(val)
          }
        }
        /* 转换成ascii码 */
        /* 要对rest这个数组进行排序,用sort */
        /* sort里面要有一个cd函数,接受两个参数,a,b代表每一个值（前后顺序）,return大于0代表升序排序,小于0则是降序 */
        rest.sort((a, b) => {
          /* 把字符串转化为ascii嘛 */
          return a.title.charCodeAt() - b.title.charCodeAt()
        })
        /* 利用concat连接数组,得到了一个有序的数组 */
        this.singers = hot.concat(rest)
        console.log(this.singers)
      },
      ...mapMutations({
        /* 把SET_SINGER这个mutation方法映射成一个函数叫做setSinger,你在使用setSinger的时候,本质上是使用了this.$store.commit(SET_SINGER) */
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      Listview
    }


  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  /* 父容器高度固定,自容器撑开 */
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width 100%


</style>
