import { Routes } from '@angular/router';
import {UserComponent } from './components/user/user.component';
import { LoginComponent } from './components/login/login.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { HomeComponent } from './components/home/home.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RestrablecerComponent } from './components/restrablecer/restrablecer.component';
import { ProductoComponent } from './components/producto/producto.component';
import { ConsultasComponent } from './components/consultas/consultas.component';
import { SurtirComponent } from './components/surtir/surtir.component';
import { DetallesProductoComponent } from './components/detalles-producto/detalles-producto.component';
import { ProductosPromocionComponent } from './productos-promocion/productos-promocion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MapaSitioComponent } from './components/mapa-sitio/mapa-sitio.component';
import { TerminosypriComponent } from './components/terminosypri/terminosypri.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ServerErrorComponent } from './components/server-error/server-error.component';
import { PaginaErrorComponent } from './components/pagina-error/pagina-error.component';
import { authGuard } from './guards/auth.guard';
import { AyudaComponent } from './components/ayuda/ayuda.component';
import { MiCuentaComponent } from './components/mi-cuenta/mi-cuenta.component';

export const routes: Routes = [
    {path: '', component: InicioComponent},
    {path:'users', component:UserComponent},
    {path:'login',component:LoginComponent},
    {path:'carrito/:codigoBarras', component: CarritoComponent},
    {path:'carrito',component:CarritoComponent, canActivate: [authGuard]},
    {path:'home', component:HomeComponent},
    {path:'proveedor', component:ProveedoresComponent},
    {path:'registro', component:RegistroComponent},
    {path:'restablecer', component:RestrablecerComponent},
    {path:'producto', component:ProductoComponent},
    {path:'consultas', component:ConsultasComponent},
    {path:'surtir', component:SurtirComponent},
    {path:'detalle-producto/:id', component:DetallesProductoComponent},
    {path:'promocion', component:ProductosPromocionComponent},
    {path: 'navbar', component:NavbarComponent},
    {path: 'mapa', component:MapaSitioComponent},
    {path: 'terminosypri', component:TerminosypriComponent},
    {path: 'serverError', component:ServerErrorComponent},
    { path: 'error-404', component: PaginaErrorComponent }, 
    {path: 'ayuda', component: AyudaComponent},
    {path: 'miCuenta', component: MiCuentaComponent, canActivate: [authGuard]},
  { path: '**', redirectTo: '/error-404' }
];
