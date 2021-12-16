import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'layout',
      component: require('@/components/Layout/Layout').default
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Login/Login').default
    },
    {
      path: '/popwindow',
      name: 'popwindow',
      component: require('@/components/Layout/AllWindow/AllWindow').default
    },
    {
      path: '/connect',
      name: 'connect',
      component: require('@/components/Connect/Connect').default
    }
  ]
})
