import Vue from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

library.add(faInfoCircle)

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

Vue.component('Icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
