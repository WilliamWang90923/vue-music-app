import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Lazy from 'vue3-lazy'
import loadingDirective from '@/components/base/loading/directive'
import noResultDirective from './components/base/loading/no-result/directive'

import '@/assets/scss/index.scss'

createApp(App).use(store).use(router).use(Lazy, {
    error: require('@/assets/images/error.png'),
    loading: require('@/assets/images/loading.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')
