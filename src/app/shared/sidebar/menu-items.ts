import { RouteInfo } from './sidebar.metadata';
const rolePublicAll = ["Super Admin", "Gerente OP", "Comercial"]
const rolePrivate = ["Super Admin", "Gerente OP"]
export const ROUTES: RouteInfo[] = [
 
  {
    path: '/system/dashboard',
    title: 'Dashboard',
    icon: 'fas fa-tachometer',  
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/admin',
    title: 'Administración',
    icon: 'fa-solid fa-users',
    class: '',
    extralink: false,
    role: rolePrivate,
    submenu: []
  },
  {
    path: '/system/component/family',
    title: 'Familia',
    icon: 'fas fa-house',
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/linea',
    title: 'Linea',
    icon: 'fas fa-clipboard-list',
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/grupo',
    title: 'Grupos',
    icon: 'fas fa-layer-group',
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/create-product',
    title: 'Creaciòn de Productos',
    icon: 'fas fa-layer-group',
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/list-product',
    title: 'Listado de Productos',
    icon: 'fas fa-box',
    class: '',
    extralink: false,
    role: rolePublicAll,
    submenu: []
  },
  {
    path: '/system/component/asignar-product',
    title: 'Cerrar Session',
    icon: 'fas fa-sign-out-alt',
    role: rolePublicAll,
    class: '',
    extralink: false,
    submenu: []
  }
];
