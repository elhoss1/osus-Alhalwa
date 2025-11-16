import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: Array<{ src: string; alt: string }> | undefined;
  categories: Array<{ id: number; name: string; slug: string }>;
  stock_status: string;
  stock_quantity: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string };
}

@Injectable({
  providedIn: 'root'
})
export class WoocommerceService {
  private apiUrl = 'https://osus-alhalwa.com/wp-json/wc/v3';

  // مفاتيح WooCommerce API
  private consumerKey = 'ck_1a2a7e1c3401902ed5216a743170e150e4b85ef7';
  private consumerSecret = 'cs_0077910305f833dd9abc9ec1334e44407b9ef853';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    });
  }

  /** 🛍️ المنتجات **/
  getProducts(params?: any): Observable<Product[]> {
    const queryParams = new URLSearchParams(params || {}).toString();
    return this.http.get<Product[]>(`${this.apiUrl}/products?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProductsByCategory(categoryId: number, params?: any): Observable<Product[]> {
    const queryParams = new URLSearchParams({
      ...params,
      category: categoryId.toString()
    }).toString();
    return this.http.get<Product[]>(`${this.apiUrl}/products?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 📂 الفئات **/
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/products/categories`, {
      headers: this.getAuthHeaders()
    });
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/products/categories/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 💳 طرق الدفع **/
  getPaymentGateways(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payment_gateways`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 🧾 الطلبات **/
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrders(params?: any): Observable<any[]> {
    const queryParams = new URLSearchParams(params || {}).toString();
    return this.http.get<any[]>(`${this.apiUrl}/orders?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers?email=${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  validateCoupon(code: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/coupons?code=${code}`,
    { headers: this.getAuthHeaders() }
  );
}

}
