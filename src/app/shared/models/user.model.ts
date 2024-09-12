export interface User {
  id: number;
  role: Role;
  idServer: string;
  names: string;
  firstSurname: string;
  secondSurname: string;
  cellphone: string;
  address: string;
  ci: string;
  state: string;
  position: string;
  dependence: string;
  acronym: string;
  username: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export interface Role {
  id: number;
  name: string;
}
