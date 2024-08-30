import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsharingComponent } from './modelsharing.component';

describe('ModelsharingComponent', () => {
  let component: ModelsharingComponent;
  let fixture: ComponentFixture<ModelsharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsharingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelsharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
