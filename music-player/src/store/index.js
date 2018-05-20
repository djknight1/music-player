import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import  state from './state'
import * as getters from './getters'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'
/* 这个就是一个日志,方便你看到改了之前和没改的东西 */

Vue.use(Vuex)
/* 如果在发布模式下就不使用,当然了 我是看不懂这句话是什么错误 */
const debug = process.env.NODE_ENV !== 'production'

/* store就是一个仓库!!存放了数据,包含了增删改查的方法! */
export default new Vuex.Store({
  actions,
  state,
  getters,
  mutations,
  /* strict表示严格模式,他会检测你的state是不是在mutations里面改的,如果不是就会报错 */
  strict:debug,
  plugins:debug? [createLogger()] :[]
})
