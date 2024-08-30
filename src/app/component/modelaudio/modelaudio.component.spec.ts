import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelaudioComponent } from './modelaudio.component';

describe('ModelaudioComponent', () => {
  let component: ModelaudioComponent;
  let fixture: ComponentFixture<ModelaudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelaudioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelaudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
