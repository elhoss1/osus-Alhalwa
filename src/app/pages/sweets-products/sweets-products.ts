import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-sweets-products',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './sweets-products.html',
  styleUrl: './sweets-products.scss'
})
export class SweetsProductsComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  pageTitle: string = 'منتجات الحلويات';


  private readonly SWEETS_CATEGORY_ID = 27;

  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // تحميل منتجات الحلويات من API
    this.woocommerceService.getProductsByCategory(this.SWEETS_CATEGORY_ID, { per_page: 20 }).subscribe({
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
