import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-chocolate-products',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './chocolate-products.html',
  styleUrl: './chocolate-products.scss'
})
export class ChocolateProductsComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  pageTitle: string = 'منتجات الشوكولاتة';


   private readonly CHOCOLATE_CATEGORY_ID = 23;
  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // تحميل منتجات الشوكولاتة من API
    this.woocommerceService.getProductsByCategory(this.CHOCOLATE_CATEGORY_ID, { per_page: 50 }).subscribe({
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
