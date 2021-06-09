<template>
    <div class="recommend" v-loading:[loadingText]="loading">
      <scroll class="recommend-content">
        <div>
            <div class="slider-wrapper">
                <div class="slider-content">
                    <slider v-if="sliders.length > 0" :sliders="sliders"></slider>
                </div>
            </div>
            <div class="recommend-list">
                <h1 class="list-title" v-show="!loading">HOT LIST</h1>
                <ul>
                    <li v-for="item in albums" class="item" :key="item.id">
                        <div class="icon">
                            <img v-lazy="item.pic" alt="" width="60" height="60">
                        </div>
                        <div class="text">
                            <h2 class="name">
                                {{ item.username }}
                            </h2>
                            <p class="title">
                                {{ item.title }}
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </scroll>
    </div>
</template>

<script>
import { getRecommend } from '@/service/recommend'
import Slider from '@/components/base/slider/slider'
import Scroll from '@/components/base/scroll/scroll'

export default {

    name: 'recommend',
    components: {
        Slider,
        Scroll
    },
    data() {
        return {
            sliders: [],
            albums: [],
            loadingText: 'Contents Loading...',
            selectedAlbum: null
        }
    },
    computed: {
        loading() {
            return !this.sliders.length && !this.albums.length
        }
    },
    async created() {
        const result = await getRecommend()
        console.log('get recommend: ', result)
        this.sliders = result.sliders
        this.albums = result.albums
    },
    methods: {
        selectItem(album) {
            this.selectedAlbum = album  
        }
    }
}
</script>

<style lang="scss" scoped>
    .recommend {
        position: fixed;
        width: 100%;
        top: 88px;
        bottom: 0;
        overflow: scroll;

        .recommend-content {
            height: 100%;

            .slider-wrapper {
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 40%;
                overflow: hidden;

                .slider-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                }
            }
            .recommend-list {
                .list-title {
                    height: 65px;
                    line-height: 65px;
                    text-align: center;
                    font-size: $font-size-medium;
                    color: $color-theme;
                }
                .item {
                    display: flex;
                    box-sizing: border-box;
                    align-items: center;
                    padding: 0 20px 20px 20px;

                    .icon {
                        flex: 0 0 60px;
                        width: 60px;
                        padding-right: 20px;
                    }
                    .text {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        flex: 1;
                        line-height: 20px;
                        overflow: hidden;
                        font-size: $font-size-medium;
                    }
                    .name {
                        margin-bottom: 10px;
                        color: $color-text;
                    }
                    .title {
                        color: $color-text-d;
                    }
                }
                
            }
    }   
}
</style>
