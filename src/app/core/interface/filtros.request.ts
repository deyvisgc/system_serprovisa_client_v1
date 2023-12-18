import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export interface Filtros {
    fecha_ini: NgbDateStruct
    fecha_fin: NgbDateStruct
    famila:string
    linea:string
}
export interface FiltrosProducto {
  fecha_ini: NgbDateStruct
  fecha_fin: NgbDateStruct
  famila:string
  linea:string
  grupo: string
  user: string
}