import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { environment } from 'src/environment/environment';

interface Tanggapan {
  id: string,
  fullname: String,
  email: String,
  tanggapan: String,
  timestamp: String
}

interface Search {
  keyword: string,
  isAnonim: string
}

export interface DialogData {
  title: String,
  tanggapanList: Array<Tanggapan>,
  callback: any
}

@Component({
  selector: 'app-tanggapan',
  templateUrl: './tanggapan.component.html',
  styleUrls: ['./tanggapan.component.scss']
})
export class TanggapanComponent implements OnInit {
  isListLoading = true;
  isData = false;
  tanggapanList: Array<Tanggapan> = [];
  tanggapanListTemp: Array<Tanggapan> = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(private dialog: MatDialog, private router:Router) {}

  ngOnInit(): void {
    this.loadTanggapan().then(isLoading => {
      this.isListLoading = isLoading;
    })
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
        this.tanggapanListTemp = this.tanggapanList;
      } else {
        this.isData = false;
      }
    })

    return(false);
  }

  openDialogSearch() {
    this.dialog.open(TanggapanDialogModal, {
      data: {
        tanggapanList: this.tanggapanList,
        title: "Pencarian",
        callback: this.onSearchCallback.bind(this)
      },
    })
  }

  //ON SEARCH CALLBACK
  onSearchCallback(search: Search) {
    if(search.keyword == "" && search.isAnonim == "no") {
      this.tanggapanList = this.tanggapanListTemp
    } else {
      this.tanggapanList = [];

      const anonim = (search.isAnonim == "no") ? "" : "Anonim"

      this.tanggapanListTemp.forEach(item => {
        if(item.fullname.includes(anonim)) {
          let condition = item.fullname.toLowerCase().includes(search.keyword) || item.email.toLowerCase().includes(search.keyword) || item.tanggapan.toLowerCase().includes(search.keyword);
            if(condition) {
              this.tanggapanList.push(item)
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
  selector: 'tanggapan-modal',
  templateUrl: './tanggapan.dialog.html',
  styleUrls: ['./tanggapan.component.scss']
})
export default class TanggapanDialogModal implements OnInit {
  searchForm: FormGroup = this.initSearchFormGroup();

  constructor(
    private dialogRef: MatDialogRef<TanggapanDialogModal>,
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
      isAnonim: ['no']
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
