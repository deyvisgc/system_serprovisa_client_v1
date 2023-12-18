import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProductoService } from 'src/app/component/service/producto.service';

@Component({
  selector: 'app-top-selling',
  templateUrl: './top-selling.component.html'
})
export class TopSellingComponent implements OnInit {
  totalRegistros = 0;
  totalRegistroPage = 0;
  limit = 10;
  offset = 0;
  currentPage: number = 1;
  sumaryProducts: any[] = [];
  totalPages: number = 1;
  constructor(private producService: ProductoService, private router: Router) { 
  }

  ngOnInit(): void {
    this.get(this.limit, this.offset, this.currentPage)
  }
  get(limit: number, offset: number, page: number) {
    this.producService.getCountProducts(limit, offset, page ).subscribe({
      next: (res: any) => {
        this.sumaryProducts = res?.registros
        this.offset = res.offset;
        this.totalRegistros = res.registros.length;
        this.totalPages = Math.ceil(this.totalRegistros / limit);
        console.log(this.totalPages)
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.get(event.limit, event.offset, this.currentPage);
  }
  get pages(): number[] {
    const pagesArray: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  changePage(newPage: number): void {
    if (
      newPage >= 1 &&
      newPage <= this.totalPages &&
      newPage !== this.currentPage
    ) {
      this.offset = (newPage - 1) * this.limit;
    }
    this.get(this.limit, this.offset, newPage);
  }
  verProducto (id: number) {
    const obj = {
      id: id,
      type: 'users'
    }
    const navigationExtra: NavigationExtras = {state: obj}
    this.router.navigate(['system/component/asignar-product/'], navigationExtra)
  }
}
