import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  @Input() isVisible: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'يرجى تعبئة جميع الحقول';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'كلمتا المرور غير متطابقتين';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        // افتراض: الـ backend يعيد المستخدم أو رسالة نجاح
        this.registerSuccess.emit();
        this.closeModal();
        // خيارياً نوجّه المستخدم لصفحة الملف الشخصي
        this.router.navigate(['/user-profile']);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.isLoading = false;
        // حاول نعرض رسالة مفهومة إن أمكن
       if (err?.error?.message) {
    this.errorMessage = err.error.message; // هتعرض "المستخدم موجود بالفعل" لو موجود
  } else {
    this.errorMessage = 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.';
  }
      }
    });
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeEvent.emit();
    this.resetForm();
  }

  openLogin(ev?: Event) {
    if (ev) ev.preventDefault();
    // إرسل حدث للأب لفتح مودال تسجيل الدخول بدل التسجيل — الأب يجب أن يرافق هذين المكونين
    this.closeModal();
    // يمكنك أيضاً إطلاق حدث مخصص لطلب فتح login من الأب
  }

  private resetForm() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.isLoading = false;
  }
}
