import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PengajuanComponent } from './pengajuan/pengajuan.component';
import { DetailComponent } from '../detail/detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: PengajuanComponent
  },
  {
    path: 'detail',
    component: DetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PengajuanRoutingModule { }
