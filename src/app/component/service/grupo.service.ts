import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRequest } from 'src/app/core/interface/linea.request';
import { GrupoRequest } from 'src/app/core/interface/grupo.request';
import { UriConstante } from 'src/app/util/UriConstante';
import { Filtros } from './../../core/interface/filtros.request';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  constructor(private http: HttpClient) {}
  register(linea: GrupoRequest[]): Observable<Response> {
    return this.http.post<any>(UriConstante.GRUPO_RESORCE, linea);
  }
  update(id: number, linea: LineaRequest): Observable<Response> {
    return this.http.put<any>(`${UriConstante.GRUPO_RESORCE}/${id}`, linea);
  }
  getAll(
    limit: number,
    offset: number,
    page: number,
    filtros: Filtros
  ): Observable<any> {
    let fecha_ini = '';
    let fecha_fin = '';
    if ( filtros.fecha_ini.day !== 0 &&filtros.fecha_ini.year !== 0 && filtros.fecha_ini.month !== 0 ) {
      const dayIni =
        filtros.fecha_ini.day < 10
          ? `0${filtros.fecha_ini.day}`
          : filtros.fecha_ini.day;

      const dayFin =
        filtros.fecha_fin.day < 10
          ? `0${filtros.fecha_fin.day}`
          : filtros.fecha_fin.day;
      
      fecha_ini = `${filtros.fecha_ini.year}-${filtros.fecha_ini.month}-${dayIni}`;
      fecha_fin = `${filtros.fecha_fin.year}-${filtros.fecha_fin.month}-${dayFin}`;
    }
    const params = new HttpParams()
      .append('limit', limit)
      .append('offset', offset)
      .append('page', page)
      .append('fecha_ini', fecha_ini)
      .append('fecha_fin', fecha_fin)
      .append('familia', filtros.famila)
      .append('linea', filtros.linea);
    return this.http.get(UriConstante.GRUPO_RESORCE, { params: params });
  }
  getById(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.GRUPO_RESORCE + `/${id}`);
  }
  delete(id: number) {
    return this.http.delete<any>(UriConstante.GRUPO_RESORCE + `/${id}`);
  }
  getByIdLinea(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.GRUPO_LINEA_RESORCE + `/${id}`);
  }
  descargarExcel(filtros: Filtros) {
    let fecha_ini = '';
    let fecha_fin = '';
    const dayIni = filtros.fecha_ini.day < 10 ? `0${filtros.fecha_ini.day}`: filtros.fecha_ini.day;
    const dayFin = filtros.fecha_fin.day < 10 ? `0${filtros.fecha_fin.day}`: filtros.fecha_fin.day;
    fecha_ini = `${filtros.fecha_ini.year}-${filtros.fecha_ini.month}-${dayIni}`;
    fecha_fin = `${filtros.fecha_fin.year}-${filtros.fecha_fin.month}-${dayFin}`;
    const params = new HttpParams()
      .append('fecha_ini', fecha_ini)
      .append('fecha_fin', fecha_fin)
      .append('familia', filtros.famila)
      .append('linea', filtros.linea);
    return this.http.get(`${UriConstante.GRUPO_RESORCE}/export/excel`, {params, responseType: 'blob'});
  }
  descargarPdf(filtros: Filtros) {
    let fecha_ini = '';
    let fecha_fin = '';
    const dayIni = filtros.fecha_ini.day < 10 ? `0${filtros.fecha_ini.day}`: filtros.fecha_ini.day;
    const dayFin = filtros.fecha_fin.day < 10 ? `0${filtros.fecha_fin.day}`: filtros.fecha_fin.day;
    fecha_ini = `${filtros.fecha_ini.year}-${filtros.fecha_ini.month}-${dayIni}`;
    fecha_fin = `${filtros.fecha_fin.year}-${filtros.fecha_fin.month}-${dayFin}`;
    const params = new HttpParams()
    .append('fecha_ini', fecha_ini)
    .append('fecha_fin', fecha_fin)
    .append('familia', filtros.famila)
    .append('linea', filtros.linea);
    return this.http.get(`${UriConstante.GRUPO_RESORCE}/export/pdf`, {params, responseType: 'blob'});
  }
}
