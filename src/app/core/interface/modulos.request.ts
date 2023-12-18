export interface ModulosRequest {
  id: number;
  descripcion: string,
  permisos: Permisos[]
}
interface Permisos {
  id_permission: number;
  permission_name: string;
  checked: boolean
}