import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 10, trail: string = '...'): string {
    if (typeof value === 'string') {
      value = value.replace(/-/g, ' ');
      if (value.length > limit) {
        return value.substring(0, limit) + trail;
      }
    }

    return value;
  }
}
