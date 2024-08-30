export interface RolDto {
  // Definición de propiedades para RolDto
  // Ejemplo:
  id: number;
  nombre: string;
  // Añade más propiedades según sean necesarias.
}

export interface UsuarioDTO {
  usuarioID: number;
  idServidor: string;
  usuario: string;
  ci: string;
  nombres: string;
  paterno: string;
  materno: string;
  celular: string;
  domicilio?: string; // Usar '?' para indicar que la propiedad es opcional
  cargo?: string;
  dependencia?: string;
  sigla?: string;
  createdAt?: string; // Usar string para fechas, la conversión a objetos Date puede ser manejada más adelante.
  updatedAt?: string;
  deleted: boolean;
  status: boolean;
  roles?: RolDto[]; // Asegúrate de tener una interfaz RolDto si usas roles.
}
