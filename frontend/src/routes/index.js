import loadable from '@loadable/component'
import Home from '@/pages/MainPage'

const routesConfig = [
  {
    path: '/home',
    component: Home,
  },
  {
    path: "/CardInfo",
    component: loadable(() => import('@/pages/CardInfo'))
  },
  {
    path: '/',
    component: Home
  },
]

export default routesConfig