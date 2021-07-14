<template>
    <ul class="song-list">
        <li class="item" :key="song.id" v-for="(song, index) in songs"
            @click="selectItem(song, index)">
            <div class="content">
                <h2 class="name">{{ song.name }}</h2>
                <p class="desc">{{ getDesc(song) }}</p>
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'song-list',
    props: {
        songs: {
            type: Array,
            default() {
                return []
            }
        }
    },
    emits: ['select'],
    methods: {
       getDesc(song) {
           return `${song.singer}.${song.album}`
       },
       selectItem(song, index) {
           this.$emit('select', { song, index })
       }
    }
}
</script>

<style lang="scss" scoped>
  .song-list {
    .item {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 64px;
        font-size: $font-size-medium;
        .content {
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            .name {
                @include no-wrap();
                color: $color-text
            }
            .desc {
                @include no-wrap();
                margin-top: 4px;
                color: $color-text-d;
            }
        }
    }
  }
</style>