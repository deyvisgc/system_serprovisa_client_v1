import { ModulosRequest } from "./modulos.request";

export interface UserRequest {
  email: string,
  password?: string,
  name: string,
  id_rol: number,
  modulo: ModulosRequest[]
}
