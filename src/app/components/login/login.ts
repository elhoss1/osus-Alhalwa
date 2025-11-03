import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Register } from "../register/register";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, Register],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'], // ✅ تم تصحيح styleUrl → styleUrls
})
export class LoginComponent {
toggleMode(arg0: boolean) {
throw new Error('Method not implemented.');
}
onRegister() {
throw new Error('Method not implemented.');
}
  @Input() isVisible: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
isRegisterMode: any;
fullName: any;
email: any;
registerPassword: any;
confirmPassword: any;
agreeToTerms: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'يرجى إدخال اسم المستخدم وكلمة المرور';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSuccess.emit();
        this.closeModal();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = 'فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى';
      }
    });
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeEvent.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.username = '';
    this.password = '';
    this.rememberMe = false;
    this.errorMessage = '';
  }


  showLoginModal = false;

toggleLoginModal() {
  this.showLoginModal = !this.showLoginModal;
}

closeLoginModal() {
  this.showLoginModal = false;
}

onLoginSuccess() {
  this.showLoginModal = false;
  console.log('✅ تم تسجيل الدخول بنجاح!');
}
}
