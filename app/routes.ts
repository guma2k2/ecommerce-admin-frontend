import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('layouts/unAuthenticate/UnAuthenticateLayout.tsx', []),
  layout('layouts/authenticate/AuthenticateLayout.tsx', [
    route('admin', 'layouts/authenticate/admin/AdminLayout.tsx', [
      index('pages/authenticate/admin/DashboardPage.tsx'),
      route('admin', 'pages/authenticate/admin/ManageProductPage.tsx')
    ])
  ])
] satisfies RouteConfig
