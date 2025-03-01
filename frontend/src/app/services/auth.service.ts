import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuario'; 
  constructor(private http: HttpClient, private router: Router) {}

  login(correo: string, contrasena: string, captchaResponse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { Correo: correo, Contrasena: contrasena, 'g-recaptcha-response': captchaResponse }).pipe(
      catchError((error) => {
        console.error('Error en el login:', error);
        return throwError(error);
      })
    );
  }


  requestPasswordReset(correo: string) {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { Correo: correo });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Método para cerrar sesión
  logout(): void {
    sessionStorage.removeItem('token'); // Eliminar el token del sessionStorage
    console.log('Token eliminado, redirigiendo al login...'); // Depuración
    this.router.navigate(['/login']).then((success) => {
      if (success) {
        console.log('Redirección al login exitosa.'); // Depuración
      } else {
        console.error('Error al redirigir al login.'); // Depuración
      }
    });
  }


  register(registroData: {
    nombre: string,
    correo: string,
    contrasena: string,
    rol: string,
    'g-recaptcha-response': string
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, registroData);
  }

  setToken(token: string): void {
    sessionStorage.setItem('token', token); // Guardar el token en sessionStorage
    console.log('Token guardado en sessionStorage:', token); // Depuración
  }

  // Método para obtener el token desde el localStorage
  getToken(): string | null {
    return sessionStorage.getItem('token'); // Obtener el token desde sessionStorage
  }

  getUsuario(): any {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Decodifica el token
        return {
          nombre: decodedToken.nombre,
          correo: decodedToken.correo,
          rol: decodedToken.rol,
        };
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

}
