import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeldeleteComponent } from './modeldelete.component';

describe('ModeldeleteComponent', () => {
  let component: ModeldeleteComponent;
  let fixture: ComponentFixture<ModeldeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeldeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModeldeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
