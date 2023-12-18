import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }
   descargarArchivos(contenido: any, nombre: string, type: string) {
    const a = document.createElement("a");
    const archivo = new Blob([contenido], { type: type });
    const url = URL.createObjectURL(archivo);
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }
}
