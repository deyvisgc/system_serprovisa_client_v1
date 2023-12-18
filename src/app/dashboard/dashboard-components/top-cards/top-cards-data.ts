export interface topcard {
    bgcolor: string,
    icon: string,
    total: number,
    title: string
}

export const topcards: topcard[] = [

    {
        bgcolor: 'success',
        icon: 'fas fa-house',
        total: 0,
        title: 'Familias registradas'
    },
    {
        bgcolor: 'danger',
        icon: 'fas fa-clipboard-list',
        total: 0,
        title: 'Lineas registradas'
    },
    {
        bgcolor: 'warning',
        icon: 'fas fa-layer-group',
        total: 0,
        title: 'Grupos registradas'
    },
    {
        bgcolor: 'info',
        icon: 'fas fa-box', 
        total: 0,
        title: 'Productos registradas'
    },

] 