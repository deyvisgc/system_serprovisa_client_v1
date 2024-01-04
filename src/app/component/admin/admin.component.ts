import {
  Component,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from '../service/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core/service/notification.service';
import { List } from 'src/app/core/interface/list.';
import Swal from 'sweetalert2';
import { UserRequest } from 'src/app/core/interface/users.request';
import { ModulosRequest } from 'src/app/core/interface/modulos.request';

import { PermisoConstante } from 'src/app/util/ModuloConstante';
interface Role {
  id_role: number;
  ro_name: string;
}
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private modalService = inject(NgbModal);
  closeResult = '';
  filterValue = '';
  active = 1;
  role: Role[];
  list: List;
  selectedCar: number;
  signupForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  isLoading = false;
  totalRegistros = 0;
  totalRegistroPage = 0;
  limit = 10;
  offset = 0;
  currentPage: number = 1;
  title: string = 'Crear Usuario';
  totalPages: number = 1; // por ejemplo
  textSearch: string = '';
  idUser: number = 0;
  admin: UserRequest;
  permisosArray: ModulosRequest[];
  totalRegistrosAcomulado: number = 0
  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    config: NgbModalConfig
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.addPermisos();
  }
  ngOnInit(): void {
    this.getAdmin();
    this.getRol();
    this.getPermisos();
    this.signupForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(6),
        ],
      ],
      name: [null, [Validators.required]],
      id_rol: [null, [Validators.required]],
    });
  }
  open(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }
  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.BACKDROP_CLICK:
        this.idUser = 0;
        this.modalService.dismissAll();
        this.addPermisos();
        this.signupForm.reset();
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  private getRol() {
    this.adminService.getRol().subscribe({
      next: (res) => {
        this.role = res;
      },
      error: (err) => {
        this.totastService.error(err)
      },
    });
  }
  private getPermisos() {
    this.adminService.getPermisos().subscribe({
      next: (res) => {
        const permisos = res?.registros.map((r: any) => {
          return {
            id_permission: r.id_permission,
            permission_name: r.permission_name,
            checked: true,
          };
        });
        this.permisosArray.forEach((item, index) => {
          let permisosCopia = [...permisos];
          if (item.id !== PermisoConstante.MODULO_PRODUCTO) {
            permisosCopia = this.deleteElements(permisosCopia, 0)
            this.permisosArray[index].permisos = permisosCopia;
          } else if (item.id === PermisoConstante.MODULO_PRODUCTO) {
            const indexEliminar = permisos.findIndex(
              (i: any) => i.permission_name === 'ELIMINAR REGISTRO'
            );
            if (indexEliminar !== -1) {
              permisos.splice(indexEliminar, 1);
            }
            this.permisosArray[index].permisos = permisos;
          }
        });
      },
      error: (err) => {
        this.totastService.error(err)
      },
    });
  }
  private deleteElements(permisos: any[], modulo: number) {
    const indexPermisosAsignar = permisos.findIndex(
      (i: any) => i.permission_name === 'ASIGNAR PRODUCTOS'
    );

    if (indexPermisosAsignar !== -1) {
      permisos.splice(indexPermisosAsignar, 1);
    }

    const indexPermisosVer = permisos.findIndex(
      (i: any) => i.permission_name === 'DETALLE PRODUCTO'
    );
    
    if (indexPermisosVer !== -1) {
      permisos.splice(indexPermisosVer, 1);
    }
    return permisos
  }
  private getAdmin() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  get f() {
    return this.signupForm;
  }
  onSubmit() {
    this.submitted = true;
    if (this.idUser) this.signupForm.controls['password'].clearValidators();
    else
      this.signupForm.controls['password'].addValidators([
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(6),
      ]);
    if (this.signupForm.invalid) {
      return;
    } else {
      this.createAndUpdate(this.idUser);
    }
  }

  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.adminService.getAll(limit, offset, page).subscribe({
      next: (res) => {
        this.list = res;
        this.offset = res.offset;
        this.totalRegistros = res.totalRegistros;
        this.totalRegistroPage = res?.registros?.length;

        if (this.offset == 0) {
          this.totalRegistrosAcomulado = 10;
        } else {
          this.totalRegistrosAcomulado = +res?.offset + this.list?.registros.length;
        }
        this.totalPages = Math.ceil(this.totalRegistros / limit);
      },
      error: (err) => {
        this.totastService.error(err)
      },
    });
  }
  eliminar(users_id: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Seguro de Eliminar Este Usuario?',
        text: `¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.adminService.delete(users_id).subscribe({
            next: (res) => {
              this.totastService.success(res.message);
            },
            error: (err) => {
              if (err.statusCode === 409) {
                this.totastService.error(err.error);
              } else {
                this.totastService.error(err.message);
              }
            },
            complete: () => {
              this.getAdmin();
            },
          });
        }
      });
  }
  edit(model: any, id: number) {
    this.adminService.getUsersById(id).subscribe({
      next: (res) => {
        this.title = 'Actualizar Usuario';
        this.signupForm.patchValue({
          email: res.users.us_username,
          name: res.users.us_full_name,
          id_rol: res.users.role_idrole,
        });
        this.signupForm.controls['password'].clearValidators();
        this.modalService.open(model, { size: 'xl' });
        this.idUser = id;
        this.permisosArray = this.permisosArray.map((modulo) => {
          return {
            ...modulo,
            permisos: modulo.permisos.map((permiso) => {
              const encontrado = res.permisos.find(
                (per: any) =>
                  per.permission_id === permiso.id_permission &&
                  per.modulo === modulo.id
              );
              return {
                ...permiso,
                checked: !!encontrado,
              };
            }),
          };
        });
      },
      error: (err) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  createAndUpdate(idUser: number) {
    let request: UserRequest = {
      email: this.signupForm.controls['email'].value,
      name: this.signupForm.controls['name'].value,
      id_rol: this.signupForm.controls['id_rol'].value,
      modulo: this.permisosArray,
    };
    if (idUser === 0) {
      request.password = this.signupForm.controls['password'].value;
    }
    this.adminService.registerAndUpdate(idUser, request).subscribe({
      next: (res) => {
        this.totastService.success(res.message);
        this.signupForm.reset();
        this.modalService.dismissAll();
        this.addPermisos();
      },
      error: (err) => {
        if (err.statusCode !== 409) {
          this.totastService.error(err.error);
        } else {
          this.totastService.error(err.error);
        }
      },
      complete: () => {
        this.submitted = false;
        this.idUser = 0;
        this.getAdmin();
      },
    });
  }
  isChecked(event: any, num_modulo: number, permiso: any, i: number): void {
    const updatedPermisosArray = this.permisosArray.map((modulo) => {
      if (modulo.id === num_modulo) {
        const updatedPermisos = modulo.permisos.map((p) => {
          if (p.id_permission === permiso.id_permission) {
            return {
              ...p,
              checked: event.target.checked,
            };
          }
          return p;
        });

        // Actualizar solo el módulo específico
        return {
          ...modulo,
          permisos: updatedPermisos,
        };
      }
      return modulo;
    });
    this.permisosArray[i].permisos = updatedPermisosArray[i].permisos;
  }
  addPermisos() {
    this.getPermisos();
    this.permisosArray = [
      {
        id: 1,
        descripcion: 'Modulo Aministrador',
        permisos: [],
      },
      {
        id: 2,
        descripcion: 'Modulo Familia',
        permisos: [],
      },
      {
        id: 3,
        descripcion: 'Modulo Linea',
        permisos: [],
      },
      {
        id: 4,
        descripcion: 'Modulo Grupo',
        permisos: [],
      },
      {
        id: 5,
        descripcion: 'Modulo Producto',
        permisos: [],
      }
    ];
  }
}
