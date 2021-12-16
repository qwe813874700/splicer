import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import globalObject from './util/installGlobal'
// import VueContextMenu from 'vue-contextmenu'
// import Contextmenu from 'vue-contextmenujs'
// import lang from 'element-ui/lib/locale/lang/en'
// import locale from 'element-ui/lib/locale'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/style/scss/index.scss'
import '../../node_modules/animate.css/animate.min.css'
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(globalObject)
// Vue.use(VueContextMenu)

// Vue.use(Contextmenu)

// Vue.use(db)
// locale.use(lang)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
