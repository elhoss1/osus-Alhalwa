import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WoocommerceService } from '../../services/woocommerce';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  date: Date;
  status: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
}

interface Address {
  id: number;
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  isDefault: boolean;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent implements OnInit {
  activeTab: 'orders' | 'profile' | 'addresses' = 'orders';
  showAddressModal = false;
  editingAddress: Address | null = null;

  userData: UserData = {
    id: 1,
    name: '',
    email: '',
    phone: '',
    birthdate: ''
  };

  orders: Order[] = [];
  addresses: Address[] = [];

  profileForm!: FormGroup;
  addressForm!: FormGroup;
  loadingOrders = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private wooService: WoocommerceService // ✅ ربط الخدمة فعليًا
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
    this.loadOrders();
  }

  /** 🧩 تهيئة النماذج */
  initializeForms(): void {
    this.profileForm = this.fb.group({
      name: [this.userData.name, [Validators.required, Validators.minLength(3)]],
      email: [this.userData.email, [Validators.required, Validators.email]],
      phone: [this.userData.phone, [Validators.required, Validators.pattern(/^05\d{8}$/)]],
      birthdate: [this.userData.birthdate]
    });

    this.addressForm = this.fb.group({
      title: ['', [Validators.required]],
      recipientName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
      city: ['', [Validators.required]],
      district: ['', [Validators.required]],
      street: ['', [Validators.required]],
      buildingNumber: ['', [Validators.required]],
      isDefault: [false]
    });
  }

  /** 👤 تحميل بيانات المستخدم (من WooCommerce) */
  loadUserData(): void {
    const email = 'test@example.com'; // يمكنك تغييره لإيميل المستخدم المسجل
    this.wooService.getCustomerByEmail(email).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const user = data[0];
          this.userData = {
            id: user.id,
            name: user.first_name + ' ' + user.last_name,
            email: user.email,
            phone: user.billing.phone,
            birthdate: ''
          };
          this.profileForm.patchValue(this.userData);
        }
      },
      error: err => console.error('حدث خطأ أثناء تحميل بيانات المستخدم:', err)
    });
  }

  /** 📦 تحميل الطلبات من WooCommerce */
  loadOrders(): void {
    this.loadingOrders = true;
    this.wooService.getOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data.map(order => ({
          id: order.id,
          date: new Date(order.date_created),
          status: order.status,
          total: parseFloat(order.total),
          items: order.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.image?.src || '/assets/images/default-product.jpg'
          })),
          shippingAddress: `${order.shipping.city}, ${order.shipping.address_1}`
        }));
        this.loadingOrders = false;
      },
      error: err => {
        console.error('خطأ في تحميل الطلبات:', err);
        this.loadingOrders = false;
      }
    });
  }

  /** 🔄 تحديث الملف الشخصي */
  updateProfile(): void {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      this.userData = { ...this.userData, ...updatedData };
      alert('✅ تم تحديث البيانات بنجاح!');
    }
  }

  /** 📋 إدارة العناوين */
  openAddAddressModal(): void {
    this.editingAddress = null;
    this.addressForm.reset({ isDefault: false });
    this.showAddressModal = true;
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      const addressData = this.addressForm.value;

      if (this.editingAddress) {
        const index = this.addresses.findIndex(a => a.id === this.editingAddress!.id);
        if (index !== -1) {
          this.addresses[index] = { ...this.addresses[index], ...addressData };
          if (addressData.isDefault) {
            this.addresses.forEach((addr, i) => {
              if (i !== index) addr.isDefault = false;
            });
          }
        }
        alert('✅ تم تحديث العنوان بنجاح!');
      } else {
        const newAddress: Address = {
          id: this.addresses.length + 1,
          ...addressData
        };
        if (addressData.isDefault) {
          this.addresses.forEach(addr => (addr.isDefault = false));
        }
        this.addresses.push(newAddress);
        alert('✅ تم إضافة العنوان بنجاح!');
      }

      this.closeAddressModal();
    }
  }

  editAddress(addressId: number): void {
    const address = this.addresses.find(a => a.id === addressId);
    if (address) {
      this.editingAddress = address;
      this.addressForm.patchValue(address);
      this.showAddressModal = true;
    }
  }

  deleteAddress(addressId: number): void {
    if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      this.addresses = this.addresses.filter(a => a.id !== addressId);
      alert('✅ تم حذف العنوان بنجاح!');
    }
  }

  setDefaultAddress(addressId: number): void {
    this.addresses.forEach(addr => (addr.isDefault = addr.id === addressId));
    alert('✅ تم تعيين العنوان كافتراضي!');
  }

  /** 🧭 التنقل وحالة الطلبات */
  setActiveTab(tab: 'orders' | 'profile' | 'addresses'): void {
    this.activeTab = tab;
  }

  getPendingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'قيد الانتظار',
      processing: 'قيد التجهيز',
      onhold: 'قيد المراجعة',
      completed: 'تم التوصيل',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    return status;
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);
  }

  logout(): void {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      this.router.navigate(['/']);
    }
  }
}
