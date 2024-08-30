import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelimgComponent } from './modelimg.component';

describe('ModelimgComponent', () => {
  let component: ModelimgComponent;
  let fixture: ComponentFixture<ModelimgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelimgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelimgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
