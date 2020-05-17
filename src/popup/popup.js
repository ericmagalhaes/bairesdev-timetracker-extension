import Vue from 'vue'
import App from './App'
import {
  BootstrapVue,
  IconsPlugin
} from 'bootstrap-vue'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
/* eslint-disable no-new */
var app = new Vue({
  el: '#app',
  render: h => h(App)
})


