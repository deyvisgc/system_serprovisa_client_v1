import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FamiliaRequest } from 'src/app/core/interface/family.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  constructor(private http: HttpClient) {}
  register(familia: FamiliaRequest[]): Observable<Response> {
    return this.http.post<any>(UriConstante.FAMILY_RESOURCE, familia);
  }
  update(id: number, familia: FamiliaRequest): Observable<Response> {
    return this.http.put<any>(`${UriConstante.FAMILY_RESOURCE}/${id}`, familia);
  }
  getAll(limit: number, offset: number, page: number): Observable<any> {
    const params = new HttpParams()
      .append('limit', limit)
      .append('offset', offset)
      .append('page', page);
    return this.http.get(UriConstante.FAMILY_RESOURCE, { params: params });
  }
  getById(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.FAMILY_RESOURCE + `/${id}`);
  }
  delete(id: number) {
    return this.http.delete<any>(UriConstante.FAMILY_RESOURCE + `/${id}`);
  }
  // descargarExcel() {
  //   return this.http.get(UriConstante.FAMILY_RESOURCE_DESCARGAR_ECXEL, {
  //     responseType: 'blob',
  //   });
  // }
  // descargarPdf() {
  //   return this.http.get(UriConstante.FAMILY_RESOURCE_DESCARGAR_PDF, {
  //     responseType: 'blob',
  //   });
  // }
}
