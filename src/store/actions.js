import { PLAY_MODE } from '../assets/js/constant'
import { shuffle } from '../assets/js/utils'

export function selectPlay({ commit }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlayList', list)
    commit('setCurrentIndex', index)
}

export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlayList', shuffle(list))
    commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
    const currentId = getters.currentSong.id
    if (mode === PLAY_MODE.random) {
        commit('setPlayList', shuffle(state.sequenceList))
    } else {
        commit('setPlayList', state.sequenceList)
    }
    const index = state.playList.findIndex((song) => {
        return song.id === currentId
    })
    commit('setCurrentIndex', index)
    commit('setPlayMode', mode) 
}