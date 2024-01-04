import { Component, OnInit } from '@angular/core';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import {RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from 'src/app/auth/service/auth.service';
import { TokenService } from 'src/app/util/token.service';
import { AdminService } from 'src/app/component/service/admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports:[RouterModule, CommonModule, NgIf],

templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems:RouteInfo[]=[];
  addExpandClass(element: string) {
    if (element === "Cerrar Session") {
      this.authService.logout()
    }
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private adminService: AdminService
  ) {
    const role = tokenService.getRole()
    const idRolAsignado = tokenService.decodeToken().role
    const roleAsig = role.find ( r => r.id_role == idRolAsignado)
    this.sidebarnavItems = ROUTES.filter(sidebarnavItem => sidebarnavItem.role.includes(roleAsig.ro_name))
  }
  ngOnInit() {
    this.getPermisos()
  }
  getPermisos() {
    const id = this.tokenService.decodeToken().id
    const role = this.tokenService.decodeToken().role
    if (role == 2) {
      this.adminService.getPermisosById(id).subscribe({
        next: (res) => {
          this.adminService.addPermisosObservable(res)
        },
        error: (err) => {
        }
      })
    } else {
      this.adminService.addPermisosObservable([])
    }
  }
}
