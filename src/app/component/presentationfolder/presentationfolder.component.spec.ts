import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationfolderComponent } from './presentationfolder.component';

describe('PresentationfolderComponent', () => {
  let component: PresentationfolderComponent;
  let fixture: ComponentFixture<PresentationfolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationfolderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PresentationfolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
