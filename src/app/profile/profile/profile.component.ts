import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface User {
  username: String,
  fullname: String,
  role: String,
  id: string,
  password: String
}

export interface DialogData {
  title: String,
  user: User,
  isEdit: boolean,
  callback: any
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User = {
    username: "",
    fullname: "",
    role: "",
    id: "",
    password: ""
  }

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('user')!);

    this.user = userData ? userData : this.user;
  }

  openDialog(title: String) {
    this.dialog.open(ProfileDialogModal, {
      data: {
        user: this.user,
        title: title,
        isEdit: true,
        callback: this.onDataUpdate
      },
    })
  }

  openDialogPassword(title: String) {
    this.dialog.open(ProfileDialogModal, {
      data: {
        user: this.user,
        title: title,
        isEdit: false,
        callback: this.onDataUpdate
      },
    })
  }

  onDataUpdate(user: User) {
    this.user.fullname = user.fullname;
    this.user.password = user.password;
    localStorage.setItem('user', JSON.stringify(user));
  }
}

interface ChangePassword {
  oldPassword: String,
  newPassword: String,
  confirmPassword: String
}


@Component({
  selector: 'profile-modal',
  templateUrl: './profile.dialog.html',
  styleUrls: ['./profile.component.scss']
})
export default class ProfileDialogModal implements OnInit {
  hide = [true, true, true];
  userFrom: FormGroup = this.initFormGroup();
  changePasswordForm: FormGroup = this.initChangePasswordForm();

  constructor(
    private dialogRef: MatDialogRef<ProfileDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.userFrom.patchValue({
      fullname: this.data.user.fullname,
      username: this.data.user.username,
      role: this.data.user.role
    })
  }

  initFormGroup() {
    return this.fb.group({
      fullname: ['', [Validators.required]]
    })
  }

  initChangePasswordForm() {
    return this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  //ON ADD NEW USER
  onEditUser(userId: string, password: String) {
    if(!this.userFrom.invalid){
      const user: User = this.userFrom.value;

      Swal.fire({
        didOpen: () => {
          Swal.showLoading()
        },
        title: 'Memperbaharui Profil...',
        text: 'Harap tunggu sebentar',
      })

      this.storeUser(user, userId, password);
    } else {
      this.onError("null");
    }
  }

  //ON CHANGE PASSWORD
  onChangePassword(userId: string, oldPassword: String) {
    if(!this.changePasswordForm.invalid){
      const newPassword: ChangePassword = this.changePasswordForm.value;

      if(newPassword.oldPassword == oldPassword) {
        if(newPassword.newPassword == newPassword.confirmPassword) {
          Swal.fire({
            didOpen: () => {
              Swal.showLoading()
            },
            title: 'Memperbaharui Password...',
            text: 'Harap tunggu sebentar',
          })
    
          this.storeUser(this.data.user, userId, newPassword.newPassword);
        } else {
          this.onError("confirm_password");
        }
      } else {
        this.onError("old_password");
      }    
    } else {
      this.onError("null");
    }
  }

  //STORE NEW USER TO FIRESTORE
  async storeUser(userForm: User, userId: string, password: String) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    let dataUpdate = this.data.isEdit ? {fullname: userForm.fullname} : {password: password}

    await updateDoc(doc(db, "users", userId), dataUpdate).then(() => {
      this.onSuccess('Berhasil Memperbaharui Profil!');

      let userUpdate = {
        username: this.data.user.username,
        fullname: userForm.fullname,
        role: this.data.user.role,
        id: this.data.user.id,
        password: password
      }

      this.data.callback(userUpdate);
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
          title: "Username sudah ada"
        })
        break;
      case "null":
        Swal.fire({
          icon: "warning",
          title: "Harap isi semua form"
        })
        break;
      case "old_password":
        Swal.fire({
          icon: "error",
          title: "Password lama salah" 
        })
        break;
      case "confirm_password":
        Swal.fire({
          icon: "error",
          title: "Password baru tidak sesuai dengan password konfirmasi"
        })
        break;
  }
  }
}