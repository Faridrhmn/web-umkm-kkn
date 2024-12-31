import { AfterContentInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { initializeApp } from 'firebase/app';
import { GeoPoint, collection, deleteDoc, doc, getFirestore, onSnapshot, query, setDoc } from 'firebase/firestore';
import { ImagePrevDialogComponent } from 'src/app/shared/image-prev-dialog/image-prev-dialog.component';
import { environment } from 'src/environment/environment';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage'
import Swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';

/// <reference types="@types/googlemaps" />

declare const google: any;
let poly: google.maps.Polyline;
let map: google.maps.Map;

export interface DialogData {
  title: String,
  callback: any,
  category: Category,
  categoryList: Array<Category>,
  isCategory: boolean,
  position: Position,
  isEditLocation: boolean,
  location: Location,
  isShowDetailLocation: boolean
}

interface Layer {
  id: string,
  name: String,
  color: String,
  isActive: boolean,
  location: Array<GeoPoint>
}

interface Position {
  lat: number | undefined,
  lng: number | undefined
}

interface Category {
  id: string,
  name: String
}

interface Search {
  keyword: string,
}


@Component({
  selector: 'app-pemetaan',
  templateUrl: './pemetaan.component.html',
  styleUrls: ['./pemetaan.component.scss']
})
export class PemetaanComponent implements OnInit, AfterContentInit {
  categoryList: Array<Category> = [];
  layerList: Array<Layer> = [];
  locationList: Array<Location> = []
  locationListTemp: Array<Location> = []
  layerListRTemp: Array<google.maps.Polygon> = []
  pageIndex = 0;
  pageSize = 5;
  pageIndex2 = 0;
  pageSize2 = 5;
  isSetLoc = false;
  markerLoc: google.maps.Marker | undefined;
  positionTemp: Position | undefined;
  disableAddDetailButton = true;
  isSearch = false;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngAfterContentInit(): void {
    let mapElement = document.getElementById('mapEle');

    const myLating = { lat: -7.9368565143471415, lng: 110.57208395746801 }

    map = new google.maps.Map(mapElement, {
      center: myLating,
      zoom: 16,
      clickableIcons: false,
      gestureHandling: "cooperative",
    })

    this.loadLayer();
    if(!this.isSearch) this.loadLocation()
  }

  ngOnInit(): void {
    this.loadCategory()
  }





  //LOAD LAYER FROM FIRESTORE
  async loadCategory(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "category"));

    onSnapshot(q, (querySnapshot) => {
      this.categoryList = [];
      querySnapshot.forEach(async (item) => {
        this.categoryList.push({
          id: item.id,
          name: item.data()["name"],
        })
      })
    })

    return(false);
  }

  //ON DELETE CATEGORY
  async onDeleteCategory(layerId: string) {
    Swal.fire({
      title: 'Yakin ingin menghapus kategori?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then(async (result) => {
      if (result.isConfirmed) {
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

        await deleteDoc(doc(db, "category", layerId)).then(() => {
          this.onSuccess('Berhasil Menghapus Kategori!')
        }).catch(reason => {
          this.onError("delete_category");
        });
      }
    })
  }




  //LOAD LAYER FROM FIRESTORE
  async loadLayer(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "layers"));

    onSnapshot(q, (querySnapshot) => {
      this.drawLayers(true)

      this.layerList = [];
      querySnapshot.forEach(async (item) => {
        if(item.id != 'center') {
          this.layerList.push({
            id: item.id,
            name: item.data()["name"],
            color: item.data()["color"],
            isActive: item.data()["isActive"],
            location: item.data()["location"]
          })
        } else {
          let loc = {
            lat: item.data()["lat"],
            lng: item.data()["lng"],
          }
          map.panTo(loc)
        }
      })
      this.drawLayers(false)
    })

    return(false);
  }

  //DRAW STORED LAYER
  drawLayers(isNull: boolean) {
    if(isNull) {
      if(this.layerListRTemp.length > 0) {
        this.layerListRTemp.forEach(item => {
          item.setMap(null)
        })

        this.layerListRTemp = []
      }
    } else {
      if(this.layerList.length > 0) {
        this.layerList.forEach(item => {
          if(item.isActive) {
            let loc: Array<Position> = [];
            item.location.forEach(l => {
              loc.push({
                lat: l.latitude,
                lng: l.longitude
              })
            })
    
            let layer: google.maps.Polygon = new google.maps.Polygon({
              path: loc,
              strokeColor: item.color,
              strokeOpacity: 0.6,
              strokeWeight: 2,
              fillColor: item.color,
              fillOpacity: 0.2,
              clickable: false
            })

            this.layerListRTemp.push(layer)
    
            layer.setMap(map);
          }
        })
      }
    }
  }






  //LOAD LOCATION
  async loadLocation() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "location"));

    onSnapshot(q, (querySnapshot) => {
      this.locationList = [];
      querySnapshot.forEach(async (item) => {
        this.locationList.push({
          id: item.id,
          name: item.data()["name"],
          category: item.data()["category"],
          description: item.data()["description"],
          items: item.data()["items"],
          openDays: item.data()["openDays"],
          phone: item.data()["phone"],
          address: item.data()["address"],
          imageUrl: item.data()["imageUrl"],
          totalFav: item.data()["totalFav"],
          review: item.data()["review"],
          lastUpdate: item.data()["lastUpdate"],
          user: item.data()["user"],
          position: item.data()["position"],
          rating: item.data()["rating"]
        });
      })

      this.locationListTemp = this.locationList;
      this.drawLocationMarker()
    })

    return(false);
  }

  drawLocationMarker() {
    this.locationList.forEach(item => {
      const content = "<td class=\"action\">" +
          "<div style=\"text-align: center\">" + item.name + "</div><br>" +
          "<div class=\"action-icon\">" +
              "<button onclick=\"document.getElementById('action-view').click()\">Lihat</button> &nbsp;" +
              "<button onclick=\"document.getElementById('action-edit').click()\">Edit</button> &nbsp;" +
              "<button onclick=\"document.getElementById('action-delete').click()\">Hapus</button>" +
          "</div>" +
      "</td>";

      const infowindow = new google.maps.InfoWindow({
        content: content,
        ariaLabel: "Info",
      });

      const marker = new google.maps.Marker({
        position: item.position,
        map: map,
        optimized: true 
      });

      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
        });
      });
    })
  }

  //ON DELETE LOCATION
  async onDeleteLocation(locationId: string) {
    Swal.fire({
      title: 'Yakin ingin menghapus titik lokasi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then(async (result) => {
      if (result.isConfirmed) {
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

        await deleteDoc(doc(db, "location", locationId)).then(() => {
          this.onSuccess('Berhasil Menghapus Titik Lokasi!')
          this.ngAfterContentInit()
        }).catch(reason => {
          this.onError("delete_location");
        });
      }
    })
  }





  //TOGGLE SET LOCATION PIN
  toggleSetLocPin() {
    this.isSetLoc = !this.isSetLoc

    if(this.isSetLoc) {
      this.snackBar.openFromComponent(PemetaanSnackbar, {
        duration: 3000
      })

      map.setOptions({draggableCursor: "url(/assets/images/pointer.png), auto"})

      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if(this.markerLoc) this.markerLoc.setMap(null)
        
        this.markerLoc = new google.maps.Marker({
          position: event.latLng,
          map: map,
          label: "⚪",
          fillColor: "blue",
          optimized: true 
        });

        map.panTo(event.latLng!)

        this.positionTemp = {
          lat: event.latLng?.lat(),
          lng: event.latLng?.lng()
        }

        this.disableAddDetailButton = false;
      })
    } else {
      map.setOptions({draggableCursor: "auto"})

      this.ngAfterContentInit()
    }
  }




  reloadMap() {
    this.ngAfterContentInit()
    this.isSetLoc = false
  }





  //OPEN MODAL
  openDialog(dialog: String, title: String, category: Category | null, location: Location | null) {
    switch(dialog) {
      case "add_category":
        this.dialog.open(PemetaanDialogModal, {
          data: {
            title: title,
            isCategory: true
          },
        })
        break;
      case "edit_category":
        this.dialog.open(PemetaanDialogModal, {
          data: {
            title: title,
            isCategory: true,
            category: category
          },
        })
        break;
      case "add_location":
        this.dialog.open(PemetaanDialogModal, {
          data: {
            title: title,
            isCategory: false,
            categoryList: this.categoryList,
            position: this.positionTemp,
            callback: this.reloadMap.bind(this),
          },
        })
        break;
      case "edit_location":
        this.dialog.open(PemetaanDialogModal, {
          data: {
            title: title,
            isCategory: false,
            categoryList: this.categoryList,
            position: location?.position,
            callback: this.reloadMap.bind(this),
            location: location,
          },
        })
        break;
      case "detail_location":
        this.dialog.open(PemetaanDialogModal, {
          data: {
            title: title,
            location: location,
            isShowDetailLocation: true
          },
        })
        break;
    }
  }




  //HANDLE PAGE EVENT
  handlePageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize
  }

  //HANDLE PAGE EVENT
  handlePageEvent2(e: PageEvent) {
    this.pageIndex2 = e.pageIndex;
    this.pageSize2 = e.pageSize
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
      case "save_category":
        Swal.fire({
          icon: "error",
          title: "Gagal Menambah Kategori"
        })
        break;
      case "null":
        Swal.fire({
          icon: "warning",
          title: "Harap isi semua form"
        })
        break;
      case "delete_category":
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus Kategori"
        })
        break;
      case "delete_location":
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus Titik Lokasi"
        })
        break;
    }
  }

  openDialogSearch() {
    this.dialog.open(PemetaanSearchDialogModal, {
      data: {
        locationList: this.locationList,
        title: "Pencarian",
        callback: this.onSearchCallback.bind(this)
      },
    })
  }

  //ON SEARCH CALLBACK
  onSearchCallback(search: Search) {
    if(search.keyword == "") {
      this.locationList = this.locationListTemp
      this.isSearch = false
    } else {
      this.locationList = [];

      this.locationListTemp.forEach(item => {
        const condition1 = item.name.toLowerCase().includes(search.keyword);
        const condition2 = item.user.fullname.toLowerCase().includes(search.keyword);
        let condition3 = false;

        item.category.forEach(category => {
          if(category.name.toLowerCase().includes(search.keyword)) condition3 = true;
        })
        
        if(condition1 || condition2 || condition3) {
          this.locationList.push(item);
        }
      })

      this.isSearch = true;
    }

    this.ngAfterContentInit();
    this.drawLocationMarker();
  }

}








interface Location {
  id: string,
  name: String,
  category: Array<Category>,
  description: String,
  items: Array<Item>,
  openDays: Array<Schedule>,
  phone: String,
  address: String,
  imageUrl: Array<ImageUrl>,
  totalFav: number,
  review: Array<{
    name: string,
    rating: number,
    review: string
  }>,
  lastUpdate: String,
  user: User,
  position: Position,
  rating: string
}

interface Item {
  id: String,
  item: String,
  price: String,
  src: string,
  fav: boolean
}

interface ImageUrl {
  id: string,
  url: String
}

interface Schedule {
  day: String,
  hour: String,
  id: string
}

interface User {
  username: String,
  fullname: String,
  role: String
}

@Component({
  selector: 'pemetaan-modal',
  templateUrl: './pemetaan.dialog.html',
  styleUrls: ['./pemetaan.component.scss'],
  encapsulation : ViewEncapsulation.None
})
export default class PemetaanDialogModal implements OnInit {
  categoryFrom: FormGroup = this.initFormGroup();
  locationForm: FormGroup = this.initAddLocForm();

  categoryList: Array<Category> = [];
  hourList = Array.from(Array(24).keys())
  minuteList = Array.from(Array(60).keys())
  dayListStart = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']; 
  dayListFinish = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  dayListTemp = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  dayLength = 7; dayLengthTemp = 7;
  startDay = ''; finishDay = ''; isFinishDayDisable = true;
  selectedOtherHour = ''; isSelectOnDayVisible = true;

  isSelectOneDay = false;
  isSelectOtherHour = true;

  disableCategoryButton: boolean = true
  disableItemsButton: boolean = true
  disableScheduleButton: boolean = true
  disableHourSelect: boolean = false

  categoryTemp: Category = {
    id: '',
    name: ''
  }
  itemTemp: Item = {
    id: '',
    item: '',
    price: '',
    src: '',
    fav: false
  } 
  otherImageTemp: ImageUrl = {
    id: '',
    url: ''
  }
  scheduleTemp: Schedule = {
    id: '',
    day: '',
    hour: ''
  }

  isItemHasImage = false;
  isOtherImageHasImage = false;

  constructor(
    private dialogRef: MatDialogRef<PemetaanDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loadCategory()

    let openDayArr: Schedule[] = [];
    console.log(this.data.location == undefined);

    if(this.data.location == undefined) {
      this.dayListTemp.forEach((item, index) => {
        openDayArr.push({
          day: item,
          hour: '',
          id: this.generateToken(12)
        })
      })
    } else {
      this.dayListTemp.forEach((item, index) => {
        if (this.data.location.openDays[index] != undefined) {
          openDayArr[index] = this.data.location.openDays[index];
        } else {
          openDayArr.push({
            day: item,
            hour: '',
            id: this.generateToken(12)
          })
        }
      })
    }
    

    this.locationForm.patchValue({
      openDays: openDayArr
    })
    
    if(this.data.category) {
      this.categoryFrom.patchValue({
        name: this.data.category.name,
      })
    }

    if(this.data.location) {
      this.locationForm.patchValue({
        name: this.data.location.name,
        category: this.data.location.category,
        description: this.data.location.description,
        items: this.data.location.items,
        phone: this.data.location.phone,
        address: this.data.location.address,
        imageUrl: this.data.location.imageUrl,
      })
    }

    console.log(this.locationForm.value)

    setTimeout(() => {
      if(!this.data.isCategory) {
        const cardTopHeight = document.getElementById('card-top')?.scrollHeight
        const cardBottomHeight = document.getElementById('card-bottom')?.scrollHeight
        
        document.documentElement.style.setProperty('--form-container-height', 'calc(86vh - 32px - ' + (cardTopHeight! + cardBottomHeight!) + 'px)')
        document.documentElement.style.setProperty('--detail-height', 'calc(86vh - 32px - ' + (cardTopHeight!) + 'px)')
        document.documentElement.style.setProperty('--image-item', (cardBottomHeight! - 6) + 'px')
      }
    }, 100)
  }

  initFormGroup() {
    return this.fb.group({
      name: ['', [Validators.required]],
    })
  }

  initAddLocForm() {
    return this.fb.group({
      name: ['', [Validators.required]],
      category: [[], [Validators.required]],
      items: [[]],
      description: [''],
      phone: [''],
      address: [''],
      imageUrl: [[]],
      openDays: [[]]
    })
  }







  onAddCategory() {
    let categoryArr = this.locationForm.value.category;
    categoryArr.push(this.categoryTemp);

    this.locationForm.patchValue({
      category: categoryArr,
    })

    this.categoryList = this.categoryList.filter((obj) => {
      return obj.id != this.categoryTemp.id
    })

    this.disableCategoryButton = true
  }

  onRemoveCategory(c: Category) {
    let categoryArr = this.locationForm.value.category;
    categoryArr = categoryArr.filter((obj: any) => {
      return obj.id != c.id
    })

    this.locationForm.patchValue({
      category: categoryArr,
    })

    this.categoryList.push(c)

    if(this.categoryTemp.id == c.id) this.disableCategoryButton = false
    else this.disableCategoryButton = true
  }

  onCategorySelected(event: any) {
    this.disableCategoryButton = false

    this.data.categoryList.forEach(item => {
      if(item.id == event) {
        this.categoryTemp = item
      }
    })
  }



  onItemChanged(event: any, state: string) {
    switch(state) {
      case 'item':
        this.itemTemp.item = event.srcElement.value
        if(event.srcElement.value == '') {
          this.disableItemsButton = true;
        } else {
          this.disableItemsButton = false
        }
        break;
      case 'price':
        this.itemTemp.price = event.srcElement.value;
        break
    }

    this.itemTemp.price = (this.itemTemp.price == '') ? 'Gratis' : this.itemTemp.price
  }

  onItemImageChange(input: any) {
    if (input.srcElement.files) {
      const file = input.srcElement.files

      if(file[file.length - 1].size > 400000) {
        this.onError('big_file')
      } else {
        var reader = new FileReader();
        
        this.isItemHasImage = true

        reader.onload = function (e) {
          document.getElementById('item-image-preview')?.setAttribute('src', e.target?.result as string)
        };

        reader.readAsDataURL(file[file.length - 1]);
      }
    }
  }

  onAddItem(a: HTMLInputElement, b: HTMLInputElement) {
    if(this.isItemHasImage) this.itemTemp.src = document.getElementById('item-image-preview')?.getAttribute('src')!
    this.itemTemp.id = this.generateToken(16)
    document.getElementById('item-image-preview')?.setAttribute('src', '/assets/images/placeholder.png')

    let itemArr = this.locationForm.value.items;
    itemArr.push(this.itemTemp);

    this.itemTemp = {
      id: '',
      item: '',
      src: '',
      price: '',
      fav: false
    }

    this.locationForm.patchValue({
      items: itemArr
    })

    a.value = ''
    b.value = ''

    this.disableItemsButton = true
    this.isItemHasImage = false
  }

  onRemoveItem(l: any) {
    let itemArr = this.locationForm.value.items;
    itemArr = itemArr.filter((obj: any) => {
      return obj.id != l.id
    })

    this.locationForm.patchValue({
      items: itemArr,
    })
  }

  onAddImageItem() {
    if(this.isItemHasImage) {
      document.getElementById('item-image-preview')?.setAttribute('src', '/assets/images/placeholder.png')
      this.isItemHasImage = false
    }
    else document.getElementById('item-image')!.click()
  }



  onOtherImageChange(input: any) {
    if (input.srcElement.files) {
      const file = input.srcElement.files

      if(file[file.length - 1].size > 400000) {
        this.onError('big_file')
      } else {
        var reader = new FileReader();
      
        this.isOtherImageHasImage = true

        reader.onload = function (e) {
          document.getElementById('other-image-preview')?.setAttribute('src', e.target?.result as string)
        };

        reader.readAsDataURL(file[file.length - 1]);
      }
    }
  }

  onAddImageOther() {
    if(this.isOtherImageHasImage) {
      document.getElementById('other-image-preview')?.setAttribute('src', '/assets/images/placeholder.png')
      this.isOtherImageHasImage = false
    }
    else document.getElementById('other-image')!.click()
  }

  onAddOtherImage() {
    this.otherImageTemp.url = document.getElementById('other-image-preview')?.getAttribute('src')!
    this.otherImageTemp.id = this.generateToken(16)
    document.getElementById('other-image-preview')?.setAttribute('src', '/assets/images/placeholder.png')

    let imageArr = this.locationForm.value.imageUrl;
    imageArr.push(this.otherImageTemp);

    this.otherImageTemp = {
      id: '',
      url: '',
    }

    this.locationForm.patchValue({
      imageUrl: imageArr
    })

    this.isOtherImageHasImage = false
  }

  onRemoveOtherImage(l: any) {
    let imageArr = this.locationForm.value.imageUrl;
    imageArr = imageArr.filter((obj: any) => {
      return obj.id != l.id
    })

    this.locationForm.patchValue({
      imageUrl: imageArr,
    })
  }



  onChangeDayRangeSelected(event: MatCheckboxChange) {
    this.isSelectOneDay = event.checked;
    this.startDay = "";
    this.finishDay = "";
    this.isFinishDayDisable = true;
    this.disableScheduleButton = true
  }

  onChangeHourSelected(event: MatRadioChange) {
    this.isSelectOtherHour = (event.value == "custom");
    this.selectedOtherHour = event.value
  }

  onDayValueChange(dayS: MatSelect) {
    const dayStart = this.getDayIndex(dayS.value);
    
    if(!this.isSelectOneDay) {
      this.dayListFinish = [];

      this.dayListTemp.forEach((item, index) => {
        if(index > dayStart) this.dayListFinish.push(item);
      })
    }

    this.finishDay = ""
    this.isFinishDayDisable = false;

    if(!this.isSelectOneDay) this.disableScheduleButton = true
    else this.disableScheduleButton = false

    this.startDay = dayS.value;
    console.log(this.startDay);
  }

  onDayFinishValueChange(dayF: MatSelect) {
    this.finishDay = dayF.value;
    console.log(this.finishDay);

    this.disableScheduleButton = false
  }

  onValueOtherHourChange(hourOpen: MatSelect, hourClose: MatSelect, minuteOpen: MatSelect, minuteClose: MatSelect) {
    if(hourOpen.value == undefined || hourClose.value == undefined || minuteOpen.value == undefined || minuteClose.value == undefined) {
      this.disableScheduleButton = true
    } else {
      this.disableScheduleButton = false
    }
  }

  onAddSchedule(day: MatSelect, hourOpen: MatSelect, hourClose: MatSelect, minuteOpen: MatSelect, minuteClose: MatSelect) {
    this.disableScheduleButton = true
    
    let scheduleArr: Schedule[] = this.locationForm.value.openDays;
    if(!this.isSelectOneDay) {
      for(let i = this.getDayIndex(this.startDay); i <= this.getDayIndex(this.finishDay); i++) {
        this.dayListStart[i] = '';
  
        scheduleArr[i].hour = (this.isSelectOtherHour) ? "Buka Jam " + hourOpen.value + ":" + minuteOpen.value + " - " + hourClose.value + ":" + minuteClose.value : this.selectedOtherHour;
      }
    } else {
      this.dayListStart[this.getDayIndex(this.startDay)] = '';

      scheduleArr[this.getDayIndex(this.startDay)].hour = (this.isSelectOtherHour) ? hourOpen.value + ":" + minuteOpen.value + " - " + hourClose.value + ":" + minuteClose.value : this.selectedOtherHour;      
    }

    console.log(this.getDayIndex(this.startDay), this.getDayIndex(this.finishDay))
    console.log(this.locationForm.value.openDays)

    this.finishDay = ""; this.startDay = "";
    this.isFinishDayDisable = true;

    this.dayLength = 7;
    scheduleArr.forEach(item => {
      if(item.hour != '') this.dayLength--;
    })

    if(this.dayLength == 1) {
      this.isSelectOneDay = true
      this.isSelectOnDayVisible = false
    }
    //scheduleArr[this.getDayIndex(day.value)].hour = hourOpen.value + ":" + minuteOpen.value + " - " + hourClose.value + ":" + minuteClose.value

    // this.dayListTemp[this.getDayIndex(day.value)] = ''

    // this.locationForm.patchValue({
    //   openDays: scheduleArr
    // })

    // this.dayLength--;

    // if(this.dayLength <= 0) {
    //   this.disableHourSelect = true
    // } else {
    //   this.disableHourSelect = false
    // }

    // day.value = undefined
    // hourOpen.value = undefined
    // hourClose.value = undefined
    // minuteOpen.value = undefined
    // minuteClose.value = undefined
  }

  onRemoveSchedule(o: any) {
    let scheduleArr = this.locationForm.value.openDays;
    scheduleArr[this.getDayIndex(o.day)].hour = '';

    this.dayListStart[this.getDayIndex(o.day)] = o.day

    this.locationForm.patchValue({
      openDays: scheduleArr,
    })

    this.dayLength++;

    this.isSelectOneDay = false
    this.isSelectOnDayVisible = true
  }








  onUpdateLocation() {
    Swal.fire({
      title: 'Simpan Data Lokasi?',
      text: 'Pastikan semua data terisi dengan benar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if(this.locationForm.valid) {
          this.onSaveAllImage()
        } else {
          this.onError('null')
        }
      }
    })
    
  }

  onSaveAllImage() {
    let imageUploadQueue: any[] = [];

    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Mengupload Gambar...',
      text: 'Harap tunggu sebentar',
    })

    this.locationForm.value.items.forEach((item: { src: any; }) => {
      if(item.src != '') imageUploadQueue.push(item.src)
    })

    this.locationForm.value.imageUrl.forEach((item: { url: any; }) => {
      imageUploadQueue.push(item.url)
    })

    this.onUploadImage(imageUploadQueue, [], 0)
  }

  onUploadImage(arr: any[], result: any[], index: number) {

    const storage = getStorage();
    const storageRef = ref(storage, 'image/' + this.generateToken(16));

    if(arr.length > 0) {
      if(arr[0].includes(";base64,")) {
        uploadString(storageRef, arr.shift(), 'data_url').then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            result.push(url)
  
            this.onUploadImage(arr, result, index++)
          })
        });
      } else {
        result.push(arr.shift())

        this.onUploadImage(arr, result, index++)
      }
    } else {
      this.onSaveUploadData(result)
    }
  }

  onSaveUploadData(result: any[]) {
    this.locationForm.value.items.forEach((item: { src: any; }) => {
      if(item.src != '') item.src = result.shift()
    })

    this.locationForm.value.imageUrl.forEach((item: { url: any; }) => {
      item.url = result.shift()
    })

    this.locationForm.patchValue({
      openDays: this.locationForm.value.openDays.filter((obj: { hour: string; }) => {
        return obj.hour != ''
      })
    })

    let d = new Date();
    let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString();
    let today = d.getDate() + ' ' + this.getMonth(month) + ' ' + d.getFullYear() + ' ';
    today += d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();

    let user: User = {
      username: "",
      fullname: "",
      role: ""
    }

    let userData = JSON.parse(localStorage.getItem('user')!);

    user = userData ? userData : user;

    let location: Location = {
      id: (this.data.location) ? this.data.location.id : this.generateToken(20),
      name: this.locationForm.value.name,
      category: this.locationForm.value.category,
      description: this.locationForm.value.description,
      items: this.locationForm.value.items,
      openDays: this.locationForm.value.openDays,
      phone: this.locationForm.value.phone,
      address: this.locationForm.value.address,
      imageUrl: this.locationForm.value.imageUrl,
      totalFav: (this.data.location) ? this.data.location.totalFav : 0,
      review: (this.data.location) ? this.data.location.review : [],
      lastUpdate: today,
      user: (this.data.location) ? this.data.location.user : user,
      position: this.data.position,
      rating: this.data.location ? this.data.location.rating : "0"
    }

    this.onStoreLocation(location)
  }

  async onStoreLocation(location: Location) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.close()
    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Menyimpan Data...',
      text: 'Harap tunggu sebentar',
    })

    await setDoc(doc(db, "location", location.id), location).then(() => {
      this.onSuccess('Berhasil Menyimpan Lokasi!');
      this.data.callback()
      this.dialogRef.close()
    }).catch((reason) => {
      this.onError("save_location")
    })
  }






  openDialogImage(src: string) {
    this.dialog.open(ImagePrevDialogComponent, {
      data: {
        src: document.getElementById(src)?.getAttribute('src')
      }
    })
  }
  





  //LOAD CATEGORY FROM FIRESTORE
  async loadCategory(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "category"));

    onSnapshot(q, (querySnapshot) => {
      this.categoryList = [];
      querySnapshot.forEach(async (item) => {
        this.categoryList.push({
          id: item.id,
          name: item.data()["name"],
        })
      })
    })

    return(false);
  }

  async onUpdateCategory() {
    if(this.categoryFrom.valid) {
      const app = initializeApp(environment.firebase);
      const db = getFirestore(app);

      Swal.fire({
        didOpen: () => {
          Swal.showLoading()
        },
        title: 'Sedang Memuat...',
        text: 'Harap tunggu sebentar',
      })

      await setDoc(doc(db, "category", (this.data.category) ? this.data.category.id : this.generateToken(20)), {
        name: this.categoryFrom.value.name,
      }).then(() => {
        if(this.data.category) this.onSuccess('Berhasil Memperbaharui Kategori!');
        else this.onSuccess('Berhasil Menambah Kategori!');
        this.dialogRef.close()
      }).catch((reason) => {
        this.onError("save_category")
      })
    } else {
      this.onError('null')
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

  //ON ERROR DIALOG
  onError(errorState: String) {
    Swal.close();

    switch(errorState) {
      case "save_category":
        Swal.fire({
          icon: "error",
          title: "Gagal Menambah Kategori"
        })
        break;
      case "null":
        Swal.fire({
          icon: "warning",
          title: "Harap isi Nama dan Kategori Titik Lokasi"
        })
        break;
      case "error_center":
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan Titik Tengah"
        })
        break;
      case "big_file":
        Swal.fire({
          icon: "error",
          title: "File Terlalu Besar",
          text: 'Ukuran maksimal adalah 400KB'
        })
        break;
      case "save_location":
        Swal.fire({
          icon: "error",
          title: "Gagal Menambah Lokasi"
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

  getDayIndex(day: String) {
    switch(day) {
      case 'Senin':
        return 0;
      case 'Selasa':
        return 1;
      case 'Rabu':
        return 2;
      case 'Kamis':
        return 3;
      case 'Jumat':
        return 4;
      case 'Sabtu':
        return 5;
      default:
        return 6;
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

  ratingRound(rating: string): String {
    let rate = parseFloat(rating);
    let rateStr = (Math.round(rate * 100) / 100).toFixed(1)
    return rateStr;
  }
}








@Component({
  selector: 'pemetaan-snackbar',
  templateUrl: 'pemetaan.snackbar.html',
  styles: [
    `
    :host {
      display: flex;
    }

  `,
  ],
})
export class PemetaanSnackbar {
  snackBarRef = inject(MatSnackBarRef);
}







@Component({
  selector: 'pemetaan-search-modal',
  templateUrl: './pemetaan-search.dialog.html',
  styleUrls: ['./pemetaan.component.scss']
})
export class PemetaanSearchDialogModal implements OnInit {
  searchForm: FormGroup = this.initSearchFormGroup();

  constructor(
    private dialogRef: MatDialogRef<PemetaanSearchDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }
  
  ngOnInit(): void {
    
  }

  initSearchFormGroup() {
    return this.fb.group({
      keyword: ['']
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