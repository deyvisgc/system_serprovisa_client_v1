// import { NgModule } from '@angular/core';
// import { Routes, RouterModule } from '@angular/router';

// import { FullComponent } from './layouts/full/full.component';

// export const Approutes: Routes = [
//   {
//     path: '',
//     component: FullComponent,
//     children: [
//       { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//       {
//         path: 'dashboard',
//         loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
//       },
//       {
//         path: 'about',
//         loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
//       },
//       {
//         path: 'component',
//         loadChildren: () => import('./component/component.module_v1').then(m => m.ComponentsModule)
//       }
//     ]
//   },
//   {
//     path: '**',
//     redirectTo: '/starter'
//   }
// ];
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { LoginComponent } from './auth/login/login.component';

export const Approutes: Routes = [
  //routinbs
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'system',
    component: FullComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'component',
        loadChildren: () => import('./component/component.module').then(m => m.ComponentsModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
