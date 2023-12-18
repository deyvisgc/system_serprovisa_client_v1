import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../service/notification.service';
import { AuthService } from 'src/app/auth/service/auth.service';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService, private toastService: NotificationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {

            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
            }
            if (err.status === 403) {
                this.toastService.error("Session terminada vuelva a iniciar session")
                window.sessionStorage.clear
            }
            return throwError(err.error);
        }));
    }
}
