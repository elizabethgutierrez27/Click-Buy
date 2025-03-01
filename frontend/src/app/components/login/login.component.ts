import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

declare var grecaptcha: {
  getResponse: () => string;
  render: (container: string | HTMLElement, parameters: { sitekey: string }) => void;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [AuthService]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log('Formulario enviado'); // Depuración
    // Obtener la respuesta del CAPTCHA
    const captchaResponse = grecaptcha.getResponse();
    console.log('Respuesta del CAPTCHA:', captchaResponse); // Depuración

    if (!captchaResponse) {
      alert('Por favor, completa el CAPTCHA.');
      return;
    }

    // Si el formulario es inválido, no enviar la solicitud
    if (this.loginForm.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    // Crear el objeto de datos para enviar
    const loginData = {
      Correo: this.loginForm.value.correo,
      Contrasena: this.loginForm.value.contrasena,
      'g-recaptcha-response': captchaResponse
    };

    console.log('Datos enviados al backend:', loginData); // Depuración

    // Enviar los datos al backend
    this.authService.login(loginData.Correo, loginData.Contrasena, loginData['g-recaptcha-response']).subscribe(
      (result: any) => {
        console.log('Respuesta completa del servidor:', result); // Depuración
          if (result.token) {
            console.log('Token recibido del servidor:', result.token); // Depuración
            this.authService.setToken(result.token);
            console.log('Redirigiendo a /users'); // Depuración
            this.router.navigate(['/users']); // Redirige a /users
          } else {
            console.error('Error en el login:', result.message); // Depuración
            alert(result.message || 'Error al iniciar sesión');
          }
        },
        (error) => {
          console.error('Error completo:', error); // Depuración
          console.error('Mensaje de error:', error.message); // Depuración
          console.error('Estado del error:', error.status); // Depuración

          if (error.status === 500) {
            console.log('Redirigiendo a página de error 500'); // Depuración
            this.router.navigate(['/serverError']); // Redirige a la página de error 500
          } else {
            alert('Error al iniciar sesión, revisa tus credenciales');
          }
        }
      );
  }
}
