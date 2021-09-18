import loadable from '@loadable/component'
import Home from '@/pages/MainPage'

const routesConfig = [
  {
    path: '/home',
    component: Home,
  },
  {
    path: "/medicalCard",
    component: loadable(() => import('@/pages/MedicalCard'))
  },
  {
    path: '/',
    component: Home
  },

]

export default routesConfig