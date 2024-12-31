import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit{
  
  pdfSrc = "assets/pdf/update.pdf";
  trueSize = true;

  ngOnInit(): void {
    window.addEventListener('resize', (event) => {
      const width = window.innerWidth;
      
      this.trueSize = width > 900;
    })
  }
}



