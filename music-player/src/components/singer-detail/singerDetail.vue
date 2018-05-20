<template>
   <music-list
     :bg-img="bgImg"
     :songs="song"
     :title="title"></music-list>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Song from 'common/js/Song'
  import {createSong} from 'common/js/Song'
  import musicList from 'components/musiclist/musicList'
  /* mapGetters和mapMutations一样的用法,不需要再写this.$store.getters.xxx */
  export default {
    data() {
      return {
        song:[]
      }
    },
    computed:{
      /* 如果不放在computed中,你的请求是异步的,如果你还未请求到则songs是空的,所以放在computed中,每次改变都存到缓存中 */
      bgImg() {
        return this.singer.avatar
      },
      title() {
        return this.singer.name
      },
      ...mapGetters([
        'singer'
      ])
    },
    created () {
      console.log(this.singer)
      this.getDetail()
    },
    mounted () {

    },
    methods: {
      getDetail() {
        if(!this.singer.id){
          this.$router.push('/singer')
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.song = this.normalizeSongs(res.data.list)
            console.log(this.song)
          }
        })
      },
      normalizeSongs(list){
        let requiredList = []
        list.forEach((item) => {
         /* requiredList.push(new Song(music.id,mid,singer,name,duration,image,url))*/
         /* 如果直接在这里push的话,还是要写一大坨代码,那我们还不如再将他抽象一次 */
         requiredList.push(createSong(item.musicData))
        })
        return requiredList
      }
    },
    components: {
      musicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .singer-detail
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

</style>
