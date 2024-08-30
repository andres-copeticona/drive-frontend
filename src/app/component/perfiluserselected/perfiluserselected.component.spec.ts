import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfiluserselectedComponent } from './perfiluserselected.component';

describe('PerfiluserselectedComponent', () => {
  let component: PerfiluserselectedComponent;
  let fixture: ComponentFixture<PerfiluserselectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfiluserselectedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfiluserselectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
