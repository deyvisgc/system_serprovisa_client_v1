import { Component, OnInit } from '@angular/core';
import { Feed } from './feeds-data';
import { ProductoService } from 'src/app/component/service/producto.service';
import { map } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html'
})
export class FeedsComponent implements OnInit {

  feeds:Feed[];

  constructor(private producService: ProductoService, private router: Router) {
  }

  ngOnInit(): void {
    this.getLastProduct()
  }

  getLastProduct() {
    this.producService.getLastProduct().subscribe({
      next: (res: any) => {

       this.feeds =  res.map((res: any) => {
          return {
            id: res.id_user,
            class: 'bg-info',
            icon: 'fas fa-user',
            task: res.us_full_name,
            time: res.fech_regis
         }
        })
      },
      error: (err: any) => {

        console.log(err)
      },
    });
  }
  verProducto (id: number) {
    const obj = {
      id: id,
      type: 'users'
    }
    const navigationExtra: NavigationExtras = {state: obj}
    this.router.navigate(['system/component/list-product/'], navigationExtra)
  }
}
