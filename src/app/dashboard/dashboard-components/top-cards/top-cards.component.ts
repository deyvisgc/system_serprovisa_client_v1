import { Component, OnInit } from '@angular/core';
import {topcard,topcards} from './top-cards-data';
import { AdminService } from 'src/app/component/service/admin.service';
export interface listCount {
  totalFamila: number;
  totalLinea: number;
  totalGrupo: number;
  totalProducto: number;
}
@Component({
  selector: 'app-top-cards',
  templateUrl: './top-cards.component.html'
})
export class TopCardsComponent implements OnInit {

  topcards:topcard[];
  listCount: listCount = {
    totalFamila: 0,
    totalLinea: 0,
    totalGrupo: 0,
    totalProducto: 0,
  };
  constructor(
    private adminService: AdminService
  ) {
  }

  ngOnInit(): void {
    this.getCountTotal()
  }
  getCountTotal() {
    this.adminService.getCountDashboard().subscribe({
      next: (res: any) => {
        this.listCount.totalFamila = res?.total_familia;
        this.listCount.totalLinea = res?.total_linea;
        this.listCount.totalGrupo = res?.total_grupo;
        this.listCount.totalProducto = res?.total_producto;
        topcards.forEach((item, index) => {
          if (item.bgcolor === "success") topcards[index].total = this.listCount.totalFamila
          if (item.bgcolor === "danger") topcards[index].total = this.listCount.totalLinea
          if (item.bgcolor === "warning") topcards[index].total = this.listCount.totalGrupo
          if (item.bgcolor === "info") topcards[index].total = this.listCount.totalProducto
        })
        this.topcards=topcards;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
