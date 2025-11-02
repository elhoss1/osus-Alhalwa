# دليل البدء السريع - متجر أُسُس الحلوى

## الخطوات الأساسية للبدء

### 1. تثبيت المتطلبات (مرة واحدة فقط)

```bash
# تثبيت Node.js من https://nodejs.org
# ثم تثبيت Angular CLI
npm install -g @angular/cli
```

### 2. تثبيت حزم المشروع

```bash
cd osus-alhalwa-store
npm install
```

### 3. إضافة مفاتيح WooCommerce API

افتح الملف: `src/app/services/woocommerce.ts`

ابحث عن السطور:
```typescript
private consumerKey = 'YOUR_CONSUMER_KEY';
private consumerSecret = 'YOUR_CONSUMER_SECRET';
```

استبدل `YOUR_CONSUMER_KEY` و `YOUR_CONSUMER_SECRET` بمفاتيحك الفعلية.

### 4. تشغيل المشروع

```bash
ng serve
```

افتح المتصفح على: **http://localhost:4200**

---

## الحصول على مفاتيح WooCommerce API

1. سجل الدخول إلى WordPress Admin
2. اذهب إلى: **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. اضغط **Add Key**
4. املأ:
   - Description: `Angular Store`
   - User: اختر مستخدم Admin
   - Permissions: **Read/Write**
5. اضغط **Generate API Key**
6. انسخ **Consumer Key** و **Consumer Secret**

---

## إضافة معرفات الفئات

بعد إنشاء الفئات في WooCommerce، احصل على معرفاتها:

1. في WordPress، اذهب إلى: **Products** → **Categories**
2. اضغط على الفئة (مثل "كيك")
3. انظر إلى URL في المتصفح، ستجد: `tag_ID=XX`
4. الرقم `XX` هو معرف الفئة

### تحديث معرفات الفئات في الكود

افتح ملفات الصفحات وحدث المعرفات:

**مثال - ملف `src/app/pages/cake-products/cake-products.ts`:**

```typescript
loadProducts(): void {
  this.loading = true;
  const CAKE_CATEGORY_ID = 15; // ضع المعرف الفعلي هنا
  
  this.woocommerceService.getProductsByCategory(CAKE_CATEGORY_ID, { per_page: 20 }).subscribe({
    next: (products) => {
      this.products = products;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading products:', error);
      this.loading = false;
    }
  });
}
```

كرر نفس الخطوات لـ:
- `chocolate-products.ts` (معرف فئة الشوكولاتة)
- `sweets-products.ts` (معرف فئة الحلويات)

---

## تفعيل تحميل المنتجات

في كل ملف صفحة منتجات، قم بإزالة التعليق عن الكود:

**قبل:**
```typescript
// this.woocommerceService.getProducts({ per_page: 20 }).subscribe({
//   next: (products) => {
//     this.products = products;
//     this.loading = false;
//   },
//   error: (error) => {
//     console.error('Error loading products:', error);
//     this.loading = false;
//   }
// });
```

**بعد:**
```typescript
this.woocommerceService.getProducts({ per_page: 20 }).subscribe({
  next: (products) => {
    this.products = products;
    this.loading = false;
  },
  error: (error) => {
    console.error('Error loading products:', error);
    this.loading = false;
  }
});
```

---

## حل مشاكل CORS

إذا واجهت مشكلة CORS عند الاتصال بـ API:

### الحل 1: إضافة Headers في WordPress

أضف هذا الكود في ملف `functions.php` الخاص بالثيم:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);
```

### الحل 2: استخدام Plugin

ثبت plugin: **WP CORS** من WordPress.org

---

## بناء المشروع للإنتاج

```bash
ng build --configuration production
```

الملفات ستكون في: `dist/osus-alhalwa-store/browser`

---

## الأوامر المفيدة

```bash
# تشغيل المشروع
ng serve

# تشغيل على منفذ مخصص
ng serve --port 4500

# بناء المشروع
ng build

# بناء للإنتاج
ng build --configuration production

# إنشاء مكون جديد
ng generate component components/my-component

# إنشاء خدمة جديدة
ng generate service services/my-service
```

---

## نصائح مهمة

✅ **تأكد من**:
- وجود منتجات في WooCommerce
- إضافة صور للمنتجات
- إنشاء الفئات المطلوبة
- تفعيل WooCommerce REST API

❌ **تجنب**:
- رفع مفاتيح API إلى GitHub
- استخدام HTTP بدلاً من HTTPS في الإنتاج
- ترك الكود التجريبي في الإنتاج

---

**للمساعدة**: راجع ملف `README_AR.md` للتفاصيل الكاملة

