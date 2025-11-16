// payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
} )
export class PaymentService {

  private apiUrl = 'https://osus-alhalwa.com/wp-json/moyasar-api/v1/create-payment';

  constructor(private http: HttpClient ) {}

  /**
   * @param amount - المبلغ بالريال (سيتم تحويله في الخلفية)
   * @param description - وصف العملية
   */
  createPayment(amount: number, description: string): Observable<any> {
    // لا حاجة لتحويل المبلغ هنا، الكود الخلفي (PHP) سيقوم بذلك
    return this.http.post(this.apiUrl, { // تم تصحيح الرابط هنا
      amount: amount, // أرسل المبلغ بالريال كما هو
      description: description,
      callback_url: 'https://osus-alhalwa.vercel.app/payment-confirmation/:orderId' // رابط العودة بعد الدفع
    } );
  }
}
