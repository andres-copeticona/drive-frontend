import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateDocumentName',
  standalone: true
})
export class TruncateDocumentNamePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/^\w{3}_\w{3}_\d{2}_\d{2}:\d{2}:\d{2}_\w+_\d{4}_/, '');
  }
}
