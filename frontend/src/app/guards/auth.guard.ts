import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
  const router = inject(Router); 

  if (authService.isAuthenticated()) {
    return true; // Permite el acceso a la ruta
  } else {
    router.navigate(['/login']); // Redirige al login si no está autenticado
    return false;
  }
};
