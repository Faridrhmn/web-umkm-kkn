import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangelogRoutingModule } from './changelog-routing.module';
import { ChangelogComponent } from './changelog/changelog.component';
import { PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';


@NgModule({
  declarations: [
    ChangelogComponent
  ],
  imports: [
    CommonModule,
    ChangelogRoutingModule,
    PdfViewerModule
  ]
})
export class ChangelogModule { }
