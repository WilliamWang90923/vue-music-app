<template>
  <div>
    <m-header></m-header>
    <tab></tab>
    <router-view></router-view>
  </div>
</template>

<script>
  import Header from '@/components/header/header'
  import Tab from '@/components/tab/tab'

  export default {
    components: {
      MHeader: Header,
      Tab: Tab
    }
  }
</script>