/* 一个mutation就是一个方法,就是修改state里面的东西 */
/* 你还可以用一个mutation-types为了书写方便,里面放方法常量 */
 const mutations = {
  /* 里面是修改state的方法,方法必须要有当前的状态树 */
  /* 怎么映射state的数据? 用getters */
  SET_SINGER (state, singer) {
    state.singer = singer    //
  }
}
export default mutations
