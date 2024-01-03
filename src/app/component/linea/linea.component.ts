import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { LineaRequest } from 'src/app/core/interface/linea.request';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { LineaService } from '../service/linea.service';
import { FamilyService } from './../service/family.service';
import { AdminService } from '../service/admin.service';
import { PermisoConstante } from 'src/app/util/ModuloConstante';

@Component({
  selector: 'app-linea',
  templateUrl: './linea.component.html',
  styleUrls: ['./linea.component.scss'],
})
export class LineaComponent {
  private modalService = inject(NgbModal);
  closeResult = '';
  filterValue = '';
  list: List;
  familia: any[] = [];
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
  idLinea: number;
  isRegistrar: boolean = true
  isActualizar: boolean = true
  isEliminar: boolean = true
  permisos: any[] = []
  constructor(
    private lineaService: LineaService,
    private familiaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    config: NgbModalConfig,
    private adminService: AdminService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.obtenerPermisos()
  }
  ngOnInit(): void {
    this.getLinea();
    this.getFamilia();
    this.inicializarFormulario();
    this.agregarLinea();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      lineas: this.formBuilder.array([]),
    });
    this.formFormUpdate = this.formBuilder.group({
      des_line: ['', Validators.required],
      cod_line: ['', Validators.required],
      id_familia: [null, Validators.required],
    });
  }
  get lineas() {
    return this.formForm.get('lineas') as FormArray;
  }
  agregarLinea() {
    const nuevaFamilia = this.formBuilder.group({
      des_line: ['', Validators.required],
      cod_line: ['', Validators.required],
      id_familia: [null, Validators.required],
    });
    this.lineas.push(nuevaFamilia);
  }
  eliminarLinea(index: number) {
    this.lineas.removeAt(index);
  }
  guardar() {
    if (this.lineas.length == 0) {
      this.totastService.error('Se requiere minimo 1 linea para registrar');
      return;
    }
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    this.isLoading = true
    const datosLinea = this.formForm.value.lineas as LineaRequest[];
    this.lineaService.register(datosLinea).subscribe({
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
        this.getLinea();
      },
    });
  }
  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.BACKDROP_CLICK:
        this.lineas.clear();
        this.modalService.dismissAll();
        this.errors = [];
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  private getLinea() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.lineaService.getAll(limit, offset, page).subscribe({
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
  getFamilia() {
    this.familiaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.familia = res?.registros;
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
        title: 'Seguro de Eliminar Esta Linea?',
        text: `¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.lineaService.delete(id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message);
            },
            error: (err: any) => {
              if (err.statusCode === 409) {
                this.totastService.error(err.error);
              } else {
                this.totastService.error(err.message);
              }
            },
            complete: () => {
              this.getLinea();
            },
          });
        }
      });
  }
  edit(model: any, id: number) {
    this.lineaService.getById(id).subscribe({
      next: (res: any) => {
        this.formFormUpdate.patchValue({
          des_line: res.des_line,
          cod_line: res.cod_line,
          id_familia: res.family_id_fam,
        });
        this.idLinea = res.id_line;
        this.modalService.open(model, { size: 'lg' });
      },
      error: (err: any) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'L';
    // Obtén el FormGroup de la familia en el FormArray
    const familiaFormGroup = this.lineas.at(index) as FormGroup;
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      codigoLinea = `${codigoLinea}${frase
        .map((p: any) => p.charAt(0))
        .join('')}`;
      // Actualiza el valor del control cod_line
      familiaFormGroup.get('cod_line')?.setValue(codigoLinea);
    } else {
      codigoLinea = `${codigoLinea}${texto.substring(0, 2)}`;
      familiaFormGroup.get('cod_line')?.setValue(codigoLinea);
    }
    familiaFormGroup.get('des_line')?.setValue(texto.toUpperCase());
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
    this.lineaService
      .update(this.idLinea, this.formFormUpdate.value)
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
          this.getLinea();
        },
      });
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'L';
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate
        .get('cod_line')
        ?.setValue(
          `${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`
        );
    } else {
      this.formFormUpdate
        .get('cod_line')
        ?.setValue(`${codigoLinea}${texto.substring(0, 2)}`);
    }
    this.formFormUpdate.get('des_line')?.setValue(texto);
  }
  obtenerPermisos() {
    this.adminService.datos$.subscribe(res => {
      if (res?.length > 0 ) {
        this.permisos = res?.filter((p: any) => p.modulo === PermisoConstante.MODULO_LINEA)
        this.isRegistrar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_AGREGAR)
        this.isActualizar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ACTUALIZAR)
        this.isEliminar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ELIMINAR)
      }
    });
  }
}
