export interface QrCode {
  id: number;
  emisor: string;
  mensaje: string;
  titulo: string;
  fechaCreacion: Date;
  codeQr: string;
}
