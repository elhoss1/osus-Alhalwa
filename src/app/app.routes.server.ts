import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'payment-confirmation/:orderId',
    renderMode: RenderMode.Server
  },



  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
