import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AllProductsComponent } from './pages/all-products/all-products';
import { ChocolateProductsComponent } from './pages/chocolate-products/chocolate-products';
import { SweetsProductsComponent } from './pages/sweets-products/sweets-products';
import { CartComponent } from './pages/cart/cart';
import { CheckoutComponent } from './pages/checkout/checkout';
import { CakeProductsComponent } from './pages/cake-products/cake-products';
import { MiniOsusProduct } from './pages/miniosus-product/mini-products';
import { LoginComponent } from './components/login/login';
import { UserDashboardComponent } from './components/user dashbord/user-dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'products', component: AllProductsComponent },
  { path: 'products', loadComponent:()=> import('./pages/all-products/all-products').then((m)=>m.AllProductsComponent) },
  // { path: 'products/cake', component: CakeProductsComponent },
  { path: 'products/cake', loadComponent:()=>import('./pages/cake-products/cake-products').then((m)=>m.CakeProductsComponent) },
  // { path: 'products/chocolate', component: ChocolateProductsComponent },
  { path: 'products/chocolate', loadComponent:()=> import('./pages/chocolate-products/chocolate-products').then((m)=>m.ChocolateProductsComponent) },
  // { path: 'products/sweets', component: SweetsProductsComponent },
  { path: 'products/sweets', loadComponent:()=> import('./pages/sweets-products/sweets-products').then((m)=>m.SweetsProductsComponent) },
  // { path: 'cart', component: CartComponent },
  { path: 'cart', loadComponent:()=>import('./pages/cart/cart').then((m)=>m.CartComponent) },
  // { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout', loadComponent:()=> import('./pages/checkout/checkout').then((m)=>m.CheckoutComponent) },
  // { path: 'products/mini-osus', component: MiniOsusProduct },
  { path: 'products/mini-osus', loadComponent:()=> import('./pages/miniosus-product/mini-products').then((m)=>m.MiniOsusProduct) },
  { path: 'privice', loadComponent:()=> import('./pages/privice/privice').then((m)=>m.Privice) },
  { path: 'whous', loadComponent:()=> import('./pages/whoare/whoare').then((m)=>m.Whoare) },
  // { path: 'login', component: LoginComponent },

  { path: 'payment-confirmation/:orderId', loadComponent:()=>import('./pages/payment-confirmation/payment-confirmation').then((m)=>m.PaymentConfirmationComponent) },

  {
    path: 'favorites' , loadComponent:()=>import('./pages/favorites/favorites').then((m)=>m.FavoritesComponent)
  },

  { path: '**', redirectTo: ''  },
];
