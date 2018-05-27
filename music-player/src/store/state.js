
const ModeList = {
  sequence: 0,
  loop: 1,
  random: 2
}

/* state就是仓库,就是你放数据的地方 */
const state = {
  singer: {},
  playing: false, //播放器播放还是暂停
  fullScreen: false, //全屏
  playlist: [], //播放列表
  sequenceList: [], //当顺序播放的时候 playlist和sequenceList播放列表是一样的,如果不顺序播放,那就不一样
  mode:ModeList.sequence,
  currentIndex: -1   //当前播放
}

export default state
