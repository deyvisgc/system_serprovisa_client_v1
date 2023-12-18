import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRequest } from 'src/app/core/interface/linea.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root',
})
export class LineaService {
  constructor(private http: HttpClient) {}
  register(linea: LineaRequest[]): Observable<Response> {
    return this.http.post<any>(UriConstante.LINEA_RESORCE, linea);
  }
  update(id: number, linea: LineaRequest): Observable<Response> {
    return this.http.put<any>(`${UriConstante.LINEA_RESORCE}/${id}`, linea);
  }
  getAll(limit: number, offset: number, page: number): Observable<any> {
    const params = new HttpParams()
      .append('limit', limit)
      .append('offset', offset)
      .append('page', page);
    return this.http.get(UriConstante.LINEA_RESORCE, { params: params });
  }
  getById(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.LINEA_RESORCE + `/${id}`);
  }
  getByIdFamilia(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.LINEA_FAMILIA_RESORCE + `/${id}`);
  }
  delete(id: number) {
    return this.http.delete<any>(UriConstante.LINEA_RESORCE + `/${id}`);
  }
}
