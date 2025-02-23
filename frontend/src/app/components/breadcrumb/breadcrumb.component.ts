import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Componente de migas de pan inicializado'); // Verifica que el componente se inicialice

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe({
        next: (event: NavigationEnd) => {
          console.log('Evento NavigationEnd capturado:', event); // Verifica si el evento se está capturando
          console.log('URL actual:', event.url); // Verifica la URL actual
          this.breadcrumbs = this.createBreadcrumbs(event.url);
          console.log('Migas de pan generadas:', this.breadcrumbs); // Verifica las migas de pan generadas
        },
        error: (err) => {
          console.error('Error en la suscripción a router.events:', err); // Captura errores en la suscripción
        },
        complete: () => {
          console.log('Suscripción a router.events completada'); // Esto no debería ocurrir en este caso
        }
      });
  }

  private createBreadcrumbs(url: string): Array<{ label: string; url: string }> {
    console.log('Creando migas de pan para la URL:', url); // Verifica la URL que se está procesando
  
    const breadcrumbs = [];
    const urlWithoutParams = url.split('?')[0]; // Elimina los parámetros de consulta
    const segments = urlWithoutParams.split('/').filter((segment) => segment !== '');
  
    console.log('Segmentos de la URL:', segments); // Verifica los segmentos de la URL
  
    let currentUrl = '';
    for (const segment of segments) {
      currentUrl += `/${segment}`;
      breadcrumbs.push({
        label: this.formatLabel(segment),
        url: currentUrl,
      });
    }
  
    console.log('Migas de pan generadas internamente:', breadcrumbs); // Verifica las migas de pan antes de retornar
    return breadcrumbs;
  }

  private formatLabel(segment: string): string {
    const formattedLabel = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log('Formateando segmento:', segment, '->', formattedLabel); // Verifica el formateo de cada segmento
    return formattedLabel;
  }
}
