import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitycenterComponent } from './activitycenter.component';

describe('ActivitycenterComponent', () => {
  let component: ActivitycenterComponent;
  let fixture: ComponentFixture<ActivitycenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitycenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivitycenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
