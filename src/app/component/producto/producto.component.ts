import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ModalDismissReasons,
  NgbCalendar,
  NgbDateStruct,
  NgbModal,
  NgbModalConfig,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import * as dayjs from 'dayjs';
import {
  Filtros,
  FiltrosProducto,
} from 'src/app/core/interface/filtros.request';
import { List } from 'src/app/core/interface/list.';
import { LineaService } from '../service/linea.service';
import { FamilyService } from '../service/family.service';
import { NotificationService } from 'src/app/core/service/notification.service';
import { GrupoService } from '../service/grupo.service';
import { ProductoService } from '../service/producto.service';
import { AdminService } from '../service/admin.service';
import { TokenService } from 'src/app/util/token.service';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { Router } from '@angular/router';
import { PermisoConstante } from 'src/app/util/ModuloConstante';
import { CommonService } from 'src/app/core/service/common.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {
  private modalService = inject(NgbModal);
  today = inject(NgbCalendar).getToday();
  model: NgbDateStruct;
  closeResult = '';
  filterValue = '';
  list: List;
  lineaFilter: any[] = [];
  linea: any[] = [];
  familia: any[] = [];
  grupo: any[] = [];
  lineaFilters: any[] = [];
  familiaFilters: any[] = [];
  grupoFilters: any[] = [];
  responsables: any[] = [];
  formFormProducto: FormGroup;
  formUpdateForm: FormGroup;
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
  idGrupoProducto: number = 0;
  isCollapsed = true;
  idProducto = 0;
  codigoConjunto: string = '';
  totalProducto: number = 0;
  totalProductoTemp: number = 0;
  codGrupoTemp: string = '';
  codigoProducts: any[] = [];
  url: any;
  filtros: FiltrosProducto = {
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
    grupo: '',
    user: '',
  };
  filtrosGrupo: Filtros = {
    fecha_ini: { year: 0, month: 0, day: 0 },
    fecha_fin: { year: 0, month: 0, day: 0 },
    famila: '',
    linea: '',
  };
  permisos: any[] = []
  isRegistrar: boolean = true
  isActualizar: boolean = true
  isEliminar: boolean = true
  constructor(
    private lineaService: LineaService,
    private familaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private grupoService: GrupoService,
    private productoService: ProductoService,
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router,
    config: NgbModalConfig,
    private commonService: CommonService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    const navigation = this.router.getCurrentNavigation();
    this.url =
      navigation && navigation.extras ? navigation.extras?.state : null;
    if (this.url) {
      if (this.url.type === 'users') this.filtros.user = this.url.id.toString();
      if (this.url.type === 'group')
        this.filtros.grupo = this.url.id.toString();
      this.filtros.fecha_ini = { year: 0, month: 0, day: 0 };
      this.filtros.fecha_fin = { year: 0, month: 0, day: 0 };
    }
    this.inicializarFormulario();
    this.obtenerPermisos()
  }
  ngOnInit(): void {
    this.getProducto();
    this.getLinea();
    this.getFamilia();
    this.getGrupo();
    this.getResponsable();
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
        this.modalService.dismissAll();
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  inicializarFormulario() {
    this.formFormProducto = this.formBuilder.group({
      productos: this.formBuilder.array([]),
    });
    this.formUpdateForm = this.formBuilder.group({
      name_product: ['', Validators.required],
      des_product: ['', Validators.required],
    });
  }
  get f() {
    return this.formUpdateForm;
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
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
  onSearchGrupo() {
    if (!this.filtros.grupo) {
      this.totastService.warning('Debe seleccionar un grupo');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onSearchResponsable() {
    if (!this.filtros.user) {
      this.totastService.warning('Debe seleccionar un responsable');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
  clearFilter() {
    this.filtros = {
      famila: '',
      linea: '',
      grupo: '',
      user: '',
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
  private getProducto() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.productoService.getAll(limit, offset, page, this.filtros).subscribe({
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
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.lineaFilter = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getFamilia() {
    this.familaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.familiaFilters = res?.registros;
        this.familia = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getGrupo() {
    this.grupoService.getAll(10000, 0, 1, this.filtrosGrupo).subscribe({
      next: (res: any) => {
        this.grupoFilters = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getResponsable() {
    this.adminService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.responsables = res?.registros.filter(
          (f: any) => f.ro_name !== 'Super Admin'
        );
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  edit(model: any, id: number) {
    this.productoService.getById(id).subscribe({
      next: (res: any) => {
        this.formUpdateForm.patchValue({
          name_product: res.name_product,
          des_product: res.des_product,
        });
        this.idProducto = res.id_prod;
        this.modalService.open(model);
      },
      error: (err: any) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  eliminar(id: number) {}
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  guardar() {
    if (this.productos.length == 0) {
      this.totastService.error('Se requiere minimo 1 producto para registrar');
      return;
    }
    this.submitted = true;
    if (this.productos.length > 0) {
      if (this.formFormProducto.invalid) {
        return;
      }
      this.isLoading = true
      const producto = this.formFormProducto.value
        .productos as ProductoRequest[];

      this.productoService.registerMaivo(producto).subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formFormProducto.reset();
          this.modalService.dismissAll();
          this.errors = [];
          this.codigoProducts = [];
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
          this.getProducto();
          this.productos.clear();
        },
      });
    }
  }
  get productos() {
    return this.formFormProducto.get('productos') as FormArray;
  }
  addProducto() {
    if (this.productos.length > 2) {
      this.totastService.warning('Solo se permite asignar 3 productos');
      return;
    }
    const nuevoProducto = this.formBuilder.group({
      familia: [null, Validators.required],
      line: [null, Validators.required],
      grupo: [null, Validators.required],
      cod_product: [null, Validators.required],
      name_product: ['', Validators.required],
      des_product: [null, Validators.required],
      id_grupo: [null, Validators.required],
      id_user: [this.tokenService.decodeToken().id, Validators.required],
    });
    this.productos.push(nuevoProducto);
  }
  eliminarProducto(index: number) {
    this.productos.removeAt(index);
  }
  getLineByIdFamilia(event: any) {
    this.lineaService.getByIdFamilia(event.id_fam).subscribe({
      next: (res: any) => {
        this.linea = res;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getGrupoByIdLinea(event: any) {
    this.grupoService.getByIdLinea(event.id_line).subscribe({
      next: (res: any) => {
        this.grupo = res;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  addCodigoProducto(event: any, index: number) {
    let codProducto = '';
    const productoFormGroup = this.productos.at(index) as FormGroup;
    let total_product = 0;
    if (index === 0) {
      total_product = event.total_product;
      total_product += 1;
    } else {
      const codigo = this.codigoProducts.find(
        (cod: any) => cod === event.cod_gru_final
      );
      if (codigo) {
        const productosFiltrados = this.productos.controls.find(
          (productoFormGroup: any) =>
            productoFormGroup.value.cod_product !== null &&
            productoFormGroup.value.cod_product.startsWith(codigo)
        );
        if (productosFiltrados) {
          const codigoSinNumeros =
            productosFiltrados.value.cod_product.split('-');
          total_product = parseInt(codigoSinNumeros[3], 10) + 1;
        }
      } else {
        total_product = event.total_product;
        total_product += 1;
      }
    }

    if (total_product < 10) {
      codProducto = `00${total_product}`;
    } else if (total_product < 99 && total_product > 9) {
      codProducto = `0${total_product}`;
    } else {
      codProducto = `${total_product}`;
    }
    this.totalProductoTemp = total_product;
    productoFormGroup
      .get('cod_product')
      ?.setValue(`${event.cod_gru_final}-${codProducto}`);
    productoFormGroup.get('id_grupo')?.setValue(event.id_grou);
    this.codigoProducts.push(event.cod_gru_final);
  }
  update() {
    this.submitted = true;
    if (this.formUpdateForm.invalid) {
      return;
    }
    this.isLoading = true
    this.productoService
      .update(this.idProducto, this.formUpdateForm.value)
      .subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formUpdateForm.reset();
          this.modalService.dismissAll();
          this.isLoading = false
        },
        error: (err: any) => {
          this.totastService.error(err.error);
        },
        complete: () => {
          this.submitted = false;
          this.isLoading = false
          this.getProducto();
        },
      });
  }
  obtenerPermisos() {
    this.adminService.datos$.subscribe(res => {
      if (res?.length > 0 ) {
        this.permisos = res?.filter((p: any) => p.modulo === PermisoConstante.MODULO_PRODUCTO)
        this.isRegistrar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_AGREGAR)
        this.isActualizar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ACTUALIZAR)
        // this.isEliminar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ELIMINAR)
      }
    });
  }
  exportarExcel () {
    this.productoService.descargarExcel(this.filtros).subscribe( {
      next: (res) => {
        const fileName = "productos" + "_" + new Date().getTime() + '.xlsx'
        this.commonService.descargarArchivos(res , fileName, 'application/vnd.ms-excel')
      },
      error: (err) => {
        this.totastService.error(err.error);
      }
    })
  }
  exportarPdf () {
    this.productoService.descargarPdf(this.filtros).subscribe( {
      next: (res) => {
        const fileName = "productos" + "_" + new Date().getTime() + '.pdf'
        this.commonService.descargarArchivos(res , fileName, 'application/pdf')
      },
      error: (err) => {
        this.totastService.error(err.error);
      }
    })
  }
}
