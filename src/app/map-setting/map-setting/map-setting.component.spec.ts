import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSettingComponent } from './map-setting.component';

describe('MapSettingComponent', () => {
  let component: MapSettingComponent;
  let fixture: ComponentFixture<MapSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
