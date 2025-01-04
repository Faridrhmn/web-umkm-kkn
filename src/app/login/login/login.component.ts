import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { DocumentData, QueryDocumentSnapshot, QuerySnapshot, collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface Payload {
  username: string,
  password: string
}

interface User {
  username: String,
  fullname: String,
  role: String,
  id: string,
  password: String
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  hide = true;
  loginForm: FormGroup = this.initFormGroup();

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
  }

  initFormGroup() {
    return this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  async login() {
    const payload: Payload = this.loginForm.value;
  
    if (!this.loginForm.invalid) {
      Swal.fire({
        didOpen: () => {
          Swal.showLoading();
        },
        title: 'Sedang Memuat...',
        text: 'Harap tunggu sebentar',
      });
  
      const app = initializeApp(environment.firebase);
      const db = getFirestore(app);
  
      // Query to find the user by username
      const q = query(collection(db, "users"), where("username", "==", payload.username));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.size > 0) {
        // Hash the entered password for comparison
        const hashedPassword = await this.hashPassword(payload.password);
  
        querySnapshot.forEach((doc) => {
          // Compare hashed password with the stored password
          if (hashedPassword === doc.data()["password"]) {
            this.onSuccess(doc);  // Successful login
          } else {
            this.onError("password");  // Incorrect password
          }
        });
      } else {
        this.onError("username");  // Username not found
      }
    } else {
      this.onError("null");  // Form is invalid
    }
  }

  onSuccess(userData: QueryDocumentSnapshot<DocumentData>) {
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

    localStorage.setItem('login-token', this.generateToken(12));
    Swal.close()
    Toast.fire({
      icon: 'success',
      title: 'Login Berhasil!',
    })

    const user: User = {
      username: userData.data()["username"],
      fullname: userData.data()["fullname"],
      role: userData.data()["role"],
      id: userData.id,
      password: userData.data()["password"]
    }

    localStorage.setItem('user', JSON.stringify(user));

    this.router.navigate(['/']);
  }

  onError(errorState: String) {
    Swal.close();

    switch(errorState) {
      case 'username': 
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal!',
          text: 'Username tidak ditemukan',
        })
        break;
      case 'null': 
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal!',
          text: 'Username dan Password tidak boleh kosong',
        })
        break;
      case 'password':
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal!',
          text: 'Username atau Password salah',
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

  handleKeyPress(e: String) {
    console.log(e == "\n" ? "true" : "false")
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
  
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}
