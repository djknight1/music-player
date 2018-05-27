/* getters文件用来从state里面取数据 */
export const singer = state => state.singer
/* 箭头函数的简写,等于function (state){ return state.singer} */
export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
  /* 注意！！getters还可以充当计算属性,但是在调用不同getters方法的时候要加上state!!! */
  console.log(state.playlist[state.currentIndex])
  return state.playlist[state.currentIndex] || {}
}







