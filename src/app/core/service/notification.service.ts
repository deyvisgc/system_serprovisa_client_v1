import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private notifierService: NotifierService) { }
   success (message:string) {
    this.notifierService.notify('success', message);
  }
   warning (message:string) {
    this.notifierService.notify('warning', message);
  }
   info (message:string) {
    this.notifierService.notify('info', message);
  }
   error (message:string) {
    this.notifierService.notify('error', message);
  }
}
