import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth';

interface Order {
  id: number;
  date: string;
  status: string;
  total: string;
  items_count: number;
}

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  activeTab: string = 'info';
  orders: Order[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.currentUserValue;
      this.loadOrders();
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  loadOrders(): void {
    // يمكن تحميل الطلبات من API هنا
    // this.woocommerceService.getOrders().subscribe(orders => {
    //   this.orders = orders;
    // });
    
    // بيانات تجريبية
    this.orders = [];
  }

  getOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'قيد الانتظار',
      'processing': 'قيد المعالجة',
      'completed': 'مكتمل',
      'cancelled': 'ملغي',
      'refunded': 'مسترد',
      'failed': 'فشل'
    };
    return statusMap[status] || status;
  }

  logout(): void {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  openLoginModal(): void {
    // يمكن فتح نافذة تسجيل الدخول هنا
    this.router.navigate(['/']);
  }
}
