import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { WoocommerceService } from '../../services/woocommerce';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-payment-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-confirmation.html',
  styleUrls: ['./payment-confirmation.scss'],
  standalone: true
})
export class PaymentConfirmationComponent implements OnInit {
  orderNumber: string = '';
  totalAmount: number = 0;
  orderItems: OrderItem[] = [];
  shippingDate: string = '';
  deliveryDate: string = '';
  deliveryDateFormatted: string = '';
  shippingAddress: string = '';
  phoneNumber: string = '';
  paymentMethod: string = '';
  orderCreatedDate: Date = new Date();

  constructor(private route: ActivatedRoute, private wooService: WoocommerceService) {}

  ngOnInit(): void {
    // نحاول نجيب orderId من params
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.fetchOrder(+orderId);
    } else {
      alert('لم يتم تحديد رقم الطلب');
    }
  }

  fetchOrder(orderId: number): void {
    this.wooService.getOrder(orderId).subscribe({
      next: (order) => {
        this.orderNumber = order.id.toString();
        this.totalAmount = parseFloat(order.total);

        // تحديد تاريخ إنشاء الطلب من البيانات المستقبلة
        this.orderCreatedDate = new Date(order.date_created || new Date());

        this.orderItems = order.line_items.map((item: any) => ({
          id: item.product_id,
          name: item.name,
          image: item.image?.src || '/images/placeholder.png',
          price: parseFloat(item.price),
          quantity: item.quantity
        }));

        this.shippingAddress = order.shipping?.address_1 || 'الرياض، السعودية';
        this.phoneNumber = order.billing?.phone || '+966 50 123 4567';
        this.paymentMethod = order.payment_method_title || 'دفع عند الاستلام';

        // حساب تواريخ الشحن والتوصيل
        this.calculateShippingDates();
      },
      error: (err: any) => {
        console.error('Error fetching order:', err);
        alert('حدث خطأ أثناء جلب بيانات الطلب');
      }
    });
  }

  /**
   * حساب تواريخ الشحن والتوصيل
   * موعد الشحن: اليوم (في نفس يوم الطلب)
   * موعد التوصيل: اليوم التالي (غداً)
   *
   * مثال:
   * - إذا كان الطلب يوم الأربعاء → سيتم الشحن يوم الأربعاء → التوصيل يوم الخميس
   * - إذا كان الطلب يوم الخميس → سيتم الشحن يوم الخميس → التوصيل يوم الجمعة
   */
  calculateShippingDates(): void {
    // تاريخ الطلب (الآن أو من البيانات المستقبلة)
    const orderDate = this.orderCreatedDate;

    // موعد الشحن: في نفس يوم الطلب (اليوم الحالي)
    const shippingDate = new Date(orderDate);
    // نضع الوقت في بداية اليوم (00:00:00) أو في وقت محدد
    shippingDate.setHours(9, 0, 0, 0); // الشحن في الساعة 9 صباحاً

    // موعد التوصيل: اليوم التالي (غداً)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 1); // إضافة يوم واحد فقط
    deliveryDate.setHours(14, 0, 0, 0); // التوصيل في الساعة 2 ظهراً

    // تنسيق التواريخ
    this.shippingDate = this.formatDate(shippingDate);
    this.deliveryDate = this.formatDate(deliveryDate);
    this.deliveryDateFormatted = this.formatDateWithTime(deliveryDate);
  }

  /**
   * تنسيق التاريخ بصيغة عربية جميلة
   * مثال: الاثنين، 28 أكتوبر 2025
   */
  formatDate(date: Date): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${days[date.getDay()]}، ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * تنسيق التاريخ مع الوقت
   * مثال: الاثنين، 28 أكتوبر 2025 - 02:30 م
   */
  formatDateWithTime(date: Date): string {
    const dateFormatted = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'م' : 'ص';
    return `${dateFormatted} - ${hours}:${minutes} ${period}`;
  }

  /**
   * حساب عدد الساعات المتبقية حتى التوصيل
   */
  getHoursUntilDelivery(): number {
    const now = new Date();
    const deliveryDate = new Date(this.orderCreatedDate);
    deliveryDate.setDate(this.orderCreatedDate.getDate() + 1);
    deliveryDate.setHours(14, 0, 0, 0);

    const diffMs = deliveryDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    return diffHours > 0 ? diffHours : 0;
  }

  /**
   * حساب عدد الأيام المتبقية حتى التوصيل
   */
  getDaysUntilDelivery(): number {
    const now = new Date();
    const deliveryDate = new Date(this.orderCreatedDate);
    deliveryDate.setDate(this.orderCreatedDate.getDate() + 1);
    deliveryDate.setHours(14, 0, 0, 0);

    const diffMs = deliveryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * تحميل الفاتورة (يمكن تطويره لاحقاً)
   */
  downloadReceipt(): void {
    // هنا يمكن إضافة منطق تحميل الفاتورة
    alert('سيتم تحميل الفاتورة قريباً');
  }

  /**
   * حساب إجمالي سعر المنتجات
   */
  getItemsTotal(): number {
    return this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
