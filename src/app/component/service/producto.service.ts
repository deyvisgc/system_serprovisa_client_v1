import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosProducto } from 'src/app/core/interface/filtros.request';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  constructor(private http: HttpClient) {}
  getAll(
    limit: number,
    offset: number,
    page: number,
    filtros: FiltrosProducto
  ): Observable<any> {
    let fecha_ini = '';
    let fecha_fin = '';
    if (
      filtros.fecha_ini.day !== 0 &&
      filtros.fecha_ini.year !== 0 &&
      filtros.fecha_ini.month !== 0
    ) {
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
      .append('linea', filtros.linea)
      .append('grupo', filtros.grupo)
      .append('user', filtros.user);
    return this.http.get(UriConstante.PRODUCTO_RESORCE, { params: params });
  }
  getById(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.PRODUCTO_RESORCE + `/${id}`);
  }
  register(product: ProductoRequest[]): Observable<Response> {
    return this.http.post<any>(UriConstante.PRODUCTO_RESORCE, product);
  }
  getLastProduct(): Observable<any> {
    return this.http.get<any>(`${UriConstante.PRODUCTO_RESORCE}/lastProducts`);
  }
  getReport(): Observable<any> {
    return this.http.get<any>(`${UriConstante.PRODUCTO_RESORCE}/report`);
  }
  getCountProducts(limit: number, offset: number,  page: number,): Observable<any> {
    const params = new HttpParams()
      .append('limit', limit)
      .append('offset', offset)
      .append('page', page)
    return this.http.get<any>(`${UriConstante.PRODUCTO_RESORCE}/countProducts`, {params: params});
  }
  registerMaivo(product: ProductoRequest[]): Observable<Response> {
    return this.http.post<any>(
      `${UriConstante.PRODUCTO_RESORCE}/masivo`,
      product
    );
  }
  update(id: number, product: ProductoRequest): Observable<Response> {
    return this.http.put<any>(
      `${UriConstante.PRODUCTO_RESORCE}/${id}`,
      product
    );
  }
  delete(id: number) {
    return this.http.delete<any>(UriConstante.PRODUCTO_RESORCE + `/${id}`);
  }
  descargarExcel(filtros: FiltrosProducto) {
    let fecha_ini = '';
    let fecha_fin = '';
    const dayIni =
    filtros.fecha_ini.day < 10 ? `0${filtros.fecha_ini.day}` : filtros.fecha_ini.day;
    const dayFin = filtros.fecha_fin.day < 10 ? `0${filtros.fecha_fin.day}`: filtros.fecha_fin.day;
    fecha_ini = `${filtros.fecha_ini.year}-${filtros.fecha_ini.month}-${dayIni}`;
    fecha_fin = `${filtros.fecha_fin.year}-${filtros.fecha_fin.month}-${dayFin}`;
    const params = new HttpParams()
      .append('fecha_ini', fecha_ini)
      .append('fecha_fin', fecha_fin)
      .append('familia', filtros.famila)
      .append('linea', filtros.linea)
      .append('grupo', filtros.grupo)
      .append('user', filtros.user);
    return this.http.get(`${UriConstante.PRODUCTO_RESORCE}/export/excel`, {params, responseType: 'blob'});
  }
  descargarPdf(filtros: FiltrosProducto) {
    let fecha_ini = '';
    let fecha_fin = '';
    const dayIni =
    filtros.fecha_ini.day < 10 ? `0${filtros.fecha_ini.day}` : filtros.fecha_ini.day;
    const dayFin = filtros.fecha_fin.day < 10 ? `0${filtros.fecha_fin.day}`: filtros.fecha_fin.day;
    fecha_ini = `${filtros.fecha_ini.year}-${filtros.fecha_ini.month}-${dayIni}`;
    fecha_fin = `${filtros.fecha_fin.year}-${filtros.fecha_fin.month}-${dayFin}`;
    const params = new HttpParams()
      .append('fecha_ini', fecha_ini)
      .append('fecha_fin', fecha_fin)
      .append('familia', filtros.famila)
      .append('linea', filtros.linea)
      .append('grupo', filtros.grupo)
      .append('user', filtros.user);
    return this.http.get(`${UriConstante.PRODUCTO_RESORCE}/export/pdf`, {params, responseType: 'blob'});
  }
}
