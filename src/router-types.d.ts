import '@tanstack/react-router'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof import('./router').router
  }
}