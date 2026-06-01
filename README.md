# ElectroHub - Electronics Marketplace

ElectroHub la project thuong mai dien tu thiet bi dien tu gom:

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, NextAuth, Axios.
- Backend: Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcryptjs, Zod.
- Database: MySQL.
- Roles: `USER`, `SELLER`, `ADMIN`.

## Tinh nang chinh

- Buyer: xem san pham, gio hang, checkout, lich su don hang, wishlist, review san pham da giao.
- Seller: dang ky shop, quan ly san pham, xem dashboard, xu ly sub-order theo shop, tao voucher.
- Admin: dashboard, quan ly user, duyet seller, duyet san pham seller, bulk upload CSV, gui notification.
- Marketplace v2: `SubOrder`, `Voucher`, `Notification` + SSE drawer, address book, public shop page, category cha-con, product `sold/rating`.

## Yeu cau local

- Node.js 18+.
- npm.
- MySQL Server dang chay local.
- Windows PowerShell nen dung `npm.cmd` va `npx.cmd` neu gap loi execution policy voi `npm`/`npx`.

## 1. Tao database MySQL

Dang nhap MySQL va tao database:

```sql
CREATE DATABASE electronics_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Neu muon lam moi hoan toan:

```sql
DROP DATABASE IF EXISTS electronics_store;
CREATE DATABASE electronics_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Cai backend

```powershell
cd E:\web_CNPM\electronics-store\backend
npm.cmd install
copy .env.example .env
```

Sua `backend\.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/electronics_store"
JWT_SECRET="your_jwt_secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

Chay migration, generate Prisma Client va seed du lieu mau:

```powershell
npx.cmd prisma migrate dev
npx.cmd prisma generate
npx.cmd prisma db seed
```

Chay backend:

```powershell
npm.cmd run dev
```

Backend chay tai:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/api/health
```

## 3. Cai frontend

Mo terminal PowerShell moi:

```powershell
cd E:\web_CNPM\electronics-store\frontend
npm.cmd install
copy .env.example .env.local
```

Sua `frontend\.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

Chay frontend:

```powershell
npm.cmd run dev
```

Frontend chay tai:

```txt
http://localhost:3000
```

## Tai khoan mau

Sau khi seed:

- **Admin**: `admin@gmail.com` / `123456`
- **Users**: `user1@gmail.com`, `user2@gmail.com`, `user3@gmail.com`, `user4@gmail.com` (Mật khẩu: `123456`)
- **Sellers** (Tất cả mật khẩu là `123456`, trạng thái `APPROVED`):
  - `seller1@gmail.com` (TechZone Store)
  - `applehub@gmail.com` (AppleHub Vietnam)
  - `samsungworld@gmail.com` (SamsungWorld)
  - `gaminggear@gmail.com` (Gaming Gear Pro)
  - `pcmaster@gmail.com` (PC Master)
  - `soundwave@gmail.com` (SoundWave Audio)
  - `displaypro@gmail.com` (Display Pro)
  - `accessoryhub@gmail.com` (Accessory Hub)
  - `laptopcenter@gmail.com` (Laptop Center)

## Route test nhanh

Public:

- `/`
- `/products`
- `/product/[id]`
- `/shop/techzone-store`
- `/cart`
- `/checkout`
- `/orders`
- `/wishlist`
- `/profile`

Seller:

- `/seller/apply`
- `/seller/status`
- `/seller/dashboard`
- `/seller/products`
- `/seller/orders`
- `/seller/vouchers`

Admin:

- `/admin/dashboard`
- `/admin/users`
- `/admin/sellers`
- `/admin/product-approvals`
- `/admin/products`
- `/admin/orders`
- `/admin/bulk-upload`
- `/admin/notifications`

## API chinh

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Catalog:

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/brands`
- `GET /api/shops/:slug`

Buyer:

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `GET /api/wishlist`
- `POST /api/wishlist/:productId`
- `DELETE /api/wishlist/:productId`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/addresses`
- `POST /api/users/addresses`
- `PUT /api/users/addresses/:id`
- `DELETE /api/users/addresses/:id`

Notifications:

- `GET /api/notifications`
- `GET /api/notifications/stream?token=JWT_TOKEN`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`

Seller:

- `POST /api/seller/apply`
- `GET /api/seller/me`
- `PUT /api/seller/profile`
- `GET /api/seller/dashboard`
- `GET /api/seller/products`
- `POST /api/seller/products`
- `PUT /api/seller/products/:id`
- `DELETE /api/seller/products/:id`
- `GET /api/seller/orders`
- `PUT /api/seller/orders/:id/status`
- `GET /api/seller/vouchers`
- `POST /api/seller/vouchers`
- `PUT /api/seller/vouchers/:id`
- `PATCH /api/seller/vouchers/:id/toggle`
- `DELETE /api/seller/vouchers/:id`

Admin:

- `GET /api/admin/dashboard/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/status`
- `GET /api/admin/sellers`
- `PUT /api/admin/sellers/:id/approve`
- `PUT /api/admin/sellers/:id/reject`
- `GET /api/admin/product-approvals`
- `PUT /api/admin/product-approvals/:id/approve`
- `PUT /api/admin/product-approvals/:id/reject`
- `GET /api/admin/products`
- `POST /api/admin/products/bulk`
- `GET /api/admin/bulk-upload/batches`
- `GET /api/admin/bulk-upload/batches/:id/errors`
- `POST /api/admin/notifications/broadcast`

## Bulk upload CSV

Admin vao `/admin/bulk-upload`, chon seller va upload CSV.

Header CSV ho tro cac cot:

```txt
title,slug,price,salePrice,manufacturer,inStock,categorySlug,description,mainImage,specs
```

Vi du:

```csv
title,slug,price,salePrice,manufacturer,inStock,categorySlug,description,mainImage,specs
Laptop ASUS Vivobook 15,laptop-asus-vivobook-15,15000000,13500000,ASUS,50,laptop,Laptop van phong,https://example.com/asus.jpg,"{""CPU"":""Intel i5"",""RAM"":""8GB""}"
```

## Lenh kiem tra

Backend:

```powershell
cd E:\web_CNPM\electronics-store\backend
npx.cmd prisma validate
npm.cmd run build
```

Frontend:

```powershell
cd E:\web_CNPM\electronics-store\frontend
npm.cmd run build
```

## Loi thuong gap

Neu PowerShell bao:

```txt
npm.ps1 cannot be loaded because running scripts is disabled
```

Dung:

```powershell
npm.cmd run dev
npx.cmd prisma migrate dev
```

Neu backend bao loi ket noi DB, kiem tra:

- MySQL da chay chua.
- `DATABASE_URL` dung user/password/database chua.
- Da chay `npx.cmd prisma migrate dev` chua.
