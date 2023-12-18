import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from 'src/app/util/token.service';

@Injectable()
export class JwtInterceptorInterceptor implements HttpInterceptor {

  constructor(private tokenServ: TokenService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.tokenServ.isLoggedInUser()) {
      request = request.clone({
        setHeaders: {
          authorization: `Bearer ${this.tokenServ.getToken()}`,
        }
      })
    }
    return next.handle(request);
}
}
