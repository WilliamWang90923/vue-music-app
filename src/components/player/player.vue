<template>
<div class="player">
    <div class="normal-player" v-show="fullScreen">
        <div class="background">
            <img :src="currentSong.pic" alt="">
        </div>
        <div class="top">
            <div class="back">
                <i class="icon-back" @click="goBack"></i>
            </div>
            <h1 class="title">{{ currentSong.name }}</h1>
            <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div class="middle">
            <div class="middle-l">
                <div class="cd-wrapper">
                    <div class="cd" ref="cdRef">
                        <img class="image" ref="cdImageRef" :class="cdCls" :src="currentSong.pic" alt="">
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="progress-wrapper">
                <span class="time time-l">{{ formatTime(currentTime) }}</span>
                <div class="progress-bar-wrapper">
                    <progress-bar 
                      :progress="progress"
                      @progress-changing="onProgressChanging"
                      @progress-changed="onProgressChanged">
                    </progress-bar>
                </div>
                 <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
            </div>
           
            <div class="operators">
                <div class="icon i-left">
                    <i :class="modeIcon" @click="changeMode"></i>
                </div>
                <div class="icon i-left" :class="disableCls">
                    <i class="icon-prev" @click="prev"></i>
                </div>
                <div class="icon i-center" :class="disableCls">
                    <i :class="playIcon" @click="togglePlay"></i>
                </div>
                <div class="icon i-right" :class="disableCls">
                    <i class="icon-next" @click="next"></i>
                </div>
                <div class="icon i-right">
                    <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
                </div>
            </div>
        </div>
    </div>
    <audio ref="audioRef" @pause="pause" @canplay="ready" @error="error" 
           @timeupdate="updateTime" @ended="end"></audio>
</div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCD from './use-cd'
import useLyric from './use-lyric'
import music1 from '@/assets/music/3.mp3'
import progressBar from './progress-bar.vue'
import { formatTime } from '@/assets/js/utils'
import { PLAY_MODE } from '@/assets/js/constant'

export default {
  components: { progressBar },
    name: 'player',
    setup(props, { emit }) {
        // data
        const audioRef = ref(null)
        const songReady = ref(false)
        const currentTime = ref(0)
        let progressChanging = false
        // vuex concerned 
        const store = useStore()
        const fullScreen = computed(() => store.state.fullScreen)
        const currentSong = computed(() => store.getters.currentSong)
        const playing = computed(() => store.state.playing)
        const currentIndex = computed(() => store.state.currentIndex)
        const playMode = computed(() => store.state.playMode)
        // hooks
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        const { cdCls, cdRef, cdImageRef } = useCD()
        useLyric()
        // GUI computed properties
        const playlist = computed(() => store.state.playList)
        const disableCls = computed(() => {
            return songReady.value ? '' : 'disable'
        })

        const playIcon = computed(() => {
            return playing.value ? 'icon-pause' : 'icon-play'
        })

        const progress = computed(() => {
            // console.log('progress', currentTime.value / currentSong.value.duration)
            return currentTime.value / currentSong.value.duration
        })

        watch(currentSong, (newSong) => {
            if (!newSong.id || !newSong.url) {
                return
            }
            currentTime.value = 0
            songReady.value = false
            const audioEl = audioRef.value
            // audioEl.src = newSong.url
            audioEl.src = music1
            audioEl.play()
        })

        watch(playing, (newPlaying) => {
            if (!songReady.value) {
                return
            }
            const audioEl = audioRef.value
            newPlaying ? audioEl.play() : audioEl.pause()
        })

        function goBack() {
            store.commit('setFullScreen', false)
        }

        function togglePlay() {
            if (!songReady.value) {
                return
            }
            store.commit('setPlayingState', !playing.value)
        }

        function pause() {
            store.commit('setPlayingState', false)
        }

        function ready() {
            if (songReady.value) {
                return
            }
            songReady.value = true
        }

        function error() {
            songReady.value = true
        }

        function prev() {
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value - 1
                if (index === -1) {
                    index = list.length - 1
                }
                store.commit('setCurrentIndex', index)
                if (!playing.value) {
                    store.commit('setPlayingState', true)
                }
            }
        }

        function next() {
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
             if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value + 1
                if (index === list.length) {
                    index = 0
                }
                store.commit('setCurrentIndex', index)
                if (!playing.value) {
                    store.commit('setPlayingState', true)
                }
            }
        }

        function loop() {
            const audioEl = audioRef.value
            audioEl.currentTime = 0
            audioEl.play()
            store.commit('setPlayingState', true)
        }

        function updateTime(e) {
            if (!progressChanging) {
                currentTime.value = e.target.currentTime
            }
        }

        function onProgressChanging(progress) {
            progressChanging = true
            currentTime.value = currentSong.value.duration * progress
        }

        function onProgressChanged(progress) {
            progressChanging = false
            audioRef.value.currentTime = currentTime.value =
                currentSong.value.duration * progress
                if (!playing.value) {
                    store.commit('setPlayingState', true)
                }
        }

        function end() {
            currentTime.value = 0
            if (playMode.value === PLAY_MODE.loop) {
                loop()
            } else {
                next()
            }
        }

        return {
            goBack,
            audioRef,
            fullScreen,
            currentTime,
            currentSong,
            playIcon,
            progress,
            disableCls,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            end,
            error,
            modeIcon,
            cdCls,
            cdRef,
            cdImageRef,
            updateTime,
            formatTime,
            changeMode,
            onProgressChanging,
            onProgressChanged,
            getFavoriteIcon,
            toggleFavorite
        }
    }
}
</script>

<style lang="scss" scoped>
  .player {
      .normal-player {
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 150;
          background: $color-background;
          .background {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              z-index: -1;
              opacity: 0.6;
              filter: blur(20px);

              img {
                  width: 100%;
                  height: 100%;
              }
          }
          .top {
              position: relative;
              margin-bottom: 25px;
              .back {
                  position: absolute;
                  top: 0;
                  left: 6px;
                  z-index: 50;
              }
              .icon-back {
                  display: block;
                  padding: 9px;
                  line-height: 40px;
                  text-align: center;
                  @include no-wrap();
                  font-size: $font-size-large;
                  color: $color-text;
              }
              .title {
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                @include no-wrap();
                font-size: $font-size-large;
                color: $color-text;
                }
                .subtitle {
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
                }
           }

           .middle {
               position: fixed;
               width: 100%;
               top: 80px;
               bottom: 170px;
               white-space: nowrap;
               font-size: 0;
               .middle-l {
                   display: inline-block;
                   vertical-align: top;
                   position: relative;
                   width: 100%;
                   height: 0;
                   padding-top: 80%;
                   .cd-wrapper {
                       position: absolute;
                       left: 10%;
                       top: 0;
                       width: 80%;
                       box-sizing: border-box;
                       height: 100%;
                       .cd {
                           width: 100%;
                           height: 100%;
                           border-radius: 50%;
                           img {
                               position: absolute;
                               left: 0;
                               top: 0;
                               width: 100%;
                               height: 100%;
                               box-sizing: border-box;
                               border-radius: 50%;
                               border: 10px solid rgba(255, 255, 255, 0.2)
                           }
                           .playing {
                               animation: rotate 20s linear infinite;
                           }
                       }
                   }
               }
           }

           .bottom {
                position: absolute;
                bottom: 50px;
                width: 100%;
                .progress-wrapper {
                    display: flex;
                    align-items: center;
                    width: 80%;
                    margin: 0px auto;
                    padding: 10px 0;
                    .time {
                        color: $color-text;
                        font-size: $font-size-small;
                        flex: 0 0 40px;
                        line-height: 30px;
                        width: 40px;
                        &.time-l {
                            text-align: left;
                        }
                        &.time-r {
                            text-align: right;
                        }
                    }
                    .progress-bar-wrapper {
                        flex: 1;
                    }
                }
                .operators {
                    display: flex;
                    align-items: center;
                    .icon {
                        flex: 1;
                        color: $color-theme;
                        &.disable {
                        color: $color-theme-d;
                        }
                        i {
                        font-size: 30px;
                        }
                    }
                    .i-left {
                        text-align: right;
                    }
                    .i-center {
                        padding: 0 20px;
                        text-align: center;
                        i {
                        font-size: 40px;
                        }
                    }
                    .i-right {
                        text-align: left
                    }
                    .icon-favorite {
                        color: $color-sub-theme;
                    }
                }
           }
      }
  }
</style>