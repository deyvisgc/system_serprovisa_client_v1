import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap} from 'rxjs';
import { Response } from 'src/app/core/interface/message.response';
import { UserRequest } from 'src/app/core/interface/users.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private permisos = new BehaviorSubject<any>([]);
  datos$ = this.permisos.asObservable();
  constructor(private http: HttpClient) {
    
  }
  registerAndUpdate(id: number, user: UserRequest): Observable<Response> {
    if (id === 0) {
      return this.http.post<any>(UriConstante.ADMIN_RESOURCE, user);
    } else {
      return this.http.put<any>(UriConstante.ADMIN_RESOURCE + `/${id}`, user);
    }
  }
  getRol(): Observable<any> {
    return this.http.get(UriConstante.ROLE);
  }
  getAll(limit: number, offset: number, page: number): Observable<any> {
    const params = new HttpParams()
      .append('limit', limit)
      .append('offset', offset)
      .append('page', page);
    return this.http.get(UriConstante.ADMIN_RESOURCE, { params: params });
  }
  getUsersById(id: number): Observable<any> {
    return this.http.get<any>(UriConstante.ADMIN_RESOURCE + `/${id}`);
  }
  delete(id: number) {
    return this.http.delete<any>(UriConstante.ADMIN_RESOURCE + `/${id}`);
  }
  getCountDashboard(): Observable<any> {
    return this.http.get<any>(`${UriConstante.ADMIN_RESOURCE}/count-total`);
  }
  getPermisos(): Observable<any> {
    return this.http.get<any>(`${UriConstante.ADMIN_RESOURCE}/permisos`);
  }
  getPermisosById(id: number): Observable<any> {
    return this.http.get<any>(`${UriConstante.ADMIN_RESOURCE}/permisos/${id}`);
  }
  addPermisosObservable(lista: any) {
    if ( lista?.length > 0) {
      this.permisos.next(lista);
    }
  }
  obtenerDatos(): any {
    return this.permisos.value;
  }
}
