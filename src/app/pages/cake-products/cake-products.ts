import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { Routes } from '@angular/router';


@Component({
  selector: 'app-cake-products',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './cake-products.html',
  styleUrl: './cake-products.scss'
})
export class CakeProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  pageTitle = 'منتجات الكيك';
  


  private readonly CAKE_CATEGORY_ID = 19;

  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.woocommerceService.getProductsByCategory(this.CAKE_CATEGORY_ID, { per_page: 20 })
      .subscribe({
        next: (data: Product[]) => {
          this.products = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.loading = false;
        }
      });
  }
}
