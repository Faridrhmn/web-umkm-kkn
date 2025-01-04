import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface User {
  username: String,
  fullname: String,
  role: String,
  id: string,
  password: string
}

interface Search {
  keyword: string,
  role: string
}

export interface DialogData {
  title: String,
  userList: Array<User>,
  user: User,
  isPreview: boolean,
  isAddUser: boolean,
  isSearch: boolean,
  callback: any
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  isListLoading = true;
  isData = false;
  userList: Array<User> = [];
  userListTemp: Array<User> = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUser().then(isLoading => {
      this.isListLoading = isLoading;
    })
  }

  //load user from firestore
  async loadUser(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "users"));

    onSnapshot(q, (querySnapshot) => {
      if(querySnapshot.size > 0) {
        this.isData = true;
        this.userList = [];
        querySnapshot.forEach(async (item) => {
          this.userList.push({
            id: item.id,
            username: item.data()["username"],
            fullname: item.data()["fullname"],
            role: item.data()["role"],
            password: item.data()["password"]
          })
        })
        this.userListTemp = this.userList;
        console.log(this.userListTemp)
      } else {
        this.isData = false;
      }
    })

    return(false);
  }

  openDialog(title: String) {
    this.dialog.open(UserDialogModal, {
      data: {
        userList: this.userList,
        title: title,
        isPreview: false,
        isAddUser: true,
        isSearch: false
      },
    })
  }

  openDialogEdit(user: User, isPreview: boolean) {
    this.dialog.open(UserDialogModal, {
      data: {
        userList: this.userList,
        title: "Edit User",
        user: user,
        isPreview: isPreview,
        isAddUser: false,
        isSearch: false
      }
    })
  }

  openDialogSearch() {
    this.dialog.open(UserDialogModal, {
      data: {
        userList: this.userList,
        title: "Pencarian User",
        isSearch: true,
        callback: this.onSearchCallback.bind(this)
      },
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize
  }

  //ON SEARCH CALLBACK
  onSearchCallback(search: Search) {
    if(search.keyword == "" && search.role == "all") {
      this.userList = this.userListTemp
    } else {
      this.userList = [];
      this.userListTemp.forEach(item => {
        if(item.role == search.role || search.role == "all") {
          let condition = item.fullname.toLowerCase().includes(search.keyword) || item.username.toLowerCase().includes(search.keyword);
          if(condition) {
            this.userList.push(item)
          }
        }
        
      })
    }
  }
  onSearch(search: Search) {
    
  }

  //DELETE USER DARA
  onDeleteUser(userId: string) {
    Swal.fire({
      title: 'Yakin ingin menghapus user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(userId)
      }
    })
  }

  async deleteUser(userId: string) {
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

    await deleteDoc(doc(db, "users", userId)).then(() => {
      this.onSuccess('Berhasil Menghapus User!')
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
          title: "Gagal menghapus user"
        })
        break;
    }
  }
}




@Component({
  selector: 'user-modal',
  templateUrl: './users.dialog.html',
  styleUrls: ['./users.component.scss']
})
export default class UserDialogModal implements OnInit {
  hide = true;
  userFrom: FormGroup = this.initFormGroup();
  searchForm: FormGroup = this.initSearchFormGroup();

  constructor(
    private dialogRef: MatDialogRef<UserDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }
  
  ngOnInit(): void {
    if(this.data.user) {
      this.userFrom.patchValue({
        fullname: this.data.user.fullname,
        username: this.data.user.username,
        role: this.data.user.role
      })
    }
  }

  initFormGroup() {
    return this.fb.group({
      fullname: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['', [Validators.required]]
    })
  }

  initSearchFormGroup() {
    return this.fb.group({
      keyword: [''],
      role: ['all'],
    })
  }

  //ON ADD NEW USER
  onAddUser() {
    if(!this.userFrom.invalid){
      let notExist = true;
      const user: User = this.userFrom.value;

      if(this.data.isAddUser) {
        this.data.userList.forEach(item => {
          if(
            item.username.replaceAll(' ', '').toLocaleLowerCase() == 
            user.username.replaceAll(' ', '').toLocaleLowerCase()) 
            notExist = false
        })
      }

      if(notExist) {
        Swal.fire({
          didOpen: () => {
            Swal.showLoading()
          },
          title: 'Menambahkan User...',
          text: 'Harap tunggu sebentar',
        })

        if(this.data.isAddUser) this.storeUser(user, this.data.user);
        else this.storeUser(user, this.data.user);
      } else {
        this.onError("data_exist")
      }
    } else {
      this.onError("null");
    }
  }

  //STORE NEW USER TO FIRESTORE
  async storeUser(userForm: User, user: User) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);
  
    // Generate a token for a new user or use the existing user's ID
    const token = this.data.isAddUser ? this.generateToken(20) : user.id;
  
    try {
      // Hash the password using the Web Crypto API
      const hashedPassword = await this.hashPassword(userForm.password);
  
      // Store user data in Firestore
      await setDoc(doc(db, "users", token), {
        username: userForm.username,
        fullname: userForm.fullname,
        password: hashedPassword, // Save hashed password
        role: userForm.role,
        image: ""
      });
  
      this.onSuccess('Berhasil Menambah User!');
    } catch (error) {
      console.log(error);
    }
  }

  //RESET PASSWORD
  onResetPassword(userId: string) {
    Swal.fire({
      title: 'Yakin ingin mereset password untuk user ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetPassword(userId)
      }
    })
  }

  async resetPassword(userId: string) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    await updateDoc(doc(db, "users", userId), {
      password: "12345"
    }).then(() => {
      this.onSuccess('Berhasil mereset password');
    }).catch(reason => {
      this.onError('Gagal mereset password')
    })
  }

  //ON SEARCH
  onSearch() {
    if(!this.searchForm.invalid) {
      let search: Search = this.searchForm.value;

      this.data.callback(search)

      this.dialogRef.close()
    }
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
    }
  }

  generateToken(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
  }

  async hashPassword(password: string): Promise<string> {
    // Convert password to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
  
    // Hash the password using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
    // Convert the hash to a hexadecimal string
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

}