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
  isNorthRiyadh = false;
  selectedArea: string | null = null;



  northRiyadhAreas: string[] = [
  'حي الفلاح',
  'حي الوادي',
  'حي الندى',
  'حي الربيع',
  'حي النفل',
  'حي الغدير',
  'حي الصحافة',
  'حي العقيق',
  'حي حطين',
  'حي الملقا',
  'حي الياسمين',
  'حي النرجس',
  'حي العارض',
  'حي القيروان',
  'حي بنبان',
  'حي الواحة',
  'حي صلاح الدين',
  'حي الورود',
  'حي الملك فهد',
  'حي المرسلات',
  'حي النزهة',
  'حي المغرزات',
  'حي الازدهار',
  'حي التعاون',
  'حي المصيف',
  'حي المروج'
];


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
  selectedTime: string | null = null;
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

  // قواعد الشحن
  if (
    this.orderData.billing.city === "شمال الرياض" ||
    this.orderData.billing.city === "الرياض" ||
    this.orderData.billing.city === "محافظة الدرعية"
  ) {
    this.shiping = 45;
  } else if (this.total >= 250) {
    this.shiping = 0;
  } else {
    this.shiping = 15;
  }

  this.orderData.line_items = this.cartItems.map(item => ({
    product_id: item.product.id,
    quantity: item.quantity
  }));
}


updateShipping() {
  const city = this.orderData.billing.city;

  if (city === "شمال الرياض" || city === "الرياض" || city === "محافظة الدرعية") {
    this.shiping = 45;
  } else {
    this.shiping = this.total >= 250 ? 0 : 15;
  }

  this.isNorthRiyadh = city === "شمال الرياض";

  if (this.isNorthRiyadh) {
    this.selectedTime = null;
  }

  this.applyCityDeliveryRules();

  if (!this.isNorthRiyadh) {
    this.selectedArea = null;
  }
}

  generateDays() {
  const daysNames = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const today = new Date();
  const result = [];

  for (let i = 1; i <= 14; i++) {
    let d = new Date();
    d.setDate(today.getDate() + i);

    const dayName = daysNames[d.getDay()];
    const isWednesday = dayName === "الخميس";

    result.push({
      dayName,
      dateText: d.toLocaleDateString("ar-EG",{ day:"2-digit", month:"2-digit" }),
      fullDate: d.toISOString().split("T")[0],
      disabled: dayName === "الثلاثاء", // ⛔ إقفال الثلاثاء
      isWednesday
    });
  }

  this.weekDays = result;
  this.applyCityDeliveryRules();
}


applyCityDeliveryRules() {
  this.weekDays = this.weekDays.map(day => {
    // إقفال الثلاثاء دائماً
    if (day.dayName === "الثلاثاء") {
      return { ...day, disabled: true };
    }

    // الرياض + شمال الرياض + محافظة الدرعية = الخميس فقط
    if (
      this.orderData.billing.city === "الرياض" ||
      this.orderData.billing.city === "شمال الرياض" ||
      this.orderData.billing.city === "محافظة الدرعية"
    ) {
      return {
        ...day,
        disabled: !day.isWednesday || day.dayName === "الثلاثاء"
      };
    }

    // باقي المدن مفتوحة (ما عدا الثلاثاء)
    return {
      ...day,
      disabled: false
    };
  });
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
  const isFormValid = !!(
    this.orderData.billing.first_name &&
    this.orderData.billing.phone &&
    this.orderData.billing.email &&
    this.orderData.billing.address_1 &&
    this.orderData.billing.city
  );

  // إذا كانت المدينة هي "شمال الرياض"، تأكد من اختيار الحي
  if (this.orderData.billing.city === 'شمال الرياض') {
    return isFormValid && !!this.selectedArea;
  }

  return isFormValid;
}

  /** إرسال الطلب */
submitOrder(): void {
    if (!this.validateForm()) {
        let alertMessage = 'يرجى ملء جميع الحقول المطلوبة.';
        if (this.orderData.billing.city === 'شمال الرياض' && !this.selectedArea) {
            alertMessage = 'عند اختيار شمال الرياض، يجب تحديد الحي.';
        }
        alert(alertMessage);
        return;
    }

    if (!this.selectedDay) {
        alert("من فضلك اختر يوم التوصيل.");
        return;
    }

    if (!this.selectedTime) {
        alert("من فضلك اختر وقت التوصيل.");
        return;
    }

    this.submitting = true;

    // دمج الحي مع العنوان الرئيسي
    let finalAddress = this.orderData.billing.address_1;
    if (this.isNorthRiyadh && this.selectedArea) {
        finalAddress = `الحي: ${this.selectedArea}, ${this.orderData.billing.address_1}`;
    }

    // تجهيز بيانات الطلب النهائية
    const finalOrderData = {
        ...this.orderData,
        billing: {
            ...this.orderData.billing,
            address_1: finalAddress // استخدام العنوان المدمج
        },
        shipping: {
            ...this.orderData.billing,
            address_1: finalAddress // استخدام العنوان المدمج في بيانات الشحن أيضًا
        },
        meta_data: [
            { key: 'delivery_day', value: `${this.selectedDay.dayName} - ${this.selectedDay.fullDate}` },
            { key: 'delivery_time', value: this.selectedTime }
        ],
        shipping_lines: [
            { method_id: 'flat_rate', method_title: 'الشحن الثابت', total: this.shiping.toString() }
        ]
    };

    // إضافة الحي كبيانات وصفية منفصلة لسهولة الفلترة في ووردبريس
    if (this.isNorthRiyadh && this.selectedArea) {
        finalOrderData.meta_data.push({ key: 'neighborhood', value: this.selectedArea });
    }

    const totalAmount = this.total + this.shiping - this.discountAmount;

    this.woocommerceService.createOrder(finalOrderData).subscribe({
        next: (order) => {
            this.cartService.clearCart();
            const orderId = order.id;

            // ... (بقية كود الدفع)
            this.paymentService.createPayment(
                totalAmount,
                `طلب جديد من اسس الحلوي
                رقم الطلب: ${orderId}`,
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
        error: (err) => {
            this.submitting = false;
            console.error('Error creating order:', err); // طباعة الخطأ في الكونسول للمساعدة في التصحيح
            alert('❌ حدث خطأ أثناء إنشاء الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى.');
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

  canSubmitOrder(): boolean {
  const city = this.orderData.billing.city;

  // شرط شمال الرياض والدرعية
  if (city === "شمال الرياض" || city === "محافظة الدرعية") {
    return this.total >= 250;
  }

  // باقي المدن
  return this.total >= 100;
}

}
