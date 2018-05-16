import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

export function getPlayList(type) {
  const url = 'https://api.imjad.cn/cloudmusic/'
  const id = 309390784
  let playlist = []
  if (!type) {
    return
  } else {
    return axios.get(`${url}?type=${type}&id=${id}`
    ).then( (res) => {
      return Promise.resolve(res.data)
    })
}

}
