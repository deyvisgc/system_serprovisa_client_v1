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
import { Filtros, FiltrosProducto } from 'src/app/core/interface/filtros.request';
import { TokenService } from 'src/app/util/token.service';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { ProductoService } from '../service/producto.service';
import { NavigationExtras, Router } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { PermisoConstante } from 'src/app/util/ModuloConstante';
import { CommonService } from 'src/app/core/service/common.service';
dayjs().format();
@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.scss']
})
export class CrearProductoComponent {
  private modalService = inject(NgbModal);
  today = inject(NgbCalendar).getToday();
  model: NgbDateStruct;
  closeResult = '';
  filterValue = '';
  list: List;
  linea: any[] = [];
  lineaFilters: any[] = [];
  grupoFilters: any[] = [];
  familia: any[] = [];
  selectedCar: number;
  formProducto: FormGroup;
  formProductoAll: FormGroup;
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
  lineaFilter: any[] = [];
  grupo: any[] = [];
  familiaFilters: any[] = [];
  responsables: any[] = [];
  formUpdateForm: FormGroup;
  idProducto = 0;
  totalProductoTemp: number = 0;
  codGrupoTemp: string = '';
  codigoProducts: any[] = [];
  url: any;
  isEliminarFirst = false
  isIndexFirst = 0

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
    this.getGrupo();
    this.getGrupoFilters()
    this.getFamilia()
    this.getLinea()
    this.inicializarFormulario();
  }
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.lineaFilters = res?.registros;
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
  inicializarFormulario() {
    this.formProducto = this.formBuilder.group({
      productos: this.formBuilder.array([]),
    });
    this.formProductoAll = this.formBuilder.group({
      productosAll: this.formBuilder.array([]),
    });
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
  guardar() {
    if (this.productosAll.length == 0) {
      this.totastService.error('Se requiere minimo 1 producto para registrar');
      return;
    }
    this.submitted = true;
    if (this.productosAll.length > 0) {
      if (this.formProductoAll.invalid) {
        return;
      }
      this.isLoading = true
      const producto = this.formProductoAll.value
        .productos as ProductoRequest[];

      this.productoService.registerMaivo(producto).subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formProductoAll.reset();
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
          this.getGrupo()
          this.productos.clear();
        },
      });
    }
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
  addCodigoProductoAll(event: any, index: number) {
    let codProducto = '';
    const productoFormGroup = this.productosAll.at(index) as FormGroup;
    let total_product = 0;
    if (index === 0) {
      total_product = event.total_product;
      total_product += 1;
    } else {
      const codigo = this.codigoProducts.find(
        (cod: any) => cod === event.cod_gru_final
      );
      if (codigo) {
        const productosFiltrados = this.productosAll.controls.find(
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
  get productos() {
    return this.formProducto.get('productos') as FormArray;
  }
  get productosAll() {
    return this.formProductoAll.get('productosAll') as FormArray;
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  addProductoAll() {
    if (this.productosAll.length > 2) {
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
    this.productosAll.push(nuevoProducto);
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
  eliminarProducto(index: number, ) {
    this.productos.removeAt(index);
    this.isEliminarFirst = true
    this.ajustarCorrelativos()
  }
  ajustarCorrelativos(): void {
    const productosArray = this.formProducto.get('productos') as FormArray;
    for (let i = 1; i < productosArray.length; i++) {
      const codProducto = productosArray?.at(i - 1)?.get('cod_product')?.value.split('-')
      const correlativoAnterior = parseInt(codProducto[3], 10);
      const correlativoActual = parseInt(productosArray?.at(i)?.get('cod_product')?.value.split('-')[3], 10);
      this.totalProducto = correlativoAnterior + 1
      if (correlativoActual > correlativoAnterior) {
        this.productos.at(i).patchValue({
          cod_product: `${codProducto[0]}-${codProducto[1]}-${codProducto[2]}-${(correlativoAnterior + 1).toString().padStart(3, '0')}`
        });
      }
    }
  }
  eliminarProductoAll(index: number) {
    this.productosAll.removeAt(index);
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
  getGrupoFilters() {
    this.grupoService.getAllFilters().subscribe({
      next: (res: any) => {
        this.grupoFilters = res?.registros;
      },
      error: (err: any) => {
        this.totastService.error(err)
      },
    });
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
              if (err.statusCode === 409) {
                this.totastService.error(err.error);
              } else {
                this.errors = err.message;
              }
            },
            complete: () => {
              this.getGrupo();
            },
          });
        }
      });
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
      grupo: "",
      user: "",
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
  

  guardarProducto() {
    this.submitted = true;
    if (this.productos.length == 0) {
      this.totastService.error('Se requiero minimo 1 producto para registrar');
      return;
    }
    if (this.formProducto.invalid) {
      return;
    }
    this.isLoading = true
    const producto = this.formProducto.value.productos as ProductoRequest[];

    this.productoService.register(producto).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message);
        this.formProducto.reset();
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
      ['system/component/list-product/'],
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
        const fileName = "producto" + "_" + new Date().getTime() + '.xlsx'
        this.commonService.descargarArchivos(res , fileName, 'application/vnd.ms-excel')
      },
      error: (err) => {
        this.totastService.error(err.error);
      }
    })
  }
  onSearchGrupo() {
    console.log(this.filtros)
    if (!this.filtros.grupo) {
      this.totastService.warning('Debe seleccionar un grupo');
      return;
    }
    this.getList(this.limit, this.offset, this.currentPage);
  }
}
