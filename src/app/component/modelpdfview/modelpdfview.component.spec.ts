import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelpdfviewComponent } from './modelpdfview.component';

describe('ModelpdfviewComponent', () => {
  let component: ModelpdfviewComponent;
  let fixture: ComponentFixture<ModelpdfviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelpdfviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelpdfviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
