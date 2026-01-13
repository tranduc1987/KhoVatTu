# Backend Kho Vật Tư

## Khởi chạy nhanh

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Biến môi trường

| Tên | Mô tả |
| --- | --- |
| `PORT` | Cổng backend (mặc định 4000) |
| `JWT_SECRET` | Khoá ký JWT |
| `CORS_ORIGIN` | Danh sách origin frontend, phân tách bằng dấu phẩy |

## Tài khoản mặc định

- Username: `admin`
- Password: `admin123`

## API chính

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/users` (admin/manager)
- `GET /api/auth/users`

Danh mục & vật tư:
- `GET/POST /api/catalog/categories`
- `GET/POST /api/catalog/suppliers`
- `GET/POST /api/catalog/warehouses`
- `GET/POST /api/catalog/products`
- `GET /api/catalog/inventory`

Phiếu nhập/xuất:
- `POST /api/warehouse/receipts`
- `POST /api/warehouse/receipts/:id/submit`
- `POST /api/warehouse/receipts/:id/approve`
- `POST /api/warehouse/issues`
- `POST /api/warehouse/issues/:id/submit`
- `POST /api/warehouse/issues/:id/approve`

Xuất file:
- `GET /api/warehouse/exports/products/excel`
- `GET /api/warehouse/exports/products/pdf`
- `GET /api/warehouse/exports/receipts/:id/excel`
- `GET /api/warehouse/exports/receipts/:id/pdf`
- `GET /api/warehouse/exports/issues/:id/excel`
- `GET /api/warehouse/exports/issues/:id/pdf`
