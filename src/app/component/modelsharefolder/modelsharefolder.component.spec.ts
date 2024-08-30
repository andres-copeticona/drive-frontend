import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsharefolderComponent } from './modelsharefolder.component';

describe('ModelsharefolderComponent', () => {
  let component: ModelsharefolderComponent;
  let fixture: ComponentFixture<ModelsharefolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsharefolderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelsharefolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
