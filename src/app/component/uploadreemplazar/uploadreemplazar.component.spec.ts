import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadreemplazarComponent } from './uploadreemplazar.component';

describe('UploadreemplazarComponent', () => {
  let component: UploadreemplazarComponent;
  let fixture: ComponentFixture<UploadreemplazarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadreemplazarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadreemplazarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
