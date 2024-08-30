import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelpasswordComponent } from './modelpassword.component';

describe('ModelpasswordComponent', () => {
  let component: ModelpasswordComponent;
  let fixture: ComponentFixture<ModelpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelpasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
