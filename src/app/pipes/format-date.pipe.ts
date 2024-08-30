import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | string, formatString: string = 'PPP'): string {
    return format(new Date(value), formatString, { locale: es });
  }
}
