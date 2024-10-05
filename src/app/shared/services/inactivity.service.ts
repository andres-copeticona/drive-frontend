import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private inactivityTimeout: any;
  private readonly inactivityDuration = 5 * 60 * 1000; // 5 minutos en milisegundos
  public onUserInactive: Subject<void> = new Subject<void>();

  constructor(private ngZone: NgZone) {}

  public stop() {
    clearTimeout(this.inactivityTimeout);
  }

  public start() {
    this.startWatching();
  }

  private startWatching() {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      this.resetTimer();

      window.addEventListener('mousemove', () => this.resetTimer());
      window.addEventListener('keydown', () => this.resetTimer());
      window.addEventListener('click', () => this.resetTimer());
      window.addEventListener('scroll', () => this.resetTimer());
      window.addEventListener('touchstart', () => this.resetTimer());
    });
  }

  private resetTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.onUserInactive.next();
    }, this.inactivityDuration);
  }
}
