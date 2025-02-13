import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restrablecer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './restrablecer.component.html',
  styleUrl: './restrablecer.component.css',
  providers: [UsuarioService]
})
export class RestrablecerComponent {
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.resetForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const correo = this.resetForm.value.correo;
      this.authService.requestPasswordReset(correo).subscribe({
        next: () => {
          alert('Se ha enviado un correo para restablecer tu contraseña.');
        },
        error: (error) => {
          alert('Error al enviar el correo: ' + error.error.message);
        }
      });
    }
  }
}