/* action是对一次事件触发多个mutation的时候的封装,mutation不支持异步,而action支持异步 */

import {ModeList} from 'store/state'
import {Shuffle} from "../common/js/shuffle";
/* commit是方法,state是属性,如果没有对象结构,就要使用list.commit多次 */
export const selectPlay = function ({commit, state}, {list, index}) {
  /* 点击歌曲播放的时候,需要设置顺序播放,添加播放列表 */
  commit(`SET_SEQUENCE_LIST`, list)
  /* 当前state的mode */
  if(state.mode === ModeList.random) {
    let randomList = Shuffle(list)
    commit(`SET_PLAYLIST`, randomList)
  }
  commit(`SET_PLAYLIST`, list)
  commit(`SET_CURRENT_INDEX`, index)
  commit(`SET_FULL_SCREEN`, true)
  commit(`SET_PLAYING`, true)
}

export const randomPlayALL = function ({commit, state}, list) {
  commit(`SET_SEQUENCE_LIST`, list)
  commit(`SET_FULL_SCREEN`, true)
  commit('SET_MODE',ModeList.random)
  let randomList = Shuffle(list)
  commit(`SET_PLAYLIST`, randomList)
  commit(`SET_CURRENT_INDEX`, 0)
  commit(`SET_PLAYING`, true)
}
