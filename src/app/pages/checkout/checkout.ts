import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { WoocommerceService } from '../../services/woocommerce';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  submitting: boolean = false;
  shiping = 15;
  paymentMethods: any[] = [];

  orderData = {
    payment_method: '',
    payment_method_title: '',
    set_paid: false,
    billing: {
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'SA',
      email: '',
      phone: ''
    },
    shipping: {
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'SA'
    },
    line_items: [] as any[],
    customer_note: ''
  };

  constructor(
    private cartService: CartService,
    private woocommerceService: WoocommerceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadPaymentMethods();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.total = this.cartService.getTotal();

    this.orderData.line_items = this.cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));
  }

  /** 🧭 تحميل طرق الدفع **/
  loadPaymentMethods(): void {
    this.woocommerceService.getPaymentGateways().subscribe({
      next: (methods) => {
        // نعرض فقط الطرق المفعّلة
        this.paymentMethods = methods.filter(m => m.enabled);
        if (this.paymentMethods.length > 0) {
          this.orderData.payment_method = this.paymentMethods[0].id;
          this.orderData.payment_method_title = this.paymentMethods[0].title;
        }
      },
      error: (err) => {
        console.error('خطأ في تحميل طرق الدفع:', err);
        // لو فشل، أضف ميسر يدويًا
        this.paymentMethods = [
          { id: 'mysr', title: 'الدفع أونلاين (ميسر)', description: 'ادفع بأمان عبر مدى أو فيزا' }
        ];
        this.orderData.payment_method = 'mysr';
        this.orderData.payment_method_title = 'الدفع أونلاين (ميسر)';
      }
    });
  }

  getItemTotal(item: CartItem): number {
    const price = parseFloat(item.product.price) || 0;
    return price * item.quantity;
  }

  /** 🧾 إرسال الطلب **/
  submitOrder(): void {
    if (!this.validateForm()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    this.submitting = true;
    this.orderData.shipping = { ...this.orderData.billing };
    
    const shippingTotal = this.shiping;
    const totalWithShipping = this.total + shippingTotal;

    const orderPayload = {
      ...this.orderData,
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'الشحن الثابت',
          total: shippingTotal.toString()
        }
      ],
      total: totalWithShipping.toString()
    };

    this.woocommerceService.createOrder(orderPayload).subscribe({
      next: (response) => {
        this.submitting = false;
        this.cartService.clearCart();
        console.log('Order Response:', response);

        // ✅ لو ميسر، وجدت رابط الدفع نوجهه مباشرة
          if (response.payment_url) {
          window.location.href = response.payment_url;
        } else {
          alert('تم إنشاء الطلب، لكن لم يتم العثور على رابط الدفع.');
          this.router.navigate(['/payment-confirmation', response.id]);
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error creating order:', error);
        alert('❌ حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى');
      }
    });
  }

  validateForm(): boolean {
    return !!(
      this.orderData.billing.first_name &&
      this.orderData.billing.phone &&
      this.orderData.billing.email &&
      this.orderData.billing.address_1 &&
      this.orderData.billing.city
    );
  }
}
