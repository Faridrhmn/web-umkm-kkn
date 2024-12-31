import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, query, setDoc } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface Padukuhan {
  id: String,
  name: string,
  rt: string,
  isLoading: boolean,
  selected: boolean
}

export interface DialogData {
  title: String,
  padukuhanList: Array<Padukuhan>,
  padukuhan: Padukuhan,
  isAddPadukuhan: boolean
}

@Component({
  selector: 'app-padukuhan',
  templateUrl: './padukuhan.component.html',
  styleUrls: ['./padukuhan.component.scss']
})
export class PadukuhanComponent implements OnInit {
  isListLoading = true;
  isData = false;
  padukuhanList: Array<Padukuhan> = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    console.log(this.isListLoading)
    this.loadPadukuhan().then(isLoading => {
      this.isListLoading = isLoading;
    })
  }

  //load padukuhan from firestore
  async loadPadukuhan(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "padukuhan"));

    onSnapshot(q, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        this.isData = true;
        this.padukuhanList = [];
        querySnapshot.forEach(async (item) => {
          this.padukuhanList.push({
            id: item.id,
            name: item.data()["name"],
            rt: item.data()["rt"],
            isLoading: false,
            selected: false
          })
        })
      } else {
        this.isData = false;
      }
    })

    return(false);
  }

  openDialog(title: String) {
    this.dialog.open(PadukuhanDialogModal, {
      data: {
        padukuhanList: this.padukuhanList,
        title: title,
        isAddPadukuhan: true
      },
    })
  }

  openDialogEdit(title: String, padukuhan: Padukuhan) {
    this.dialog.open(PadukuhanDialogModal, {
      data: {
        padukuhanList: this.padukuhanList,
        padukuhan: padukuhan,
        title: title,
        isAddPadukuhan: false
      },
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize
  }

   //DELETE PADUKUHAN DARA
  onDeletePadukuhan(padukuhanId: string) {
    Swal.fire({
      title: 'Yakin ingin menghapus padukuhan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePadukuhan(padukuhanId)
      }
    })
  }

  async deletePadukuhan(padukuhanId: string) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.close()
    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Menghapus...',
      text: 'Harap tunggu sebentar',
    })

    await deleteDoc(doc(db, "padukuhan", padukuhanId)).then(() => {
      this.onSuccess('Berhasil Menghapus Padukuhan!')
    }).catch(reason => {
      this.onError("delete");
    });
  }

  //ON SUCCESS DIALOG
  onSuccess(title: String) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    }) 
    
    Swal.close()
    Toast.fire({
      icon: 'success',
      title: title,
    })
  }

  //ON ERROR DIALOG
  onError(errorState: String) {
    Swal.close();

    switch(errorState) {
      case "delete":
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus padukuhan"
        })
        break;
    }
  }

}

@Component({
  selector: 'padukuhan-modal',
  templateUrl: './padukuhan.dialog.html',
  styleUrls: ['./padukuhan.component.scss']
})
export default class PadukuhanDialogModal implements OnInit {
  padukuhanFrom: FormGroup = this.initFormGroup();
  
  constructor(
    private dialogRef: MatDialogRef<PadukuhanDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if(this.data.padukuhan) {
      this.padukuhanFrom.patchValue({
        name: this.data.padukuhan.name,
        rt: this.data.padukuhan.rt
      })
    }
  }

  initFormGroup() {
    return this.fb.group({
      name: ['', [Validators.required]],
      rt: ['', [Validators.required]]
    })
  }

  //ON ADD NEW PADUKUHAN
  onAddPadukuhan() {
    if(!this.padukuhanFrom.invalid){
      let notExist = true;
      const padukuhan: Padukuhan = this.padukuhanFrom.value;

      if(this.data.isAddPadukuhan) {
        this.data.padukuhanList.forEach(item => {
          if(
            item.name.replaceAll(' ', '').toLocaleLowerCase() == 
            padukuhan.name.replaceAll(' ', '').toLocaleLowerCase()) 
            notExist = false
        })
      }

      if(notExist) {
        this.confirmRT(padukuhan, this.data.padukuhan);
      } else {
        this.onError("data_exist")
      }
    } else {
      this.onError("null");
    }
  }

  confirmRT(padukuhanForm: Padukuhan, padukuhan: Padukuhan) {
    let text = padukuhanForm.rt;
    text = text.replace(/[^0-9\,]/g, "");

    let textArr: string[] = text.split(",");
    text = ""
    textArr.forEach((item, index) => {
      text += (item != "") ? ((index == 0) ? item : ", " + item) : ""
    })

    Swal.fire({
      title: 'Konfirmasi RT',
      text: "RT : " + text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        padukuhanForm.rt = text;

        Swal.fire({
          didOpen: () => {
            Swal.showLoading()
          },
          title: this.data.isAddPadukuhan ? 'Menambahkan Padukuhan...' : 'Memperbaharui Padukuhan...',
          text: 'Harap tunggu sebentar',
        })

        if(this.data.isAddPadukuhan) this.storePadukuhan(padukuhanForm, padukuhan);
        else this.storePadukuhan(padukuhanForm, padukuhan);
      }
    })
  }

  //STORE NEW PADUKUHAN TO FIRESTORE
  async storePadukuhan(padukuhanForm: Padukuhan, padukuhan: Padukuhan) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    await setDoc(doc(db, "padukuhan", padukuhanForm.name), {
      name: this.data.isAddPadukuhan ? padukuhanForm.name : padukuhan.name,
      rt: padukuhanForm.rt
    }).then(() => {
      if(this.data.isAddPadukuhan) this.onSuccess('Berhasil Menambah Padukuhan!');
      else this.onSuccess('Berhasil Mengedit Padukuhan')
    }).catch((reason) => {
      console.log(reason)
    })
  }

  //ON SUCCESS DIALOG
  onSuccess(title: String) {
    this.dialogRef.close();

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    }) 
    
    Swal.close()
    Toast.fire({
      icon: 'success',
      title: title,
    })
  }

  //ON ERROR DIALOG
  onError(errorState: String) {
    Swal.close();

    switch(errorState) {
      case "data_exist":
        Swal.fire({
          icon: "warning",
          title: "Padukuhan Sudah Ada"
        })
        break;
      case "null":
        Swal.fire({
          icon: "warning",
          title: "Harap isi semua form"
        })
        break;
    }
  }

}
