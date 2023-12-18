import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { UriConstante } from 'src/app/util/UriConstante';
import { KeySession } from 'src/app/util/key_session.constante';
import { TokenService } from 'src/app/util/token.service';
import { AdminService } from 'src/app/component/service/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private htpp: HttpClient, private tokenServ: TokenService, private router: Router, private adminService: AdminService) {
  }
  login(email: string, password: string): Observable<any> {
    return this.htpp.
    post<any>(UriConstante.LOGIN, {email, password})
    .pipe(tap(res => {
      this.tokenServ.saveToken(res.access_token)
      this.tokenServ.addRoles(res.role)
      this.tokenServ.getRole()
    }));
  }
  logout(): void {
    this.tokenServ.removeToken()
    this.tokenServ.removeTokenApi()
    this.adminService.addPermisosObservable([])
    this.router.navigate(['/login']);
  }
}
