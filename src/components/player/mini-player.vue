<template>
    <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="showNormalPlayer">
            <div class="cd-wrapper">
                <div class="cd" ref="cdRef">
                    <img :class="cdCls" :src="currentSong.pic" alt="" 
                         width="40" height="40" ref="cdImageRef"> 
                </div>
            </div>
            <div class="slider-wrapper" ref="sliderWrapperRef">
                <div class="slider-group">
                    <div class="slider-page" v-for="song in playList" :key="song.id">
                        <h2 class="name">{{ song.name }}</h2>
                        <p class="desc">{{ song.singer }}</p>
                    </div>
                </div>
            </div>
            <div class="controll">
                <progress-circle :progress="progress" :radius="32"
                >
                    <i class="icon-mini" :class="miniPlayIcon" @click.stop="togglePlay"></i>
                </progress-circle>
            </div>
        </div>
    </transition>
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
import useCd from './use-cd'
import useMiniSlider from './use-mini-slider'
import ProgressCircle from './progress-circle.vue'

export default {
    name: 'mini-player',
    components: {
        ProgressCircle
    },
    props: {
        progress: {
            type: Number,
            default: 0
        },
        togglePlay: Function
    },
    setup() {
        const store = useStore()
        const fullScreen = computed(() => store.state.fullScreen)
        const currentSong = computed(() => store.getters.currentSong)
        const playing = computed(() => store.state.playing)
        const playList = computed(() => store.state.playList)

        const { cdCls, cdRef, cdImageRef } = useCd()
        const { sliderWrapperRef } = useMiniSlider()

        const miniPlayIcon = computed(() => {
            return playing.value ? 'icon-pause-mini' : 'icon-play-mini'
        })

        function showNormalPlayer() {
            store.commit('setFullScreen', true)
        }

        return {
            fullScreen,
            currentSong,
            playList,
            cdCls,
            cdRef,
            cdImageRef,
            showNormalPlayer,
            miniPlayIcon,
            sliderWrapperRef
        }
    }
}
</script>

<style lang="scss" scoped>
.mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    .cd-wrapper {
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        padding: 0 10px 0 20px;
        .cd {
            height: 100%;
            width: 100%;
            img {
                border-radius: 50%;
                &.playing {
                    animation: rotate 10s linear infinite;
                }
                &.pause {
                    animation-play-state: paused;
                }
            }
        }
    }
    .slider-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .slider-group {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        .slider-page {
          display: inline-block;
          width: 100%;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          .name {
            margin-bottom: 2px;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text;
          }
          .desc {
            @include no-wrap();
            font-size: $font-size-small;
            color: $color-text-d;
          }
        }
      }
    }
    .controll {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-mini {
            position: absolute;
            left: 0;
            top: 0;
            color: $color-theme-d;
            font-size: 32px;
        }
    }
    &.mini-enter-active, &.mini-leave-active {
        transition: all 0.8
         cubic-bezier(0.45, 0, 0.55, 1);
    }
    &.mini-enter-from, &.mini-leave-to {
        opacity: 0;
        transform: translate3d(0, 100%, 0)
    }
}
</style>\