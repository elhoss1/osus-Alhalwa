import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponentMini } from "../../components/product-card copy/product-card";

@Component({
  selector: 'app-cake-products',
  imports: [CommonModule, ProductCardComponentMini],
  templateUrl: './mini-products.html',
  styleUrl: './mini-products.scss'
})
export class MiniOsusProduct implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  pageTitle: string = 'ميني أسس';


   private readonly CHOCOLATE_CATEGORY_ID = 44;
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
