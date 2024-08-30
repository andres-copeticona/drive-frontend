import { TestBed } from '@angular/core/testing';

import { ActividadcompartidoService } from './actividadcompartido.service';

describe('ActividadcompartidoService', () => {
  let service: ActividadcompartidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActividadcompartidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
