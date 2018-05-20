/* 这个文件是让song变成一个对象,到时候便利处理方便 */
export default class Song {
  /* duration是歌曲长度 */
  constructor({id, mid, singer, name, duration, album, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
}

/* 他们的musicData都是一样的,我们就可以直接拿来用 */
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    /* musicData里面的singer是个数组,但是我们需要字符串 */
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T001R150x150M000${musicData.singer[0].mid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=0&guid=126548`
  })
}

function filterSinger(singer) {
  let requiredSinger = []
  if (!singer) {
    return ''
  }
  singer.forEach((item) => {
    requiredSinger.push(item.name)
  })
  /* 把数组的每一个元素用/分割开来变成字符串 */
  return requiredSinger.join('/')
}
