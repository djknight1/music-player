import jsonp from 'common/js/jsonp'
import {commonParams,options} from "./config";

export function getSingerList() {
  const url ='https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  /*channel=singer&page=list&key=all_all_all&
pagesize=100&
pagenum=1&
g_tk=5381&
jsonpCallback=GetSingerListCallback&
loginUin=0&
hostUin=0&
format=jsonp&
inCharset=utf8&
outCharset=utf-8&
notice=0&
platform=yqq&
needNewCode=0*/
  /*
  * g_tk=5381&
  * format=jsonp&
  * inCharset=utf-8&
  * outCharset=utf-8&
  * notice=0&
  * channel=singer&
  * page=list&key=all_all_all&pagesize=100&pagenum=1&
  * jsonpCallback=GetSingerListCallback&
  * loginUin=0&
  * hostUin=0&
  * platform=yqq&
  * needNewCode=0&
  * callback=__jp0*/
  const data = Object.assign({},commonParams,{
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return jsonp(url, data, options)
}
