import { Component, Input , Output , EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/woocommerce';
import { CartService } from '../../services/cart';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../services/favorites';


@Component({
  selector: 'app-product-favorites',
  imports: [CommonModule , RouterLink ],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'] // صححت هنا
})

export class ProductCardComponent1 {
  showToast = false;
  @Input() product!: Product;


  selectedProduct: any = null;
  currentZoom = 1.7;

  readonly zoomStep = 0.2; // مقدار التكبير في كل ضغطة
  readonly maxZoom = 3;    // أقصى حد للتكبير
  readonly minZoom = 1.7;    // أقل حد (الحجم الطبيعي)




  constructor(private cartService: CartService, private favoritesService: FavoritesService ) {}


  zoomIn(): void {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.zoomStep;
    }
  }


   isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.id);
  }


   toggleFavorite(): void {
    if (this.isFavorite()) {
      this.favoritesService.removeFromFavorites(this.product.id);
    } else {
      this.favoritesService.addToFavorites(this.product);
    }
  }


  zoomOut(): void {
    this.currentZoom = 1.6;
  }


  resetZoom(): void {
    this.currentZoom = 1;
  }


  openQuickView(product: any) {
    this.selectedProduct = product;
    document.body.style.overflow = 'hidden'; // لمنع التمرير
  }

  closeQuickView() {
    this.selectedProduct = null;
    document.body.style.overflow = 'auto';
  }



  addToCart(): void {
    if (this.product.stock_status === 'instock') {
      this.cartService.addToCart(this.product, 1);
      // alert('تم إضافة المنتج إلى السلة بنجاح!');


      this.showToast = true;

    // اخفاء الرسالة بعد 3 ثواني
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
    }



  }


  isLightboxOpen = false;


  openLightbox(): void {
    // لا تفتح الـ Lightbox إذا كان المستخدم يقوم بتكبير الصورة

      this.isLightboxOpen = true;
    }


  /**
   * دالة لإغلاق ال-Lightbox.
   */
 closeLightbox(): void {
    this.isLightboxOpen = false;
    // تأكد من إعادة تعيين حالة التقريب عند إغلاق النافذة
    setTimeout(() => {
      this.isLightboxZoomed = false;
      this.transformOrigin = 'center center';
    }, 300); // تأخير بسيط ليتزامن مع حركة الإخفاء
  }


isLightboxZoomed = false;

transformOrigin = 'center center';


toggleLightboxZoom(event: MouseEvent): void {
    // منع إغلاق الـ Lightbox عند الضغط على الصورة
    event.stopPropagation();

    if (this.isLightboxZoomed) {
      // إذا كانت الصورة مقربة، أعدها للحالة الطبيعية
      this.isLightboxZoomed = false;
    } else {
      // إذا لم تكن مقربة، قم بتقريبها
      const { clientX, clientY } = event;
      const { left, top, width, height } = (event.target as HTMLElement).getBoundingClientRect();

      // حساب مكان الضغطة كنسبة مئوية من أبعاد الصورة
      const x = ((clientX - left) / width) * 100;
      const y = ((clientY - top) / height) * 100;

      // تحديث نقطة الأصل للتقريب
      this.transformOrigin = `${x}% ${y}%`;
      this.isLightboxZoomed = true;
    }
  }
}
