import { AfterContentInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { GeoPoint, collection, deleteDoc, doc, getFirestore, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

/// <reference types="@types/googlemaps" />

declare const google: any;
let poly: google.maps.Polyline;
let polyTemp: google.maps.Polyline;
let map: google.maps.Map;
let path: google.maps.MVCArray<google.maps.LatLng>
let pathTemp: google.maps.MVCArray<google.maps.LatLng>

export interface DialogData {
  title: String,
  isNewMap: boolean,
  callback: any,
  data: NewMap
}

interface NewMap {
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

@Component({
  selector: 'app-map-setting',
  templateUrl: './map-setting.component.html',
  styleUrls: ['./map-setting.component.scss']
})
export class MapSettingComponent implements OnInit, AfterContentInit {
  isListLoading = true;
  isData = false;
  isDrawMode = false;
  drawStateIndex = 0;
  drawRedoMax = 0;
  drawUndoDisabled = true;
  drawRedoDisabled = true;
  position: Array<Position | undefined> = [];
  positionTemp: Array<Position | undefined> = [];
  markers: Array<google.maps.Marker | undefined> = [];
  markersTemp: Array<google.maps.Marker | undefined> = [];
  layerList: Array<NewMap> = [];
  pageIndex = 0;
  pageSize = 5;
  layerListRTemp: Array<google.maps.Polygon> = []

  isSetCenter = false;
  markerCenter: google.maps.Marker | undefined

  buttonMode = {
    text: "Tambah Layer",
    icon: "add"
  }
  newMap: NewMap = {
    id: '',
    name: '',
    color: '',
    isActive: false,
    location: []
  }

  constructor(private dialog: MatDialog, private router: Router) {}

  //INIT ON RELOAD
  initVar(isUpdate: boolean) {
    this.isListLoading = true;
    this.isData = false;
    this.isDrawMode = false;
    this.drawStateIndex = 0;
    this.drawRedoMax = 0;
    this.drawUndoDisabled = true;
    this.drawRedoDisabled = true;
    this.position = [];
    this.positionTemp = [];
    this.markers = [];
    this.markersTemp = [];
    this.pageIndex = 0;
    this.pageSize = 5;

    this.buttonMode = {
      text: "Tambah Layer",
      icon: "add"
    }
    this.newMap = {
      id: '',
      name: '',
      color: '',
      isActive: false,
      location: []
    }

    if(!isUpdate) {
      this.layerList = [];
    }
  }

  ngOnInit(): void {
    document.onkeydown = this.drawStateKeyUp.bind(this)
  }

  ngAfterContentInit(): void {
    this.initVar(false);

    let mapElement = document.getElementById('mapElement');

    const myLating = { lat: -7.9368565143471415, lng: 110.57208395746801 }

    map = new google.maps.Map(mapElement, {
      center: myLating,
      zoom: 16,
      clickableIcons: false,
      gestureHandling: "cooperative",
    })

    this.loadLayer()
  }



  //LOAD LAYER FROM FIRESTORE
  async loadLayer(): Promise<boolean> {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    const q = query(collection(db, "layers"));

    onSnapshot(q, (querySnapshot) => {
      this.drawLayers(true)

      this.isData = true;
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
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: item.color,
              fillOpacity: 0.4,
              clickable: true
            })

            const infowindow = new google.maps.InfoWindow({
              content: item.name,
              ariaLabel: "Layer",
            });

            layer.addListener("click", () => {
              infowindow.open({
                anchor: layer,
                map,
              });
            })

            this.layerListRTemp.push(layer)
    
            layer.setMap(map);
          }
        })
      }
    }
  }



  
  //ON GREEN BUTTON CLICK
  handleGreenButton() {
    if(!this.isDrawMode) this.openDialog('add', 'Tambah Layer Baru', this.newMap);
    else this.onDataUpdateDialog("save", this.newMap)
  }

  //TOGGLE DRAW ON OR OFF
  toggleDrawMode(isSave: boolean) {
    this.isDrawMode = !this.isDrawMode;

    if(this.isDrawMode) {
      this.layerListRTemp.forEach(item => {
        item.setOptions({clickable: false})
      })

      this.buttonMode = {
        text: "Simpan",
        icon: "done"
      }

      map.setOptions({draggableCursor: "url(/assets/images/pointer.png), auto"})
    } else {
      this.layerListRTemp.forEach(item => {
        item.setOptions({clickable: true})
      })

      this.buttonMode = {
        text: "Tambah Layer",
        icon: "add"
      }

      path.clear()
      pathTemp.clear()

      map.setOptions({draggableCursor: "auto"})

      if(isSave) {        
        //this.onDataUpdateDialog("save", this.newMap)
      } else {
        this.ngAfterContentInit()
      }
    }
  }

  //START DRAW MODE
  startDraw(newMap: NewMap) {
    this.newMap = newMap;
    this.toggleDrawMode(false);

    google.maps.event.clearListeners(map, 'click');

    poly = new google.maps.Polygon({
      strokeColor: newMap.color,
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: newMap.color,
      fillOpacity: 0.4,
      clickable: false
    });
    poly.setMap(map);

    polyTemp = new google.maps.Polygon({
      strokeOpacity: 0,
      fillOpacity: 0,
      clickable: false
    });
    polyTemp.setMap(map);
  
    map.addListener("click", this.addLatLng.bind(this));
  }

  //ADD LAT AND LNG IN DRAW MODE
  addLatLng(event: google.maps.MapMouseEvent) {
    this.drawUndoDisabled = false;
    this.drawRedoDisabled = true;
    this.drawStateIndex++;

    this.drawRedoMax = this.drawStateIndex

    path = poly.getPath();
    pathTemp = polyTemp.getPath();
  
    path.push(event.latLng as google.maps.LatLng);

    this.position.push({
      lat: event.latLng?.lat(),
      lng: event.latLng?.lng()
    })

    const image = '/assets/images/pin.png'
    const marker = new google.maps.Marker({
      position: event.latLng,
      title: "#" + path.getLength(),
      map: map,
      icon: image
    });

    this.markers.push(marker);
  
    this.setMarker();
  }

  //DRAW STATE UNDO OR REDO
  drawState(state: String) {
    switch(state) {
      case "undo": 
        if(this.drawStateIndex == 1) this.drawUndoDisabled = true
        else this.drawUndoDisabled = false
        this.drawStateIndex--;
        
        this.drawRedoDisabled = false

        pathTemp.push(path.pop());

        this.positionTemp.push(this.position.pop())

        this.markersTemp.push(this.markers.pop())
        break;
      case "redo":
        if(this.drawRedoMax - 1 == this.drawStateIndex) this.drawRedoDisabled = true
        else this.drawRedoDisabled = false
        this.drawStateIndex++;

        this.drawUndoDisabled = false

        path.push(pathTemp.pop());

        this.position.push(this.positionTemp.pop())
        
        this.markers.push(this.markersTemp.pop())
        break;
    }

    this.setMarker()
  }

  drawStateKeyUp(e: any) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey){
      if(!this.drawUndoDisabled) {
        this.drawState("undo")
      }
    }
    
    if (evtobj.keyCode == 89 && evtobj.ctrlKey){
      if(!this.drawRedoDisabled) {
        this.drawState("redo")
      }
    }
  }

  //SET ALL MARKER
  setMarker() {
    this.markersTemp.forEach(item => {
      item?.setMap(null)
    })

    this.markers.forEach(item => {
      item?.setMap(map)
    })
  }




  //ON SAVE LAYER DIALOG
  onDataUpdateDialog(update: String, newData: NewMap) {
    let title = "";
    switch(update) {
      case "save":
        title = 'Simpan layer?';
        break;
      case "edit":
        title = 'Perbaharui layer?';
        break;
      case "delete":
        title = 'Yakin ingin menghapus layer?';
        break;
    }

    Swal.fire({
      title: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        switch(update) {
          case "save":
            this.onSaveLayer()
            break;
          case "edit":
            this.onEditLayer(newData, false)
            break;
          case "delete":
            this.onDeleteLayer(newData.id)
            break;
        }
      }
    })
  }

  //ON SAVE LAYER TO FIRESTORE
  async onSaveLayer() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Memuat...',
      text: 'Harap tunggu sebentar',
    })

    let geoPointArr: { latitude: number | undefined; longitude: number | undefined; }[] = [];
    this.position.forEach(item => {
      geoPointArr.push({
        latitude: item?.lat,
        longitude: item?.lng
      })
    })

    await setDoc(doc(db, "layers", this.generateToken(20)), {
      name: this.newMap.name,
      color: this.newMap.color,
      isActive: true,
      location: geoPointArr
    }).then(() => {
      this.onSuccess('Berhasil Menambah Layer!');
      this.ngAfterContentInit()
    }).catch((reason) => {
      this.onError("error_save")
    })
  }

  //ON EDIT LAYER TO FIRESTORE
  async onEditLayer(data: NewMap, isToggleActive: boolean) {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Memuat...',
      text: 'Harap tunggu sebentar',
    })

    let dataTemp = isToggleActive ? {isActive: !data.isActive} : {name: data.name, color: data.color}

    await updateDoc(doc(db, "layers", data.id), dataTemp).then(() => {
      if(isToggleActive) this.onSuccess('Berhasil mengaktifkan layer');
      else this.onSuccess('Berhasil memperbaharui layer');

      this.ngAfterContentInit()
    }).catch(reason => {
      if(isToggleActive) this.onError('Gagal mengaktifkan layer');
      else this.onError('Gagal memperbaharui layer');
    })
  }

  //ON DELETE LAYER
  async onDeleteLayer(layerId: string) {
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

    await deleteDoc(doc(db, "layers", layerId)).then(() => {
      this.onSuccess('Berhasil Menghapus Layer!')

      this.drawLayers(true)
      this.drawLayers(false)
    }).catch(reason => {
      this.onError("delete");
    });
  }





  //TOGGLE SET CENTER
  toggleSetCenter() {
    this.isSetCenter = !this.isSetCenter

    if(this.isSetCenter) {
      map.setOptions({draggableCursor: "url(/assets/images/pointer.png), auto"})

      this.layerListRTemp.forEach(item => {
        item.setOptions({clickable: false})
      })

      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if(this.markerCenter) this.markerCenter.setMap(null)
        this.markerCenter = new google.maps.Marker({
          position: event.latLng,
          map: map,
        });

        map.panTo(event.latLng!)
      })
    } else {
      map.setOptions({draggableCursor: "auto"})
      
      this.layerListRTemp.forEach(item => {
        item.setOptions({clickable: true})
      })

      this.ngAfterContentInit()
    }
  }

  onSaveCenterDialog() {
    Swal.fire({
      title: 'Simpan titik tengah?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSaveCenter()
      }
    })
  }

  async onSaveCenter() {
    const app = initializeApp(environment.firebase);
    const db = getFirestore(app);

    Swal.fire({
      didOpen: () => {
        Swal.showLoading()
      },
      title: 'Sedang Memuat...',
      text: 'Harap tunggu sebentar',
    })

    await setDoc(doc(db, "layers", 'center'), {
      lat: this.markerCenter?.getPosition()?.lat(),
      lng: this.markerCenter?.getPosition()?.lng()
    }).then(() => {
      this.onSuccess('Berhasil Menyimpan Titik Tengah!');
      this.toggleSetCenter();
      this.markerCenter?.setMap(null)
      this.ngAfterContentInit()
    }).catch((reason) => {
      this.onError("error_center")
    })
  }





  //OPEN MODAL
  openDialog(dialog: String, title: String, data: NewMap) {
    switch(dialog) {
      case "add":
        this.dialog.open(MapSettingDialogModal, {
          data: {
            title: title,
            callback: this.startDraw.bind(this),
            isNewMap: true
          },
        })
        break;
      case "edit":
        this.dialog.open(MapSettingDialogModal, {
          data: {
            title: title,
            callback: this.onDataUpdateDialog.bind(this),
            data: data,
            isNewMap: false
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
      case "error_save":
        Swal.fire({
          icon: "error",
          title: "Gagal Menambah Layer"
        })
        break;
      case "delete":
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus Layer"
        })
        break;
      case "error_center":
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan Titik Tengah"
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
}





@Component({
  selector: 'map-setting-modal',
  templateUrl: './map-setting.dialog.html',
  styleUrls: ['./map-setting.component.scss']
})
export default class MapSettingDialogModal implements OnInit {
  newMapFrom: FormGroup = this.initFormGroup();

  constructor(
    private dialogRef: MatDialogRef<MapSettingDialogModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if(this.data.data) {
      this.newMapFrom.patchValue({
        name: this.data.data.name,
        color: this.data.data.color
      })
    }
  }

  initFormGroup() {
    return this.fb.group({
      name: ['', [Validators.required]],
      color: ['#000000', [Validators.required]]
    })
  }

  //ON START DRAW WHEN FORM VALID
  onStartDrawMode() {
    if(!this.newMapFrom.invalid){
      const newMap: NewMap = this.newMapFrom.value;

      this.data.callback(newMap);

      this.dialogRef.close()
    }
  }

  //ON EDIT DATA
  onEditLayer() {
    if(!this.newMapFrom.invalid){
      const newMapTemp: NewMap = this.newMapFrom.value;
      const newMap: NewMap = {
        id: this.data.data.id,
        name: newMapTemp.name,
        color: newMapTemp.color,
        isActive: this.data.data.isActive,
        location: this.data.data.location
      }

      this.data.callback("edit", newMap);

      this.dialogRef.close()
    }
  }
}