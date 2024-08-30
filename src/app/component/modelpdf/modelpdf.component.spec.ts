import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelpdfComponent } from './modelpdf.component';

describe('ModelpdfComponent', () => {
  let component: ModelpdfComponent;
  let fixture: ComponentFixture<ModelpdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelpdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelpdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
