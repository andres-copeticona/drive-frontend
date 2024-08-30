export interface ResponseDto<T> {
  code: number;
  data: T;
  message: string;
}
