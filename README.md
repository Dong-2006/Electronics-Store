# ElectroHub - Website bán thiết bị điện tử

ElectroHub là project thương mại điện tử mức đồ án gồm frontend Next.js, backend Express.js, database MySQL qua Prisma ORM, xác thực NextAuth/JWT và phân quyền `USER`/`ADMIN`.

## Công nghệ sử dụng

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, NextAuth, Axios.
- Backend: Node.js, Express.js, TypeScript, Prisma ORM, bcryptjs, JWT, CORS, dotenv, Zod.
- Database: MySQL.

## Chức năng chính

- Khách hàng: đăng ký, đăng nhập, xem/tìm/lọc/sort sản phẩm, xem chi tiết, thông số kỹ thuật, giỏ hàng, checkout, lịch sử đơn hàng, wishlist, đánh giá sản phẩm đã mua, so sánh 2-3 sản phẩm.
- Admin: dashboard thống kê, quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, trạng thái đơn hàng, người dùng.
- Backend trả response JSON thống nhất:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Cấu trúc thư mục

```txt
electronics-store/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── prisma/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── README.md
```

## Cài đặt trên Windows

Yêu cầu: Node.js 18+, MySQL Server, npm.

1. Tạo database MySQL:

```sql
CREATE DATABASE electronics_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Cài backend:

```powershell
cd electronics-store\backend
npm install
copy .env.example .env
```

Sửa `backend\.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/electronics_store"
JWT_SECRET="your_jwt_secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

3. Chạy Prisma migrate và seed:

```powershell
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend chạy tại `http://localhost:5000`.

4. Cài frontend:

```powershell
cd ..\frontend
npm install
copy .env.example .env.local
npm run dev
```

Sửa `frontend\.env.local` nếu cần:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

Frontend chạy tại `http://localhost:3000`.

## Tài khoản mẫu

- Admin: `admin@gmail.com` / `123456`
- User: `user1@gmail.com` / `123456`
- User: `user2@gmail.com` / `123456`
- User: `user3@gmail.com` / `123456`

## API chính

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Products: `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- Categories: `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`
- Brands: `GET /api/brands`, `POST /api/brands`, `PUT /api/brands/:id`, `DELETE /api/brands/:id`
- Cart: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart/clear`
- Orders: `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`
- Admin orders: `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`
- Wishlist: `GET /api/wishlist`, `POST /api/wishlist/:productId`, `DELETE /api/wishlist/:productId`
- Reviews: `GET /api/products/:productId/reviews`, `POST /api/products/:productId/reviews`, `DELETE /api/reviews/:id`
- Dashboard: `GET /api/admin/dashboard/stats`, `GET /api/admin/dashboard/revenue`, `GET /api/admin/dashboard/best-selling-products`
- Users: `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`

## Ghi chú giao diện

Frontend dùng tone xanh dương, trắng, xám; header cố định, product card responsive, layout admin có sidebar. Vì repo chưa kèm screenshot, hãy chạy `npm run dev` ở frontend và truy cập:

- Trang chủ: `http://localhost:3000`
- Sản phẩm: `http://localhost:3000/products`
- Admin: `http://localhost:3000/admin/dashboard`

## Scripts

Backend:

```powershell
npm run dev
npm run build
npm start
npx prisma migrate dev
npx prisma db seed
```

Frontend:

```powershell
npm run dev
npm run build
npm start
```
