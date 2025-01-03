import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RootRoutingModule } from './root-routing.module';
import { RootComponent } from './root/root.component';
import { SharedModule } from '../shared/shared.module';
import UserDialogModal, { UsersComponent } from '../users/users/users.component';
import ProfileDialogModal, { ProfileComponent } from '../profile/profile/profile.component';
import PemetaanDialogModal, { PemetaanComponent, PemetaanSearchDialogModal, PemetaanSnackbar } from '../pemetaan/pemetaan/pemetaan.component';
import MapSettingDialogModal, { MapSettingComponent } from '../map-setting/map-setting/map-setting.component';
import DashboardDialogModal, { DashboardComponent } from '../dashboard/dashboard/dashboard.component';


@NgModule({
  declarations: [
    RootComponent,
    DashboardComponent,
    DashboardDialogModal,
    UsersComponent,
    UserDialogModal,
    ProfileComponent,
    ProfileDialogModal,
    PemetaanComponent,
    PemetaanDialogModal,
    PemetaanSnackbar,
    PemetaanSearchDialogModal,
    MapSettingComponent,
    MapSettingDialogModal
  ],
  imports: [
    CommonModule,
    RootRoutingModule,
    SharedModule
  ]
})
export class RootModule { }
