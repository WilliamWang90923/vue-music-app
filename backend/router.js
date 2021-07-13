const axios = require('axios');
const pinyin = require('pinyin')
const getSecuritySign = require('./sign');

const ERR_OK = 0
const token = 5381

const fallbackPicUrl = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000'

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

function getUid() {
  const t = (new Date()).getUTCMilliseconds()
  return '' + Math.round(2147483647 * Math.random()) * t % 1e10
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
    registerSingerList(app)
    registerSingerDetail(app)
    registerSongsUrl(app)
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

function mergeSinger(singer) {
  const ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
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

function registerSingerList(app) {
  app.get('/api/getSingerList', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const HOT_NAME = '热'
    
    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerList: {
        module: 'Music.SingerListServer',
        method: 'get_singer_list',
        param: { area: -100, sex: -100, genre: -100, index: -100, sin: 0, cur_page: 1 }
      }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {

        const singerList = data.singerList.data.singerlist
        const singerMap = {
          hot: {
            title: HOT_NAME,
            list: map(singerList.slice(0, 10))
          }
        }

        singerList.forEach((item) => {
          const p = pinyin(item.singer_name)
          if (!p || !p.length) {
            return
          }
          // 获取歌手名拼音的首字母
          const key = p[0][0].slice(0, 1).toUpperCase()
          if (key) {
            if (!singerMap[key]) {
              singerMap[key] = {
                title: key,
                list: []
              }
            }
            // 每个字母下面会有多名歌手
            singerMap[key].list.push(map([item])[0])
          }
        })
        const hot = []
        const letter = []
        // 遍历处理 singerMap，让结果有序
        for (const key in singerMap) {
          const item = singerMap[key]
          if (item.title.match(/[a-zA-Z]/)) {
            letter.push(item)
          } else if (item.title === HOT_NAME) {
            hot.push(item)
          }
        }
        // 按字母顺序排序
        letter.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })

        res.json({
          code: ERR_OK,
          result: {
            singers: hot.concat(letter)
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}
function registerSingerDetail(app) {
  app.get('/api/getSingerDetail', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    const data = JSON.stringify({
      comm: { ct: 24, cv: 0 },
      singerSongList: {
        method: 'GetSingerSongList',
        param: { order: 1, singerMid: req.query.mid, begin: 0, num: 100 },
        module: 'musichall.song_list_server'
      }
    })

    const randomKey = getRandomVal('getSingerSong')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const list = data.singerSongList.data.songList
        // 歌单详情、榜单详情接口都有类似处理逻辑，固封装成函数
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

function registerSongsUrl(app) {
  app.get('/api/getSongsUrl', (req, res) => {
    const mid = req.query.mid

    let midGroup = []
    // third-party api support a max number of 100 songs request,
    // so slice list if it's over 100 records
    if (mid.length > 100) {
      const groupLen = Math.ceil(mid.length / 100)
      for (let i = 0; i < groupLen; i++) {
        midGroup.push(mid.slice(i * 100, (100 * (i + 1))))
      } 
    } else {
      midGroup = [mid]
    }

    const urlMap = {}

    function process(mid) {
      const data = {
        req_0: {
          module: 'vkey.GetVkeyServer',
          method: 'CgiGetVkey',
          param: {
            guid: getUid(),
            songmid: mid,
            songtype: new Array(mid.length).fill(0),
            uin: '0',
            loginflag: 0,
            platform: '23',
            h5to: 'speed'
          }
        },
        comm: {
          g_tk: token,
          uin: '0',
          format: 'json',
          platform: 'h5'
        }
      }

      const sign = getSecuritySign(JSON.stringify(data))
      const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`

      // 发送 post 请求
      return post(url, data).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
          const midInfo = data.req_0.data.midurlinfo
          const sip = data.req_0.data.sip
          const domain = sip[sip.length - 1]
          midInfo.forEach((info) => {
            // 获取歌曲的真实播放 URL
            urlMap[info.songmid] = domain + info.purl
          })
        }
      })
    }

    const requests = midGroup.map( (mid) => {
      return process(mid)
    })

    return Promise.all(requests).then( () => {
      res.json({
        code: ERR_OK,
        result: {
          map: urlMap
        }
      })
    })
  })
}

function map(singerList) {
  return singerList.map((item) => {
    return {
      id: item.singer_id,
      mid: item.singer_mid,
      name: item.singer_name,
      pic: item.singer_pic.replace(/\.webp$/, '.jpg').replace('150x150', '800x800')
    }
  })
}

module.exports = registerRouter