import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { Transaction, addDoc, collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, orderBy, query, runTransaction, setDoc, writeBatch } from 'firebase/firestore';
import { ImagePrevDialogComponent } from 'src/app/shared/image-prev-dialog/image-prev-dialog.component';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface Pengajuan {
  id: string,
  fullname: String,
  service: String,
  service_name: String,
  status: String
}

interface Search {
  keyword: string,
  service: string,
  status: string
}

export interface DialogData {
  title: String,
  pengajuanList: Array<Pengajuan>,
  itemList: Array<Item>,
  itemListTemp: Array<Item>,
  favItemIdList: [],
  totalFavItem: number,
  callback: any
}

interface User {
  username: String,
  fullname: String,
  role: String
}

interface Tanggapan {
  id: string,
  fullname: String,
  email: String,
  tanggapan: String,
  timestamp: String
}

interface Item {
  id: string,
  item: String,
  price: String,
  src: string,
  fav: boolean,
  umkm: String,
  idUmkm: String
}

interface FavItem {
  item: String,
  price: String,
  src: String,
  idUmkm: String,
  umkm: String,
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isListLoading = true;
  isData = false;
  pengajuanList: Array<Pengajuan> = [];
  pengajuanListtemp: Array<Pengajuan> = [];
  tanggapanList: Array<Tanggapan> = [];
  itemList: Array<Item> = [];
  pageIndex = 0;
  pageSize = 5;
  user: User = {
    username: "",
    fullname: "",
    role: ""
  }
  totalUMKM = 0;
  totalItems = 0;
  addfavItem = true;
  totalFavItem = 0;
  favItemIdList: Array<string> = [];
  favItemList: Array<FavItem> = []

  totalPengajuan = 0;
  totalKunjungan = 0;
  totalAntrian = 0;

  constructor(private dialog: MatDialog, private router:Router) {}

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('user')!);

    this.user = userData ? userData : this.user;
    
    this.loadPengajuan().then(isLoading => {
      this.isListLoading = isLoading;
    })

    this.loadTanggapan().then(isLoading => {
      this.isListLoading = isLoading;
    })

    this.loadLocation().then(isloading => {
      this.isListLoading = isloading;
    })

    this.loadFavItem().then(isloading => {
      this.isListLoading = isloading;
    })

    const firstOpen = localStorage.getItem('first_open_on_update');
  }

  //LOAD PENGAJUAN
  async loadPengajuan(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "pengajuan"));

    let jumlahPengajuan = 0;

    onSnapshot(q, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        this.isData = true;
        this.pengajuanList = [];
        querySnapshot.forEach(async (item) => {
          if (item.data()["status"].includes("diproses"))
            this.pengajuanList.push({
              id: item.id,
              fullname: item.data()["nama_lengkap"],
              service: item.data()["service"],
              service_name: item.data()["service_name"],
              status: item.data()["status"]
            })

          jumlahPengajuan++;
        })
        this.pengajuanListtemp = this.pengajuanList;
        this.totalPengajuan = jumlahPengajuan;
        this.totalAntrian = this.pengajuanList.length;
      } else {
        this.isData = false;
      }
    })

    const q2 = query(collection(db, "application"));
    onSnapshot(q2, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        querySnapshot.forEach(async (item) => {
          if(item.id == "dashboard") {
            this.totalKunjungan = item.data()["total_kunjungan"]
          }
        })
      }
    })

    return(false);
  }


  // LOAD LOCATION
  async loadLocation(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "location"));
    onSnapshot(q, (querySnapshot) => {
      this.totalUMKM = querySnapshot.size;

      if(querySnapshot.size > 0) {
        querySnapshot.forEach(async (item) => {
          this.totalItems += item.data()["items"].length

          if(item.data()["items"].length > 0) {
            item.data()["items"].forEach((itm: { [x: string]: any; }) => {

              this.itemList.push({
                id: itm["id"],
                item: itm["item"],
                price: itm["price"],
                src: itm["src"],
                fav: itm["fav"],
                umkm: item.data()["name"],
                idUmkm: item.data()["id"]
              })
            })

            this.addfavItem = false;
          }
        })
      }
    })

    return(false);
  }

  //LOAD FAV ITEM
  async loadFavItem(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "fav_items"));
    onSnapshot(q, (querySnapshot) => {
      this.favItemList = []
      if(querySnapshot.size > 0) {
        querySnapshot.forEach(async (item) => {
          this.itemList.forEach(itm => {
            if(itm.id == item.id) itm.fav = true
          })

          this.favItemIdList.push(item.id)
          this.favItemList.push({
            item: item.data()["item"],
            price: item.data()["price"],
            src: item.data()["src"],
            umkm: item.data()["umkm"],
            idUmkm: item.data()["idUmkm"]
          })
          this.totalFavItem++
          this.addfavItem = false;
        })
      }
    })

    return(false);
  }

  //LOAD TANGGAPAN
  async loadTanggapan(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "tanggapan"), orderBy("timestamp", "desc"));

    onSnapshot(q, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        this.isData = true;
        this.tanggapanList = [];

        querySnapshot.forEach(async (item) => {
          this.tanggapanList.push({
            id: item.id,
            fullname: item.data()["nama_lengkap"],
            email: item.data()["email"],
            tanggapan: item.data()["tanggapan"],
            timestamp: item.data()["timestamp"]
          })
        })
      } else {
        this.isData = false;
      }
    })

    return(false);
  }

  openDialogAddFav() {
    const dialogRef = this.dialog.open(DashboardDialogModal, {
      data: {
        itemList: this.itemList,
        itemListTemp: this.itemList,
        favItemIdList: this.favItemIdList,
        title: "Tambah Produk Unggulan",
        totalFavItem: this.totalFavItem
      },
    })
  }

  openPengajuan(id: string) {
    this.router.navigate(["/pengajuan/detail"], { 
      queryParams: { 
        id: id 
      } 
    });
  }

  openAllPengajuan() {
    this.router.navigate(["/pengajuan"]);
  }

  openTanggapan() {
    this.router.navigate(["/tanggapan"]);
  }

  

  openDialog() {
    this.dialog.open(DashboardDialogModal, {
      data: {
        title: "Download Aplikasi",
      },
    })
  }

  //ON SEARCH CALLBACK
  onSearchCallback(search: Search) {
    if(search.keyword == "" && search.service == "all" && search.status == "all") {
      this.pengajuanList = this.pengajuanListtemp
    } else {
      this.pengajuanList = [];
      this.pengajuanListtemp.forEach(item => {
        if(item.status == search.status || search.status == "all") {
          if(item.service == search.service || search.service == "all") {
            let condition = item.fullname.toLowerCase().includes(search.keyword);
            if(condition) {
              this.pengajuanList.push(item)
            }
          }
        }
        
      })
    }
  }

  handlePageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize
  }

  openOnDialog(url: String) {
    this.router.navigate([url]);
  }

  openDialogImage(src: string) {
    this.dialog.open(ImagePrevDialogComponent, {
      data: {
        src: document.getElementById(src)?.getAttribute('src')
      }
    })
  }
}










@Component({
  selector: 'dashboard-modal',
  templateUrl: './dashboard.dialog.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardDialogModal implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<DashboardDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router,
    private dialog: MatDialog
  ) {
    dialogRef.disableClose = true;
  }

  tempListItem: Array<Item> = [];

  updateItem = {};
  
  ngOnInit(): void {
    this.data.itemListTemp.forEach(item => {
      this.tempListItem.push(item)
    }) 
  }

  openOnDialog(url: String) {
    this.dialogRef.close();
    this.router.navigate([url]);
  }

  closeDialog() {
    this.onSaveAddFavItem()

    this.dialogRef.close()
  }

  openDialogImage(src: string) {
    this.dialog.open(ImagePrevDialogComponent, {
      data: {
        src: document.getElementById(src)?.getAttribute('src')
      }
    })
  }

  onCheckboxClick(event: any, index: number) {
    if(event.target.checked) {
      if(this.data.totalFavItem < 10) {
        this.data.totalFavItem++
        this.data.itemList[index].fav = true
      } else {
        event.target.checked = false;
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan !',
          text: 'Hanya dapat memilih 10 produk unggulan'
        })
      }
    } else {
      this.data.totalFavItem--
      this.data.itemList[index].fav = false
    }
  }

  async onSaveAddFavItem() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Menyimpan Data...',
      text: 'Harap tunggu sebentar',
    })

    const batch = writeBatch(db);

    this.data.itemList.forEach(async (item, index) => {
      if (item.fav) {
        if (!this.checkItemAvailable(item.id)) {
          let favItem: FavItem = {
            item: item.item,
            price: item.price,
            src: item.src,
            idUmkm: item.idUmkm,
            umkm: item.umkm
          };
          batch.set(doc(db, "fav_items", item.id), favItem);
        }
      } else {
        if (this.checkItemAvailable(item.id)) {
          batch.delete(doc(db, "fav_items", item.id));
        }
      }

      if(index == this.data.itemList.length - 1) {
        await batch.commit()
          .then(() => {
            Swal.close()
            Swal.fire({
              icon: 'success',
              title: 'Berhasil !',
              text: 'Berhasil menyimpan data'
            })
          })
          .catch(() => {
            Swal.close()
            Swal.fire({
              icon: 'error',
              title: 'Error !',
              text: 'Terdapat kesalahan internal server'
            })
          });
      }
    })

    
  }

  checkItemAvailable(itemId: String): boolean {
    let x = false

    this.data.favItemIdList.forEach(id => {
      if(id == itemId) x = true;
    })

    return x;
  }
}