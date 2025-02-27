import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Obtiene una instancia del servicio de autenticación
  const router = inject(Router); // Obtiene una instancia del Router

  if (authService.isAuthenticated()) {
    return true; // Permite el acceso a la ruta
  } else {
    router.navigate(['/login']); // Redirige al login si no está autenticado
    return false; // Bloquea el acceso a la ruta
  }
};
