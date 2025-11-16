import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  shiping = 15;
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
    this.cartService.cart$.subscribe(() => {
      this.loadCart();
    });
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();

      // حساب إجمالي السلة بعد تحديث الكميات أو الحذف
    this.total = this.cartService.getTotal();

    // حساب الشحن بعد معرفة total
    this.shiping = this.total >= 250 ? 0 : 15;
  }

  getItemTotal(item: CartItem): number {
    const price = parseFloat(item.product.price) || 0;
    return price * item.quantity;
  }

  increaseQuantity(productId: number): void {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  updateQuantity(productId: number, event: any): void {
    const quantity = parseInt(event.target.value);
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: number): void {
    if (confirm('هل تريد حذف هذا المنتج من السلة؟')) {
      this.cartService.removeFromCart(productId);
    }
  }



}
