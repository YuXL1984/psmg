import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import StationList from '@/components/StationList'
import AddStation from '@/components/AddStation'
import StationDetails from '@/components/StationDetails'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/hello',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'StationList',
      component: StationList
    },
    {
      path: '/addstation',
      name: 'AddStation',
      component: AddStation
    },
    {
      path: '/stationdetails',
      name: 'StationDetails',
      component: StationDetails
    }

  ]
})
