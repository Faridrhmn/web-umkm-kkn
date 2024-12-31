import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { environment } from 'src/environment/environment';

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
  callback: any
}

@Component({
  selector: 'app-pengajuan',
  templateUrl: './pengajuan.component.html',
  styleUrls: ['./pengajuan.component.scss']
})
export class PengajuanComponent implements OnInit {
  isListLoading = true;
  isData = false;
  pengajuanList: Array<Pengajuan> = [];
  pengajuanListtemp: Array<Pengajuan> = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(private dialog: MatDialog, private router:Router) {}

  ngOnInit(): void {
    this.loadPengajuan().then(isLoading => {
      this.isListLoading = isLoading;
    })
  }

  //LOAD PADUKUHAN
  async loadPengajuan(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "pengajuan"), orderBy("timestamp", "desc"));

    onSnapshot(q, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        this.isData = true;
        this.pengajuanList = [];
        querySnapshot.forEach(async (item) => {
          this.pengajuanList.push({
            id: item.id,
            fullname: item.data()["nama_lengkap"],
            service: item.data()["service"],
            service_name: item.data()["service_name"],
            status: item.data()["status"]
          })
        })
        this.pengajuanListtemp = this.pengajuanList;
      } else {
        this.isData = false;
      }
    })

    return(false);
  }

  openDialogSearch() {
    this.dialog.open(PengajuanDialogModal, {
      data: {
        pengajuanList: this.pengajuanList,
        title: "Pencarian",
        callback: this.onSearchCallback.bind(this)
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
}





@Component({
  selector: 'pengajuan-modal',
  templateUrl: './pengajuan.dialog.html',
  styleUrls: ['./pengajuan.component.scss']
})
export default class PengajuanDialogModal implements OnInit {
  searchForm: FormGroup = this.initSearchFormGroup();

  constructor(
    private dialogRef: MatDialogRef<PengajuanDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }
  
  ngOnInit(): void {
    
  }

  initSearchFormGroup() {
    return this.fb.group({
      keyword: [''],
      service: ['all'],
      status: ['all'],
    })
  }

  onSearch() {
    if(!this.searchForm.invalid) {
      let search: Search = this.searchForm.value;

      this.data.callback(search)

      this.dialogRef.close()
    }
  }

}
