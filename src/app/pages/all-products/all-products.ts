import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-all-products',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss'
})
export class AllProductsComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  pageTitle: string = 'جميع المنتجات';

  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // يمكنك تحميل المنتجات من API هنا
    this.woocommerceService.getProducts({ per_page: 100 }).subscribe({
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
