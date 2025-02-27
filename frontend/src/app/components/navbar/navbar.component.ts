import { Component, ElementRef, ViewChild, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Collapse } from 'bootstrap';
import { SearchService } from '../../services/search.service';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef; // Referencia al menú colapsable
  private bsCollapse: Collapse | null = null; // Instancia de Collapse
  showScrollUp = false;
  showScrollDown = true;
  searchResults: any[] = []; // Almacena los resultados de la búsqueda

  constructor(private router: Router, private searchService: SearchService) {}

  @HostListener("window:scroll", [])
  onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    this.showScrollUp = scrollY > 300;
    this.showScrollDown = scrollY < maxScroll - 100;
  }

  searchContent() {
    const searchTerm = this.searchInput.nativeElement.value.trim().toLowerCase();
    this.clearHighlights();

    if (searchTerm === "") {
      this.searchResults = []; // Limpiar resultados si el término está vacío
      return;
    }

    // Redireccionar según el término de búsqueda
    switch (searchTerm) {
      case 'productos':
        this.router.navigate(['/producto']);
        break;
      case 'carrito':
        this.router.navigate(['/carrito']);
        break;
      case 'promociones':
        this.router.navigate(['/promocion']);
        break;
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'registro':
        this.router.navigate(['/registro']);
        break;
      default:
        // Si no es una redirección, buscar productos en la base de datos
        this.searchService.searchProducts(searchTerm).subscribe(
          (results) => {
            if (results.length > 0) {
              this.searchResults = results; 
            } else {
              this.searchResults = []; 
              this.router.navigate(['/error-404']); 
            }
            this.searchInput.nativeElement.value = '';
          },
          (error) => {
            console.error('Error al buscar productos:', error);
            this.searchResults = []; 
            this.router.navigate(['/error-404']); 
            this.searchInput.nativeElement.value = '';
          }
        );
        // Resaltar el término en la página actual
        this.highlightSearchTerm(searchTerm);
        break;
        
    }
  }

  highlightSearchTerm(searchTerm: string) {
    const elements = document.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, span, div");
    let firstMatch: HTMLElement | null = null;

    elements.forEach((element) => {
      const text = element.innerHTML;
      const regex = new RegExp(`(${searchTerm})`, "gi");

      if (text.toLowerCase().includes(searchTerm)) {
        element.innerHTML = text.replace(regex, `<mark>$1</mark>`);
        
        if (!firstMatch) {
          firstMatch = element;
        }
      }
    });

    if (firstMatch) {
      (firstMatch as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  clearHighlights() {
    document.querySelectorAll("mark").forEach((mark) => {
      const parent = mark.parentNode!;
      parent.replaceChild(document.createTextNode(mark.textContent!), mark);
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // Método para cerrar el menú colapsable
  closeNavbar() {
    if (this.bsCollapse) {
      this.bsCollapse.hide(); // Ocultar el menú colapsable
    }
  }

  // Método para alternar el menú colapsable
  toggleNavbar() {
    if (!this.bsCollapse) {
      // Inicializar Collapse si no está inicializado
      this.bsCollapse = new Collapse(this.navbarCollapse.nativeElement, {
        toggle: false,
      });
    }
    this.bsCollapse.toggle(); // Alternar el menú colapsable
  }

  
}


