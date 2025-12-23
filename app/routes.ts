import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('layouts/unAuthenticate/UnAuthenticateLayout.tsx', [route('login', 'pages/unAuthenticate/LoginPage.tsx')]),
  layout('layouts/authenticate/AuthenticateLayout.tsx', [
    route('admin', 'layouts/authenticate/admin/AdminLayout.tsx', [
      index('pages/authenticate/admin/DashboardPage.tsx'),
      route('admin', 'pages/authenticate/admin/manageProduct/ManageProductPage.tsx')
    ])
  ])
] satisfies RouteConfig
