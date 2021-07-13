import { get } from './base'

export function processSongs(songs) {
    if (!songs.length) {
         return Promise.resolve(songs)
    }

    return get('/api/getSongsUrl', {
        mid: songs.map((song) => {
            return song.mid
        })
    }).then((result) => {
        const map = result.map
        return songs.map((song) => {
            song.url = map[song.mid]
            if (song.url === '') {
                song.url = 'fuck china!'
            }
            return song
        }).filter((song) => {
            return song.url 
          })
    }).catch((err) => {
        console.log(err)
        return songs.map((song) => {
            song.url = 'fuck'
            return song
        })
    })
}