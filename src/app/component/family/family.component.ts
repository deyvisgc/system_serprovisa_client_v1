import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalConfig, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { FamilyService } from '../service/family.service';
import { FamiliaRequest } from 'src/app/core/interface/family.request';
import { AdminService } from '../service/admin.service';
import {  PermisoConstante } from 'src/app/util/ModuloConstante';

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss'],
})
export class FamilyComponent {
  private modalService = inject(NgbModal);
  closeResult = '';
  filterValue = '';
  list: List;
  selectedCar: number;
  formForm: FormGroup;
  formFormUpdate: FormGroup;
  submitted = false;
  isLoading = false;
  totalRegistros = 0;
  totalRegistroPage = 0;
  limit = 10;
  offset = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  textSearch: string = '';
  errors: any[] = [];
  idFamilia: number;
  permisos: any[] = []
  isRegistrar: boolean = true
  isActualizar: boolean = true
  isEliminar: boolean = true
  constructor(
    private familyService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private adminService: AdminService,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
		config.keyboard = false;
    this.obtenerPermisos()
  }
  ngOnInit(): void {
    this.getFamily();
    this.inicializarFormulario();
    this.agregarFamilia();

  }

  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      familias: this.formBuilder.array([]),
    });
    this.formFormUpdate = this.formBuilder.group({
      descripcion_familia: ['', Validators.required],
      codigo_familia: ['', Validators.required],
    });
  }
  get familias() {
    return this.formForm.get('familias') as FormArray;
  }
  agregarFamilia() {
    const nuevaFamilia = this.formBuilder.group({
      descripcion_familia: ['', Validators.required],
      codigo_familia: ['', Validators.required],
    });
    this.familias.push(nuevaFamilia);
  }
  eliminarFamilia(index: number) {
    this.familias.removeAt(index);
  }
  guardar() {
    if (this.familias.length == 0) {
      this.totastService.error("Se requiere minimo 1 familia para registrar")
      return
    }
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    this.isLoading = true
    const datosFamilias = this.formForm.value.familias as FamiliaRequest[];
    this.familyService.register(datosFamilias).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message);
        this.formForm.reset();
        this.modalService.dismissAll();
        this.errors = [];
        this.isLoading = false
      },
      error: (err: any) => {
        if (err.statusCode !== 409) {
          this.totastService.error(err.error);
        } else {
          this.errors = err.message;

        }
        this.isLoading = false
      },
      complete: () => {
        this.submitted = false;
        this.getFamily();
      },
    });
  }
  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' })
  }
  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.BACKDROP_CLICK:
        this.familias.clear()
        this.modalService.dismissAll();
        this.errors = []
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  private getFamily() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.familyService.getAll(limit, offset, page).subscribe({
      next: (res: any) => {
        this.list = res;
        this.offset = res.offset;
        this.totalRegistros = res.totalRegistros;
        if (this.offset == 0) {
          this.totalRegistroPage = 10;
        } else {
          this.totalRegistroPage = res.offset + this.list?.registros.length;
        }
        this.totalPages = Math.ceil(this.totalRegistros / limit);
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  eliminar(id: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Seguro de Eliminar Esta Familia?',
        text: `¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.familyService.delete(id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message);
            },
            error: (err: any) => {
              this.totastService.error(err.error.error);
            },
            complete: () => {
              this.getFamily();
            },
          });
        }
      });
  }
  edit(model: any, id: number) {
    this.familyService.getById(id).subscribe({
      next: (res: any) => {
        this.formFormUpdate.patchValue({
          descripcion_familia: res.des_fam,
          codigo_familia: res.cod_fam,
        });
        this.idFamilia = res.id_fam;
        this.modalService.open(model);
      },
      error: (err: any) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoFamilia = 'F';
    // Obtén el FormGroup de la familia en el FormArray
    const familiaFormGroup = this.familias.at(index) as FormGroup;
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      codigoFamilia = `${codigoFamilia}${frase
        .map((p: any) => p.charAt(0))
        .join('')}`;
      // Actualiza el valor del control codigo_familia
      familiaFormGroup.get('codigo_familia')?.setValue(codigoFamilia);
    } else {
      codigoFamilia = `${codigoFamilia}${texto.substring(0, 2)}`;
      familiaFormGroup.get('codigo_familia')?.setValue(codigoFamilia);
    }
    familiaFormGroup.get('descripcion_familia')?.setValue(texto.toUpperCase());
  }
  get f() {
    return this.formFormUpdate;
  }
  update() {
    this.submitted = true;
    if (this.formFormUpdate.invalid) {
      return;
    }
    this.isLoading = true
    this.familyService
      .update(this.idFamilia, this.formFormUpdate.value)
      .subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formFormUpdate.reset();
          this.modalService.dismissAll();
          this.errors = [];
          this.isLoading = false
        },
        error: (err: any) => {
          this.totastService.error(err.error);
          this.isLoading = false
        },
        complete: () => {
          this.submitted = false;
          this.getFamily();
        },
      });
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoFamilia = 'F';
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate
        .get('codigo_familia')
        ?.setValue(
          `${codigoFamilia}${frase.map((p: any) => p.charAt(0)).join('')}`
        );
    } else {
      this.formFormUpdate
        .get('codigo_familia')
        ?.setValue(`${codigoFamilia}${texto.substring(0, 2)}`);
    }
    this.formFormUpdate.get('descripcion_familia')?.setValue(texto);
  }
  // exportarExcel () {
  //   this.familyService.descargarExcel().subscribe( {
  //     next: (res) => {
  //       const fileName = "familia" + "-" + new Date().getTime() + '.xlsx'
  //       this.commonService.descargarArchivos(res , fileName, 'application/vnd.ms-excel')
  //     },
  //     error: (err) => {
  //       this.totastService.error(err.error);
  //     }
  //   })
  // }
  // exportarPdf () {
  //   this.familyService.descargarPdf().subscribe( {
  //     next: (res) => {
  //       const fileName = "familia" + "-" + new Date().getTime() + '.pdf'
  //       this.commonService.descargarArchivos(res , fileName, 'application/pdf')
  //     },
  //     error: (err) => {
  //       this.totastService.error(err.error);
  //     }
  //   })
  // }
  obtenerPermisos() {
    this.adminService.datos$.subscribe(res => {
      if (res?.length > 0 ) {
        this.permisos = res?.filter((p: any) => p.modulo === PermisoConstante.MODULO_FAMILIA)
        this.isRegistrar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_AGREGAR)
        this.isActualizar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ACTUALIZAR)
        this.isEliminar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ELIMINAR)
      }
    });
  }
}
