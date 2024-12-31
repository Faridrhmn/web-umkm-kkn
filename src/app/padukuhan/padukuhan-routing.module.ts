import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PadukuhanComponent } from './padukuhan/padukuhan.component';

const routes: Routes = [
  {
    path: '',
    component: PadukuhanComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PadukuhanRoutingModule { }
