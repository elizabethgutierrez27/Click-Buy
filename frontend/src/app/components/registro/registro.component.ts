import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var grecaptcha: {
  getResponse: () => string;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
  providers: [UsuarioService]
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6) ]],
      rol: ['Usuario', Validators.required] // Valor por defecto: 'Usuario'
    });
  }

  onSubmit() {
    // Obtener la respuesta del CAPTCHA
    const captchaResponse = grecaptcha.getResponse();
    console.log('Respuesta del CAPTCHA:', captchaResponse); // Depuración
  
    if (!captchaResponse) {
      alert('Por favor, completa el CAPTCHA.');
      return;
    }
  
    // Si el formulario es inválido, no enviar la solicitud
    if (this.registroForm.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }
  
    // Crear el objeto de datos para enviar
    const registroData = {
      nombre: this.registroForm.value.nombre,
      correo: this.registroForm.value.correo,
      contrasena: this.registroForm.value.contrasena,
      rol: this.registroForm.value.rol,
      'g-recaptcha-response': captchaResponse
    };
  
    console.log('Datos enviados al backend:', registroData); // Depuración
  
    // Enviar los datos al backend
    this.authService.register(registroData).subscribe({
      next: (response) => {
        alert('Registro exitoso. Por favor, inicia sesión.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert('Error en el registro: ' + error.error.message);
      }
    });
  }
}