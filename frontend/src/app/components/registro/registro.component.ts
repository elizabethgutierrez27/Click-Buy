import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


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
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['Usuario', Validators.required] // Valor por defecto: 'Usuario'
    });
  }

  onSubmit() {
    if (this.registroForm.valid) {
      const { nombre, correo, contrasena, rol } = this.registroForm.value;
      this.authService.register(nombre, correo, contrasena, rol).subscribe({
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
}