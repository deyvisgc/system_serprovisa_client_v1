import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ModalDismissReasons,
  NgbCalendar,
  NgbDateStruct,
  NgbModal,
  NgbModalConfig,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { GrupoRequest } from 'src/app/core/interface/grupo.request';
import { GrupoService } from '../service/grupo.service';
import { LineaService } from './../service/linea.service';
import { FamilyService } from '../service/family.service';
import * as dayjs from 'dayjs';
import { Filtros } from 'src/app/core/interface/filtros.request';
import { TokenService } from 'src/app/util/token.service';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { ProductoService } from '../service/producto.service';
import { NavigationExtras, Router } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { PermisoConstante } from 'src/app/util/ModuloConstante';
import { CommonService } from 'src/app/core/service/common.service';
dayjs().format();
@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss'],
})
export class GrupoComponent {
  private modalService = inject(NgbModal);
  today = inject(NgbCalendar).getToday();
  model: NgbDateStruct;
  closeResult = '';
  filterValue = '';
  list: List;
  linea: any[] = [];
  lineaFilters: any[] = [];
  familia: any[] = [];
  selectedCar: number;
  formForm: FormGroup;
  formFormUpdate: FormGroup;
  formFormProducto: FormGroup;
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
  idGrupo: number;
  idGrupoProducto: number = 0;
  isCollapsed = true;
  idLinea = 0;
  idFamilia = 0;
  codigoConjunto: string = '';
  totalProducto: number = 0;
  permisos: any[] = []
  isRegistrar: boolean = true
  isActualizar: boolean = true
  isEliminar: boolean = true
  isVerProductos: boolean = true
  isAsignarProductos: boolean = true
  filtros: Filtros = {
    fecha_ini: {
      year: dayjs().subtract(1, 'month').year(),
      month: dayjs().subtract(1, 'month').month() + 1, // Los meses en NgbDateStruct van de 1 a 12
      day: dayjs().date(),
    },
    fecha_fin: {
      year: dayjs().year(),
      month: dayjs().month() + 1,
      day: dayjs().date(),
    },
    famila: '',
    linea: '',
  };

  constructor(
    private lineaService: LineaService,
    private familaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private grupoService: GrupoService,
    private tokenService: TokenService,
    private productoService: ProductoService,
    private router: Router,
    config: NgbModalConfig,
    private adminService: AdminService,
    private commonService: CommonService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.obtenerPermisos()
  }
  ngOnInit(): void {
    this.getFamilia();
    this.getGrupo();
    this.getLinea();
    this.inicializarFormulario();
    this.agregarGrupo();
    //this.addProducto();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      grupos: this.formBuilder.array([]),
    });
    this.formFormProducto = this.formBuilder.group({
      productos: this.formBuilder.array([]),
    });
    this.formFormUpdate = this.formBuilder.group({
      des_gru: ['', Validators.required],
      cod_gru: ['', Validators.required],
      id_familia: [null, Validators.required],
      id_linea: [null, Validators.required],
    });
  }
  get grupos() {
    return this.formForm.get('grupos') as FormArray;
  }
  get productos() {
    return this.formFormProducto.get('productos') as FormArray;
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  agregarGrupo() {
    const nuevaFamilia = this.formBuilder.group({
      des_gru: ['', Validators.required],
      cod_gru: ['', Validators.required],
      id_familia: [null, Validators.required],
      id_linea: [null, Validators.required],
      des_fam: [''],
      des_line: [''],
    });
    this.grupos.push(nuevaFamilia);
  }
  addProducto() {
    if (this.productos.length > 9) {
      this.totastService.warning('Solo se permite agregar 10 productos');
      return;
    }
    this.totalProducto += 1;
    let codProducto = '';
    if (this.totalProducto < 10) {
      codProducto = `00${this.totalProducto}`;
    } else if (this.totalProducto < 99 && this.totalProducto > 9) {
      codProducto = `0${this.totalProducto}`;
    } else {
      codProducto = `${this.totalProducto}`;
    }
    const nuevoProducto = this.formBuilder.group({
      cod_product: [
        `${this.codigoConjunto}-${codProducto}`,
        Validators.required,
      ],
      name_product: ['', Validators.required],
      des_product: [null, Validators.required],
      id_grupo: [this.idGrupoProducto, Validators.required],
      id_user: [this.tokenService.decodeToken().id, Validators.required],
    });
    this.productos.push(nuevoProducto);
  }
  eliminarGrupo(index: number) {
    this.grupos.removeAt(index);
  }
  eliminarProducto(index: number) {
    this.productos.removeAt(index);
  }
  guardar() {
    if (this.grupos.length == 0) {
      this.totastService.error('Se requiero minimo 1 grupo para registrar');
      return;
    }
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    this.isLoading = true
    const datosGrupo = this.formForm.value.grupos as GrupoRequest[];
    this.grupoService.register(datosGrupo).subscribe({
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
        this.getGrupo();
      },
    });
  }
  open(content: TemplateRef<any>) {
    const opcionesModal: NgbModalOptions = {
      size: 'xl',
    };
    this.modalService.open(content, opcionesModal).result.then(
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
        this.productos.clear();
        this.grupos.clear();
        this.errors = [];
        this.modalService.dismissAll();
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  private getGrupo() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.grupoService.getAll(limit, offset, page, this.filtros).subscribe({
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
  getLineaByIdFamiliaCreate(event: any, index: number) {
    const grupoFormGroup = this.grupos.at(index) as FormGroup;
    grupoFormGroup.get('des_fam')?.setValue(event.des_fam);
    this.getLineByIdFamilia(event.id_fam);
  }
  getLineaByIdFamiliaUpdate(event: any) {
    this.getLineByIdFamilia(event.id_fam);
  }
  getLineByIdFamilia(id: number) {
    this.lineaService.getByIdFamilia(id).subscribe({
      next: (res: any) => {
        this.linea = res;
        this.formFormUpdate.patchValue({ id_linea: 0 });
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getFamilia() {
    this.familaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.familia = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.lineaFilters = res?.registros;
        this.linea = res?.registros;
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
        title: 'Seguro de Eliminar Este Grupo?',
        text: `¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.grupoService.delete(id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message);
            },
            error: (err: any) => {
              this.totastService.error(err.error.error);
            },
            complete: () => {
              this.getGrupo();
            },
          });
        }
      });
  }
  edit(model: any, id: number) {
    this.grupoService.getById(id).subscribe({
      next: (res: any) => {
        this.formFormUpdate.patchValue({
          des_gru: res.des_gru,
          cod_gru: res.cod_gru,
          id_linea: res.linea_id_line,
          id_familia: res.fam_id_familia,
        });
        this.idGrupo = id;
        this.modalService.open(model, { size: 'xl' });
      },
      error: (err: any) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'G';
    // Obtén el FormGroup de la familia en el FormArray
    const lineaFormGroup = this.grupos.at(index) as FormGroup;
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      codigoLinea = `${codigoLinea}${frase
        .map((p: any) => p.charAt(0))
        .join('')}`;
      // Actualiza el valor del control cod_gru
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    } else {
      codigoLinea = `${codigoLinea}${texto.substring(0, 2)}`;
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    }
    lineaFormGroup.get('des_gru')?.setValue(texto.toUpperCase());
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
    this.grupoService
      .update(this.idGrupo, this.formFormUpdate.value)
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
          this.getGrupo();
        },
      });
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'G';
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate
        .get('cod_gru')
        ?.setValue(
          `${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`
        );
    } else {
      this.formFormUpdate
        .get('cod_gru')
        ?.setValue(`${codigoLinea}${texto.substring(0, 2)}`);
    }
    this.formFormUpdate.get('des_gru')?.setValue(texto);
  }
  onSearchDate() {
    if (!this.filtros.fecha_ini) {
      this.totastService.warning('La fecha Inicio no debe estar vacio');
      return;
    }
    if (!this.filtros.fecha_fin) {
      this.totastService.warning('La fecha Fin no debe estar vacio');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onSearchFamily() {
    if (!this.filtros.famila) {
      this.totastService.warning('Debe seleccionar una familia a filtrar');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onSearchLine() {
    if (!this.filtros.linea) {
      this.totastService.warning('Debe seleccionar una linea a filtrar');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
  clearFilter() {
    this.filtros = {
      famila: '',
      linea: '',
      fecha_ini: {
        year: dayjs().subtract(1, 'month').year(),
        month: dayjs().subtract(1, 'month').month() + 1, // Los meses en NgbDateStruct van de 1 a 12
        day: dayjs().date(),
      },
      fecha_fin: {
        year: dayjs().year(),
        month: dayjs().month() + 1,
        day: dayjs().date(),
      },
    };
    this.getList(this.limit, this.offset, this.currentPage);
  }
  getGrupoLinea(event: any, index: number) {
    const lineaFormGroup = this.grupos.at(index) as FormGroup;
    lineaFormGroup.get('des_line')?.setValue(event.des_line);
  }
  guardarProducto() {
    this.submitted = true;
    if (this.productos.length == 0) {
      this.totastService.error('Se requiero minimo 1 producto para registrar');
      return;
    }
    if (this.formFormProducto.invalid) {
      return;
    }
    this.isLoading = true
    const producto = this.formFormProducto.value.productos as ProductoRequest[];

    this.productoService.register(producto).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message);
        this.formFormProducto.reset();
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
        this.getGrupo();
        this.productos.clear();
      },
    });
  }
  agregarProducto(model: any, item: any) {
    this.codigoConjunto = item.cod_gru_final;
    this.totalProducto = item.total_product;
    this.idGrupoProducto = item.id_grou;
    this.modalService.open(model, { size: 'xl' });
  }
  verProducto(id: number) {
    const obj = {
      id: id,
      type: 'group',
    };
    const navigationExtra: NavigationExtras = { state: obj };
    this.router.navigate(
      ['system/component/asignar-product/'],
      navigationExtra
    );
  }
  obtenerPermisos() {
    this.adminService.datos$.subscribe(res => {
      if (res?.length > 0 ) {
        this.permisos = res?.filter((p: any) => p.modulo === PermisoConstante.MODULO_GRUPO)
        this.isRegistrar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_AGREGAR)
        this.isActualizar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ACTUALIZAR)
        this.isEliminar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ELIMINAR)
        this.isAsignarProductos = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ASIGNAR_PRODUCTO)
        this.isVerProductos = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_VER_PRODUCTO)
      }
    });
  }
  exportarExcel () {
    this.grupoService.descargarExcel(this.filtros).subscribe( {
      next: (res) => {
        const fileName = "grupo" + "_" + new Date().getTime() + '.xlsx'
        this.commonService.descargarArchivos(res , fileName, 'application/vnd.ms-excel')
      },
      error: (err) => {
        this.totastService.error(err.error);
      }
    })
  }
  exportarPdf () {
    this.grupoService.descargarPdf(this.filtros).subscribe( {
      next: (res) => {
        const fileName = "grupo" + "_" + new Date().getTime() + '.pdf'
        this.commonService.descargarArchivos(res , fileName, 'application/pdf')
      },
      error: (err) => {
        this.totastService.error(err.error);
      }
    })
  }
}
