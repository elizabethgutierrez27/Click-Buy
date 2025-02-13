import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuario'; 
  constructor(private http: HttpClient, private router: Router) {}

  login(correo: string, contrasena: string) {
    return this.http.post(`${this.apiUrl}/login`, { Correo: correo, Contrasena: contrasena });
  }

  requestPasswordReset(correo: string) {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { Correo: correo });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }


  register(nombre: string, correo: string, contrasena: string, rol: string) {
    return this.http.post(`${this.apiUrl}/registro`, { Nombre: nombre, Correo: correo, Contrasena: contrasena, Rol: rol });
  }

}
