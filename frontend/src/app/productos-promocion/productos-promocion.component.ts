import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ProductoService, Producto } from '../services/producto.service';
import { Disponible } from '../state-producto/disponible.estado';
import { CommonModule } from '@angular/common';
import { CategoriaService, Categoria } from '../services/categoria.service';

@Component({
  selector: 'app-productos-promocion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-promocion.component.html',
  styleUrl: './productos-promocion.component.css'
})
export class ProductosPromocionComponent implements OnInit {
  productos: Producto[] = [];
  productosEnPromocion: Producto[] = [];
  categorias: Categoria[] = [];
  productosPorCategoria: { [categoria: string]: Producto[] } = {};

  @HostListener("window:scroll", [])
        onScroll() {
          const scrollY = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          
          this.showScrollUp = scrollY > 300;
          this.showScrollDown = scrollY < maxScroll - 100;
    
        }
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;
    showScrollUp = false;
    showScrollDown = true;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    // Obtener las categorías y productos
    this.categoriaService.obtenerCategorias().subscribe((categorias) => {
      this.categorias = categorias;

      this.productoService.obtenerProductos().subscribe((productos) => {
        this.productos = productos;
        this.productoService.obtenerProductosPromocion().subscribe((productosPromocion) => {
          this.productosEnPromocion = productosPromocion;
          this.verificarPromociones();
          this.clasificarPorCategoria();
        });
      });
    });
  }

  verificarPromociones(): void {
    const estadoDisponible = new Disponible(this.productoService, this.productosEnPromocion);

    this.productos.forEach((producto) => {
      estadoDisponible.sugerirAccion(producto);
    });
  }

  clasificarPorCategoria(): void {
    this.productosEnPromocion.forEach((producto) => {
      const categoria = this.categorias.find(c => c.Id === producto.CategoriaId)?.Nombre || 'Sin Categoría';

      if (!this.productosPorCategoria[categoria]) {
        this.productosPorCategoria[categoria] = [];
      }
      this.productosPorCategoria[categoria].push(producto);
    });
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
}