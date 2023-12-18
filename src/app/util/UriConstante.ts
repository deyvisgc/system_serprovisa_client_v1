import { environment } from "src/environments/environment"
export class UriConstante {
  public static readonly ADMIN_RESOURCE = environment.API_BASE_URL + "/admin"
  public static readonly LOGIN = environment.API_BASE_URL + "/admin/login"
  public static readonly ROLE = environment.API_BASE_URL + "/admin/role"
  
  public static readonly FAMILY_RESOURCE = environment.API_BASE_URL + "/family"
  public static readonly FAMILY_RESOURCE_DESCARGAR_ECXEL = environment.API_BASE_URL + "/family/export/excel"
  public static readonly FAMILY_RESOURCE_DESCARGAR_PDF = environment.API_BASE_URL + "/family/export/pdf"
  public static readonly LINEA_RESORCE = environment.API_BASE_URL + "/linea"
  public static readonly LINEA_FAMILIA_RESORCE = environment.API_BASE_URL + "/linea/linea-familia"
  public static readonly GRUPO_RESORCE = environment.API_BASE_URL + "/group"
  public static readonly GRUPO_LINEA_RESORCE = environment.API_BASE_URL + "/group/grupo-linea"
  public static readonly PRODUCTO_RESORCE = environment.API_BASE_URL + "/products"
}
