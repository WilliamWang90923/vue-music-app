const axios = require('axios');
const getSecuritySign = require('./sign');

const ERR_OK = 0
const token = 5381

const commonParams = {
    g_tk: token,
    loginUin: 0,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    needNewCode: 0,
    format: 'json',
    platform: 'yqq.json'  
}

function getRandomVal(prefix = '') {
  return prefix + (Math.random() + '').replace('0.', '')
}

function get(url, params) {
    return axios.get(url, {
      headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com/'
      },
      params: Object.assign({}, commonParams, params)
    })
  }

function post(url, params) {
    return axios.post(url, params, {
        headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com/',
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

function registerRouter(app) {
    registerRecommend(app)
}

function handleSongList(list) {
    const songList = []
    list.forEach( (item) => {
        const info = item.songInfo || item
    if (info.pay.pay_play !== 0 || !info.interval) {
      // 过滤付费歌曲和获取不到时长的歌曲
      return
    }
    const song = {
        id: info.id,
        mid: info.mid,
        name: info.name,
        singer: mergeSinger(info.singer),
        url: '', // 在另一个接口获取
        duration: info.interval,
        pic: info.album.mid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.album.mid}.jpg?max_age=2592000` : fallbackPicUrl,
        album: info.album.name
      }
      songList.push(song)
    })
    return songList
}

function registerRecommend(app) {
    app.get('/api/getRecommend', (req, res) => {
        const url = 'http://u.y.qq.com/cgi-bin/musics.fcg'

        const data = JSON.stringify({
            comm: { ct: 24 },
            recomPlaylist: {
                method: 'get_hot_recommend',
                param: { async: 1, cmd: 2 },
                module: 'playlist.HotRecommendServer' 
          },
        focus: { module: 'music.musicHall.MusicHallPlatform', method: 'GetFocus', param: {} }
    })

    const randomVal = getRandomVal('recom')
    const sign = getSecuritySign(data)

    get(url, {
        sign,
        '-': randomVal,
        data
      }).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
          const focusList = data.focus.data.shelf.v_niche[0].v_card
          // 歌单详情、榜单详情接口都有类似处理逻辑，固封装成函数
          // const songList = handleSongList(list)
          const sliders = []
          const jumpPrefixMap = {
              10002: 'https://y.qq.com/n/yqq/album/',
              10014: 'https://y.qq.com/n/yqq/playlist/',
              10012: 'https://y.qq.com/n/yqq/mv/v/'
          }
          const len = Math.min(focusList.length, 10)
          for (let index = 0; index < len; index++) {
              const element = focusList[index];
              const sliderItem = {}
              sliderItem.id = element.id
              sliderItem.pic = element.cover
              if (jumpPrefixMap[element.jumptype]) {
                  sliderItem.link = jumpPrefixMap[element.jumptype] + (element.subid || element.id) + '.html'
              } else if (element.jumptype === 3001) {
                  sliderItem.link = element.id
              }
              sliders.push(sliderItem)
          }

          // handle recommended song list
          const albumList = data.recomPlaylist.data.v_hot
          const albums = []
          for (let i = 0; i < albumList.length; i++) {
              const element = albumList[i];
              const albumItem = {}
              albumItem.id = element.content_id
              albumItem.username = element.username
              albumItem.title = element.title
              albumItem.pic = element.cover
              albums.push(albumItem)
          }
          res.json({
            code: ERR_OK,
            result: {
              sliders,
              albums
            }
          })
        } else {
          res.json(data)
        }
      })
    })
}

module.exports = registerRouter