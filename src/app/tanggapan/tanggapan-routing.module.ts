import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TanggapanComponent } from './tanggapan/tanggapan.component';

const routes: Routes = [
  {
    path: '',
    component: TanggapanComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TanggapanRoutingModule { }
