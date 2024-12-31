import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  onDownload() {
    const link = document.createElement('a');
    link.setAttribute('target', '');
    link.setAttribute('href', 'https://firebasestorage.googleapis.com/v0/b/logandeng-app.appspot.com/o/apk%2Fggs_1.2.apk?alt=media&token=caf4daa8-14fd-431a-8822-66eb787f86c1');
    link.setAttribute('download', `ggs_1.2.apk`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
