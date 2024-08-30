import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelfolderComponent } from './modelfolder.component';

describe('ModelfolderComponent', () => {
  let component: ModelfolderComponent;
  let fixture: ComponentFixture<ModelfolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelfolderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelfolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
