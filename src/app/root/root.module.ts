import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RootRoutingModule } from './root-routing.module';
import { RootComponent } from './root/root.component';
import { SharedModule } from '../shared/shared.module';
import PadukuhanDialogModal, { PadukuhanComponent } from '../padukuhan/padukuhan/padukuhan.component';
import UserDialogModal, { UsersComponent } from '../users/users/users.component';
import ProfileDialogModal, { ProfileComponent } from '../profile/profile/profile.component';
import PengajuanDialogModal, { PengajuanComponent } from '../pengajuan/pengajuan/pengajuan.component';
import { DetailComponent } from '../detail/detail/detail.component';
import PemetaanDialogModal, { PemetaanComponent, PemetaanSearchDialogModal, PemetaanSnackbar } from '../pemetaan/pemetaan/pemetaan.component';
import MapSettingDialogModal, { MapSettingComponent } from '../map-setting/map-setting/map-setting.component';
import DashboardDialogModal, { DashboardComponent } from '../dashboard/dashboard/dashboard.component';
import TanggapanDialogModal, { TanggapanComponent } from '../tanggapan/tanggapan/tanggapan.component';


@NgModule({
  declarations: [
    RootComponent,
    DashboardComponent,
    DashboardDialogModal,
    PadukuhanComponent,
    PadukuhanDialogModal,
    UsersComponent,
    UserDialogModal,
    ProfileComponent,
    ProfileDialogModal,
    PengajuanComponent,
    PengajuanDialogModal,
    DetailComponent,
    PemetaanComponent,
    PemetaanDialogModal,
    PemetaanSnackbar,
    PemetaanSearchDialogModal,
    MapSettingComponent,
    MapSettingDialogModal,
    TanggapanComponent,
    TanggapanDialogModal
  ],
  imports: [
    CommonModule,
    RootRoutingModule,
    SharedModule
  ]
})
export class RootModule { }
