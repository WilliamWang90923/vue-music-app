<template>
  <div>
    <m-header></m-header>
    <tab></tab>
    <router-view></router-view>
    <player></player>
  </div>
</template>

<script>
  import Header from '@/components/header/header'
  import Tab from '@/components/tab/tab'
  import Player from '@/components/player/player'

  export default {
    components: {
      MHeader: Header,
      Tab: Tab,
      Player
    }
  }
</script>