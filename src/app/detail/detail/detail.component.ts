import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

interface Service {
  name: String,
  status: String,
  link_kk: string,
  no_hp: String,
  padukuhan: String,
  rt: String,
  service: String,
  service_name: String,
  tgl_ambil: String,
  id: string,
  namaAnak: String,
  namaSekolah: String,
  jurusan: String,
  kelas: String,
  no_ambil: String,
  alamat: String,
  link_foto: string,
  tgl_kehilangan: String,
  lokasi_kehilangan: String,
  surat_yang_hilang: String,
  tujuan: String,
  penghasilan: String,
  no_shm: String,
  luas_sertifikat: String,
  letak_tanah: String,
  estimasi_harga: String,
  tgl_selesai: String
}

interface Detail {
  label: String,
  answer: String
}

interface DetailImage {
  label: String,
  src: string
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  service: Service = {
    name: "",
    status: "",
    link_kk: '',
    no_hp: "",
    padukuhan: "",
    rt: "",
    service: "",
    service_name: "",
    tgl_ambil: "",
    id: '',
    namaAnak: "",
    namaSekolah: "",
    jurusan: "",
    kelas: "",
    no_ambil: "",
    alamat: "",
    link_foto: '',
    tgl_kehilangan: "",
    lokasi_kehilangan: "",
    surat_yang_hilang: "",
    tujuan: "",
    penghasilan: "",
    no_shm: "",
    luas_sertifikat: "",
    letak_tanah: "",
    estimasi_harga: "",
    tgl_selesai: ""
  };
  detailList: Array<Detail> = [];
  detailImageList: Array<DetailImage> = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loadDetailPengajuan()
  }

  loadDetailPengajuan() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const id = this.route.snapshot.queryParamMap.get("id")

    const q = doc(db, "pengajuan", id!);

    onSnapshot(q, (querySnapshot) => {
      this.service = {
        name: querySnapshot.data()!["nama_lengkap"],
        status: querySnapshot.data()!["status"],
        link_kk: querySnapshot.data()!["link_kk"],
        no_hp: querySnapshot.data()!["no_hp"],
        padukuhan: querySnapshot.data()!["padukuhan"],
        rt: querySnapshot.data()!["rt"],
        service: querySnapshot.data()!["service"],
        service_name: querySnapshot.data()!["service_name"],
        tgl_ambil: querySnapshot.data()!["tgl_ambil"],
        id: querySnapshot.id,
        namaAnak: querySnapshot.data()!["nama_anak"],
        namaSekolah: querySnapshot.data()!["nama_sekolah"],
        jurusan: querySnapshot.data()!["jurusan"],
        kelas: querySnapshot.data()!["kelas"],
        no_ambil: querySnapshot.data()!["no_ambil"],
        alamat: querySnapshot.data()!["alamat"],
        link_foto: querySnapshot.data()!["link_foto"],
        tgl_kehilangan: querySnapshot.data()!["tgl_kehilangan"],
        lokasi_kehilangan: querySnapshot.data()!["lokasi_kehilangan"],
        surat_yang_hilang: querySnapshot.data()!["surat_yang_hilang"],
        tujuan: querySnapshot.data()!["tujuan"],
        penghasilan: querySnapshot.data()!["penghasilan"],
        no_shm: querySnapshot.data()!["no_shm"],
        luas_sertifikat: querySnapshot.data()!["luas_sertifikat"],
        letak_tanah: querySnapshot.data()!["letak_tanah"],
        estimasi_harga: querySnapshot.data()!["estimasi_harga"],
        tgl_selesai: querySnapshot.data()!["tgl_selesai"]
      }

      this.loadDetailElement();
    })
  }

  loadDetailElement() {
    this.detailList = []
    this.detailImageList = []

    this.detailList.push({
      label: "Status",
      answer: this.service.status
    })

    this.detailList.push({
      label: "Padukuhan / RT",
      answer: this.service.padukuhan + " / " + this.service.rt
    })

    switch(this.service.service){
      case "sktm_umum" :
        this.detailList.push({
          label: "Nama Lengkap",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        break;

      case "sktm_sekolah":
        this.detailList.push({
          label: "Nama Orang Tua",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Nama Anak",
          answer: this.service.namaAnak
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Nama Sekolah",
          answer: this.service.namaSekolah
        })
        this.detailList.push({
          label: "Jurusan",
          answer: this.service.jurusan
        })
        this.detailList.push({
          label: "Kelas",
          answer: this.service.kelas
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        break;

      case "surat_keterangan_usaha" :
        this.detailList.push({
          label: "Nama Pemilik Usaha",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Alamat Pemilik Usaha",
          answer: this.service.alamat
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        this.detailImageList.push({
          label: "Foto Usaha",
          src: this.service.link_foto
        })
        break;

      case "pengantar_kehilangan_kk" :
        this.detailList.push({
          label: "Nama Pelapor",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Tanggal Kehilangan",
          answer: this.service.tgl_kehilangan
        })
        this.detailList.push({
          label: "Lokasi kehilangan",
          answer: this.service.lokasi_kehilangan
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        break;

      case "permohonan_ktp_baru" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        this.detailImageList.push({
          label: "Foto Akta Kelahiran",
          src: this.service.link_foto
        })
        break;

      case "pengantar_kehilangan_ktp" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Tanggal Kehilangan",
          answer: this.service.tgl_kehilangan
        })
        this.detailList.push({
          label: "Tempat Kehilangan",
          answer: this.service.lokasi_kehilangan
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        this.detailImageList.push({
          label: "Foto KTP",
          src: this.service.link_foto
        })
        break;

      case "pengantar_kehilangan_umum" :
          this.detailList.push({
            label: "Nama Pemohon",
            answer: this.service.name
          })
          this.detailList.push({
            label: "Surat yang Hilang",
            answer: this.service.surat_yang_hilang
          })
          this.detailList.push({
            label: "Tanggal Kehilangan",
            answer: this.service.tgl_kehilangan
          })
          this.detailList.push({
            label: "Tempat Kehilangan",
            answer: this.service.lokasi_kehilangan
          })
          this.detailList.push({
            label: "Nomor HP / WA",
            answer: this.service.no_hp
          })
          this.detailList.push({
            label: "Tanggal Pengambilan",
            answer: this.service.tgl_ambil
          })
          if(this.service.status == "Selesai"){
            this.detailList.push({
              label: "Nomor Pengambilan",
              answer: this.service.no_ambil
            })
          }
          this.detailList.push({
            label: "Lampiran",
            answer: ""
          })
          this.detailImageList.push({
            label: "Foto KK",
            src: this.service.link_kk
          })
          break;

      case "pengantar_skck" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Tujuan Pembuatan SKCK",
          answer: this.service.tujuan
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        break;

      case "surat_keterangan_penghasilan" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Kisaran Penghasilan (Rp)",
          answer: "Rp " + this.service.penghasilan
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        break;

      case "surat_keterangan_harga_tanah" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "No SHM",
          answer: this.service.no_shm
        })
        this.detailList.push({
          label: "Luas Sertifikat",
          answer: this.service.luas_sertifikat + " m²"
        })
        this.detailList.push({
          label: "Letak Tanah",
          answer: this.service.letak_tanah
        })
        this.detailList.push({
          label: "Estimasi Harga",
          answer: this.service.estimasi_harga
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        this.detailImageList.push({
          label: "Foto Sertifikat",
          src: this.service.link_foto
        })
        break;

      case "surat_keterangan_domisili_usaha" :
        this.detailList.push({
          label: "Nama Pemilik Usaha",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Alamat Usaha",
          answer: this.service.alamat
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK / KTP",
          src: this.service.link_kk
        })
        break;

      case "surat_keterangan_belum_menikah" :
        this.detailList.push({
          label: "Nama Pemohon",
          answer: this.service.name
        })
        this.detailList.push({
          label: "Nomor HP / WA",
          answer: this.service.no_hp
        })
        this.detailList.push({
          label: "Tanggal Pengambilan",
          answer: this.service.tgl_ambil
        })
        if(this.service.status == "Selesai"){
          this.detailList.push({
            label: "Nomor Pengambilan",
            answer: this.service.no_ambil
          })
        }
        this.detailList.push({
          label: "Lampiran",
          answer: ""
        })
        this.detailImageList.push({
          label: "Foto KK",
          src: this.service.link_kk
        })
        break;

    }

    let dateArr = this.service.id.split('.')
    let createDate = dateArr[2] + ' ' + this.getMonth(dateArr[1]) + ' ' + dateArr[0] + ' ';
    createDate += dateArr[3] + ':' + dateArr[4] + ':' + dateArr[5].split('-')[0];
    this.detailList.push({
      label: "Tanggal Pengajuan",
      answer: createDate
    })

    if(this.service.status == 'Selesai') {
      this.detailList.push({
        label: "Tanggal Selesai",
        answer: this.service.tgl_selesai
      })
    }
  }

  getMonth(month: String) {
    switch(month) {
      case "01": return "Januari";
      case "02": return "Februari";
      case "03": return "Maret";
      case "04": return "April";
      case "05": return "Mei";
      case "06": return "Juni";
      case "07": return "Juli";
      case "08": return "Agustus";
      case "09": return "September";
      case "10": return "Oktober";
      case "11": return "November";
      default: return "Desember";
    }
  }

  onOpenImage(src: string) {
    window.open(src,'htmlname','width=largeImage.stylewidth,height=largeImage.style.height,resizable=1')
  }

  backToList() {
    this.router.navigate(['/pengajuan'])
  }

  process() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.fire({
      title: (this.service.status == 'Belum diproses') ? 'Terima Pengajuan?' : 'Selesaikan Pengajuan?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (this.service.status == 'Belum diproses') {
          await updateDoc(doc(db, "pengajuan", this.service.id), {
            status: "Sedang diproses"
          }).then(() => {
            this.onSuccess('Berhasil memperbarui data')
          })
        }

        else {
          let number = Math.floor(Math.random() * 9999) + 1;
          let d = new Date();
          let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString();
          let today = d.getDate() + ' ' + this.getMonth(month) + ' ' + d.getFullYear() + ' ';
          today += d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();

          await updateDoc(doc(db, "pengajuan", this.service.id), {
            status: "Selesai",
            no_ambil: number,
            tgl_selesai: today
          }).then(() => {
            this.onSuccess('Berhasil memperbarui data')
          })
        }
      }
    })
  }

  async decline() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    if(this.service.status == 'Belum diproses') {
      Swal.fire({
        title: 'Tolak Pengajuan?',
        text: "Alasan : ",
        input: 'text',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateDoc(doc(db, "pengajuan", this.service.id), {
            status: "Ditolak",
            alasan: result.value
          }).then(() => {
            this.onSuccess('Berhasil memperbarui data')
          })
        }
      })
    } else {
      Swal.fire({
        title: 'Hapus Pengajuan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteDoc(doc(db, "pengajuan", this.service.id)).then(() => {
            this.onSuccess('Berhasil memperbarui data')
            this.router.navigate(['/pengajuan'])
          })
        }
      })
      
    }
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
}
