<template>
    <div class="loading">
        <img width="24" height="24" src="./loading.gif" alt="">
        <p class="desc">{{ title }}</p>
    </div>
</template>

<script>
export default {
    name: 'loading',
    data() {
        return {
            title: ''
        }
    },
    methods: {
        setTitle(title) {
            console.log('setTitle method called...')
            this.title = title
        }
    }
}
</script>

<style lang="scss" scoped>
  .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);

      .loading-content {
          text-align: center;

          .desc {
              line-height: 20px;
              font-size: $font-size-small;
              color: $color-text-l;
          }
      }
  }
</style>