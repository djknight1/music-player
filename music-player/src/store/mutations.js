/* 一个mutation就是一个方法,就是修改state里面的东西 */
/* 你还可以用一个mutation-types为了书写方便,里面放方法常量 */
const mutations = {
  /* 里面是修改state的方法,方法必须要有当前的状态树 */
  /* 怎么映射state的数据? 用getters */
  SET_SINGER(state, singer) {
    state.singer = singer    //
  },
  SET_PLAYING(state, flag) {
    state.playing = flag
  },

  SET_FULL_SCREEN(state, fullScreen) {
    state.fullScreen = fullScreen
  },

  SET_PLAYLIST(state, playlist) {
    state.playlist = playlist
  },

  SET_SEQUENCE_LIST(state, suquenceList) {
    state.sequenceList = suquenceList
  },

  SET_MODE(state, mode) {
    state.mode = mode
  },

  SET_CURRENT_INDEX(state, currentIndex) {
    state.currentIndex = currentIndex
  },

}
export default mutations
