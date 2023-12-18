import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './component/pagination/pagination.component';
import { SearchPipe } from './pipe/search.pipe';


@NgModule({
  declarations: [PaginationComponent, SearchPipe],
  imports: [
    CommonModule,
  ],
  exports: [PaginationComponent, SearchPipe]
})
export class CoreModule { }
