import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleselloComponent } from './detallesello.component';

describe('DetalleselloComponent', () => {
  let component: DetalleselloComponent;
  let fixture: ComponentFixture<DetalleselloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleselloComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleselloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
