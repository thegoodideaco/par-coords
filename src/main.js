/* eslint-disable no-unused-vars */

import {
  createApp, ref, watch
} from 'vue-demi'

import './config'
import '@/assets/scss/main.scss'
import App from './App.vue'
import Vue from 'vue'
import router from './router'

Vue.config.productionTip = false

createApp(
  new Vue({
    router,
    render: (h) => h(App)
  }).$mount('#app')
)
