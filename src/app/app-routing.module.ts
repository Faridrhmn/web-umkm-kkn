import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'padukuhan',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pengajuan',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pengajuan/detail',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pemetaan',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'map-setting',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tanggapan',
    loadChildren: () => import('./root/root.module').then((m) => m.RootModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then((m) => m.PrivacyModule),
  },
  {
    path: 'download',
    loadChildren: () => import('./download/download.module').then((m) => m.DownloadModule)
  },
  {
    path: 'changelog',
    loadChildren: () => import('./changelog/changelog.module').then((m) => m.ChangelogModule)
  },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
