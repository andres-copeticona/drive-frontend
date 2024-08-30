import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModellogoutComponent } from './modellogout.component';

describe('ModellogoutComponent', () => {
  let component: ModellogoutComponent;
  let fixture: ComponentFixture<ModellogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModellogoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModellogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
