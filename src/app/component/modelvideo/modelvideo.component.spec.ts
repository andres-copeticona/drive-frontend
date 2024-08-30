import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelvideoComponent } from './modelvideo.component';

describe('ModelvideoComponent', () => {
  let component: ModelvideoComponent;
  let fixture: ComponentFixture<ModelvideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelvideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelvideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
