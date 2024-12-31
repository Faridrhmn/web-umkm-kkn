import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent {
  constructor(private router: Router,) {}

  onDownload() {
    const link = document.createElement('a');
    link.setAttribute('target', '');
    link.setAttribute('href', 'https://firebasestorage.googleapis.com/v0/b/logandeng-app.appspot.com/o/apk%2Fggs_1.2.apk?alt=media&token=caf4daa8-14fd-431a-8822-66eb787f86c1');
    link.setAttribute('download', `ggs_1.2.apk`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  onDownload2() {
    const link = document.createElement('a');
    link.setAttribute('target', '');
    link.setAttribute('href', 'https://firebasestorage.googleapis.com/v0/b/logandeng-app.appspot.com/o/apk%2FSIP%20ONO%20v1.0.apk?alt=media&token=40710b06-93f1-4005-b7b9-0986cc3af15a');
    link.setAttribute('download', `sip_ono_1.0.apk`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openChangeLog() {
    this.router.navigate(['/changelog']);
  }
}
