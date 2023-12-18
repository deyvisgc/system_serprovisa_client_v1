import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; 
import { AdminComponent } from './admin/admin.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreModule } from '../core/core.module';
import { FamilyComponent } from './family/family.component';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { GrupoComponent } from './grupo/grupo.component';
import { LineaComponent } from './linea/linea.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductoComponent } from './producto/producto.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsRoutes } from './component.routing';
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: 'linea',
    component: LineaComponent,
  },
  {
    path: 'grupo',
    component: GrupoComponent,
  },
  {
    path: 'asignar-product',
    component: ProductoComponent,
  },
  {
    path: 'family',
    component: FamilyComponent,
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // RouterModule.forChild(ComponentsRoutes),
    NgbTooltipModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CoreModule,
    NgbAlertModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule
  ],
  declarations: [
    AdminComponent,
    FamilyComponent,
    LineaComponent,
    GrupoComponent,
    ProductoComponent,
  ],
})
export class ComponentsModule {}
