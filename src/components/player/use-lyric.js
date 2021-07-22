import { useStore } from 'vuex'
import { computed, watch } from 'vue'
import { getLyric } from '@/service/song'

export default function useLyric() {
    const store = useStore()
    const currentSong = computed(() => {
        return store.getters.currentSong
    })

    watch(currentSong, async (newSong) => {
        if (!newSong.url || !newSong.id) {
            return
        }
        const lyric = await getLyric(newSong)
        console.log('lyric', lyric)
    })
}