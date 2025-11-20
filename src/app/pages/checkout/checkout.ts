import { Order } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { WoocommerceService } from '../../services/woocommerce';
import { PaymentService } from '../../services/payment-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
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

  couponCode: string = '';
  discountAmount: number = 0;
  appliedCoupon: any = null;

  weekDays: any[] = [];
  selectedDay: any = null;
  selectedTime: string = '';
  selectedDate: string = '';

  constructor(
    private cartService: CartService,
    private woocommerceService: WoocommerceService,
    private router: Router,
    private paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadPaymentMethods();
    this.generateDays();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.total = this.cartService.getTotal();
    this.shiping = this.total >= 250 ? 0 : 15;

    this.orderData.line_items = this.cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));
  }

  generateDays() {
    const daysNames = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
    const today = new Date();
    const result = [];

    for (let i = 1; i <= 14; i++) {
      let d = new Date();
      d.setDate(today.getDate() + i);

      result.push({
        dayName: daysNames[d.getDay()],
        dateText: d.toLocaleDateString("ar-EG",{ day:"2-digit", month:"2-digit" }),
        fullDate: d.toISOString().split("T")[0],
        disabled: false
      });
    }

    this.weekDays = result;
  }

  selectDay(item: any) {
    if (item.disabled) return;
    this.selectedDay = item;
    this.selectedDate = item.fullDate;   // ← إضافة التاريخ الصحيح
  }

  loadPaymentMethods(): void {
    this.woocommerceService.getPaymentGateways().subscribe({
      next: (methods) => {
        this.paymentMethods = methods.filter(m => m.enabled);
        if (this.paymentMethods.length > 0) {
          this.orderData.payment_method = this.paymentMethods[0].id;
          this.orderData.payment_method_title = this.paymentMethods[0].title;
        }
      },
      error: () => {
        this.paymentMethods = [
          { id: 'mysr', title: 'الدفع أونلاين (ميسر)', description: 'ادفع بأمان عبر مدى أو فيزا' }
        ];
        this.orderData.payment_method = 'mysr';
        this.orderData.payment_method_title = 'الدفع أونلاين (ميسر)';
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

  /** إرسال الطلب */
  submitOrder(): void {

    if (!this.validateForm()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!this.selectedDay) {
      alert("من فضلك اختر يوم التوصيل");
      return;
    }

    if (!this.selectedTime) {
      alert("من فضلك اختر وقت التوصيل");
      return;
    }

    const deliveryData = {
      date: this.selectedDate,
      time: this.selectedTime
    };

    this.submitting = true;
    this.orderData.shipping = { ...this.orderData.billing };

    const totalAmount = this.total + this.shiping;

    this.woocommerceService.createOrder({
      ...this.orderData,
      meta_data: [
        { key: 'delivery_day', value: this.selectedDay.dayName + " - " + this.selectedDay.fullDate },
        { key: 'delivery_time', value: this.selectedTime }
      ],
      shipping_lines: [
        { method_id: 'flat_rate', method_title: 'الشحن الثابت', total: this.shiping.toString() }
      ]
    }).subscribe({
      next: (Order) => {
        this.cartService.clearCart();

        const orderId = Order.id;

        this.paymentService.createPayment(
          totalAmount,
          `طلب جديد من المتجر رقم ${orderId}`,
          orderId
        ).subscribe({
          next: (res) => {
            if (res.success && res.payment_url) {
              window.location.href = res.payment_url;
            } else {
              alert('❌ حدث خطأ أثناء إنشاء رابط الدفع');
              this.submitting = false;
            }
          },
          error: (err) => {
            alert('❌ خطأ في الاتصال بخدمة الدفع');
            this.submitting = false;
          }
        });
      },
      error: () => {
        this.submitting = false;
        alert('❌ حدث خطأ أثناء إنشاء الطلب');
      }
    });
  }

  /** تطبيق كوبون */
  applyCoupon(): void {
    if (!this.couponCode) {
      alert('يرجى إدخال كود الخصم');
      return;
    }

    this.woocommerceService.validateCoupon(this.couponCode).subscribe({
      next: (coupon: any) => {
        if (!coupon || coupon.length === 0) {
          alert('❌ كود الخصم غير صالح');
          return;
        }

        this.appliedCoupon = coupon[0];
        if (this.appliedCoupon.discount_type === 'percent') {
          this.discountAmount = this.total * (this.appliedCoupon.amount / 100);
        } else {
          this.discountAmount = Number(this.appliedCoupon.amount);
        }
        alert('✔ تم تطبيق كود الخصم بنجاح');
      },
      error: () => {
        alert('❌ كود الخصم غير صالح');
      }
    });
  }

  getItemTotal(item: CartItem): number {
    const price = parseFloat(item.product.price) || 0;
    return price * item.quantity;
  }
}
