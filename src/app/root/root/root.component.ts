import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface User {
  username: String,
  fullname: String,
  role: String
}

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
  isSidenavOpen = true;
  docStyle = document.documentElement.style;
  sidenavClass = "sidenav";
  sidenavContent = "sidenav-content";
  content = "";
  user: User = {
    username: "",
    fullname: "",
    role: ""
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.content = this.router.url.split('?')[0];

    let userData = JSON.parse(localStorage.getItem('user')!);

    this.user = userData ? userData : this.user;

    this.isSidenavOpen = !(localStorage.getItem('sidenav') == 'open');

    this.togleSidenav();
  }

  togleSidenav() {
    let sideWidth = "", contentWidth = "", infoWidth = "", avatarMargin = "";
    let avatarSize = "", labelWidth = "", arrowLabel = "";

    let sidenavArr = document.getElementsByClassName("sidenav-content");
    for(let i = 0; i < sidenavArr.length; i++) {
      sidenavArr.item(i)?.classList.remove("sidenav-content-active");
    }

    const windowWidth = window.innerWidth;

    this.setHiddenSidenav(false);
    this.sidenavContent = "sidenav-content";

    if(this.isSidenavOpen) {
      sideWidth = windowWidth < 900 ? "0vw" : "80px";
      contentWidth = windowWidth < 900 ? "100vw" : "calc(100vw - 80px)";
      infoWidth = "0vw";
      avatarMargin = "0vw";
      labelWidth = "0vw";
      avatarSize = windowWidth < 900 ? "0vw" : "32px";
      arrowLabel = "0";

      if(windowWidth < 900) this.setHiddenSidenav(true);
      else this.sidenavContent = "sidenav-content sidenav-hover";

      localStorage.setItem('sidenav', 'closed');

    } else {
      sideWidth = windowWidth < 900 ? "80px" : "16vw";
      contentWidth = windowWidth < 900 ? "calc(100vw - 80px)" : "84vw";
      infoWidth = windowWidth < 900 ? "0vw" : "calc(12vw - 64px)";
      avatarMargin = windowWidth < 900 ? "0vw" : "16px";
      avatarSize = windowWidth < 900 ? "32px" : "4vw";
      labelWidth = windowWidth < 900 ? "0vw" : "calc(16vw - 96px)";
      arrowLabel = windowWidth < 900 ? "0" : "1";

      if(windowWidth < 900) this.sidenavContent = "sidenav-content sidenav-hover";

      localStorage.setItem('sidenav', 'open');
    }

    this.docStyle.setProperty("--root-content-width", contentWidth);
    this.docStyle.setProperty("--sidenav-width", sideWidth);
    this.docStyle.setProperty("--sidenav-info-width", infoWidth);
    this.docStyle.setProperty("--sidenav-avatar-margin", avatarMargin);
    this.docStyle.setProperty("--sidenav-avatar-size", avatarSize);
    this.docStyle.setProperty("--sidenav-label-width", labelWidth);
    this.docStyle.setProperty("--label-arrow-opacity", arrowLabel);

    this.isSidenavOpen = !this.isSidenavOpen;
  }

  onResize($event: UIEvent) {
    this.isSidenavOpen = window.innerWidth < 900 ? true : false;

    this.togleSidenav();
  }

  openDropdown(event: any) {
    if(this.isSidenavOpen && window.innerWidth > 900) {
      let parentNode: Element = event.currentTarget.parentNode;

      let sidenavArr = document.getElementsByClassName("sidenav-content");
      for(let i = 0; i < sidenavArr.length; i++) {
        if(sidenavArr.item(i) != parentNode)
          sidenavArr.item(i)?.classList.remove("sidenav-content-active");
      }

      parentNode.classList.toggle("sidenav-content-active");
    }
  }

  setHiddenSidenav(isHidden: boolean) {
    this.sidenavClass = isHidden ? "sidenav sidenav-hidden" : "sidenav";
  }

  logout() {
    Swal.fire({
      title: 'Yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('login-token');
        this.router.navigate(['/login'])
      }
    })
  }

  onSidenavContentClick(path: String) {
    this.router.navigate([path])
  }
}
