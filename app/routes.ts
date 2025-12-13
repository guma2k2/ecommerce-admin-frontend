import { type RouteConfig, layout } from '@react-router/dev/routes'

export default [
  layout('layouts/unAuthenticate/UnAuthenticateLayout.tsx', []),
  layout('layouts/authenticate/AuthenticateLayout.tsx', [])
] satisfies RouteConfig
