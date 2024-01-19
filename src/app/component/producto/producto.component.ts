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
  linea: any[] = [];
  familia: any[] = [];
  grupo: any[] = [];
  responsables: any[] = [];
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
  url: any;
  pageSizeOptions = [10, 25, 50, 100, "Todos"]; // Lista de opciones
  selectedPageSize: any = 10; // Valor inicial
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
  permisos: any[] = []
  isActualizar: boolean = true
  constructor(
    private lineaService: LineaService,
    private familaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private grupoService: GrupoService,
    private productoService: ProductoService,
    private adminService: AdminService,
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
  actualizarPaginacion(): void {
    this.limit = this.selectedPageSize
    if (this.selectedPageSize === "Todos") {
      console.log(this.selectedPageSize)
      this.limit = 999999999
    }
    this.getList(this.limit, this.offset, this.currentPage);
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
        this.modalService.dismissAll();
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  inicializarFormulario() {
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
        this.linea = res?.registros;
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
        this.familia = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
  }
  getGrupo() {
    this.grupoService.getAllFilters().subscribe({
      next: (res: any) => {
        this.grupo = res?.registros;
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
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
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
        this.isActualizar = this.permisos?.some(per => per.permission_id === PermisoConstante.PERMISO_ACTUALIZAR)
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
