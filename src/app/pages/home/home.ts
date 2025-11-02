import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  pageTitle: string = 'جميع المنتجات';
  selectedCategory: string = 'all';

  // 🔹 IDs الفعلية من WooCommerce
  private categoryIds: Record<string, number> = {
    all: 0,           // 0 = كل المنتجات
    cake: 34,
    chocolate: 32,
    sweets: 27,
    'mini-osus': 44,
    'Croissant': 21,
    'minicake': 33,
    'barChoclata': 28,
    'mamul': 45,

  };

  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.selectedCategory = 'cake';
  this.pageTitle = 'الكيك ';
  this.loadProducts('cake');
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.pageTitle =
      category === 'all'
        ? ' المنتجات'
        : category === 'cake'
        ? 'الكيك الفاخر'
        : category === 'chocolate'
        ? 'منتجات الشوكولاتة'
        : category === 'sweets'
        ? 'بقلاوة'
        : category === 'minicake'
        ? 'كيك ميني'
        : category === 'mamul'
        ? 'معمول '
        : category === 'barChoclata'
        ? 'بار شوكولاتة '
        : category === 'Croissant'
        ? 'الكرواسون'
        : 'ميني أُسُس';

    this.loadProducts(category);
  }

  loadProducts(category: string): void {
    this.loading = true;

    const categoryId = this.categoryIds[category];

    // لو category = all ⇒ نجيب كل المنتجات
    const request$ =
      categoryId === 0
        ? this.woocommerceService.getProducts({ per_page: 50 })
        : this.woocommerceService.getProductsByCategory(categoryId, { per_page: 50 });

    request$.subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }
}
