import Vue from 'vue'
import Router from 'vue-router'
import rank from 'components/rank/rank.vue'
import recommend from 'components/recommend/recommend.vue'
import singer from 'components/singer/singer.vue'
import search from 'components/search/search.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/rank',
      name: 'rank',
      component: rank /* routes里面写component */
    },
    {
      path: '/singer',
      name: 'singer',
      component: singer
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: recommend /* 不能带引号啊 */
    }

  ]
})
