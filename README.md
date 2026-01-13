# Kho Vật Tư - VOSA Inventory Hub

Ứng dụng quản lý kho vật tư/thiết bị bao gồm **frontend React** và **backend Express + SQLite**.
Dự án hỗ trợ quản lý danh mục vật tư, nhà cung cấp, kho, tồn kho, phiếu nhập/xuất, xuất báo cáo Excel/PDF và phân quyền RBAC.

---

## 1. Tổng quan kiến trúc

- **Frontend**: Vite + React + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + SQLite + JWT + RBAC
- **CSDL**: SQLite (file cục bộ `server/data/khovattu.db`)

---

## 2. Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9

---

## 3. Cấu trúc thư mục chính

```
.
├── src/                # Frontend React
├── server/             # Backend Express
│   ├── db/             # Schema + seed
│   ├── routes/         # API routes
│   └── index.js        # Entry server
├── vite.config.ts      # Proxy cấu hình frontend -> backend
├── .env.example        # Biến môi trường frontend
└── server/.env.example # Biến môi trường backend
```

---

## 4. Cài đặt & chạy dự án (chi tiết)

### Bước 1: Cấu hình biến môi trường

**Frontend**
```bash
cp .env.example .env
```

**Backend**
```bash
cp server/.env.example server/.env
```

> Có thể chỉnh lại port, JWT_SECRET hoặc CORS_ORIGIN trong `.env` nếu cần.

---

### Bước 2: Cài dependency

```bash
# Frontend
npm install

# Backend
npm --prefix server install
```

---

### Bước 3: Chạy backend

```bash
cd server
npm run dev
```
Backend chạy mặc định tại: `http://localhost:4000`

---

### Bước 4: Chạy frontend

```bash
npm run dev
```
Frontend chạy mặc định tại: `http://localhost:8080`

---

### Bước 5 (Tuỳ chọn): Chạy đồng thời frontend + backend

```bash
npm run dev:all
```

---

## 5. Tài khoản mặc định

- **Username**: `admin`
- **Password**: `admin123`

---

## 6. API chính (Backend)

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/users`
- `GET /api/auth/users`

### Catalog
- `GET/POST /api/catalog/categories`
- `GET/POST /api/catalog/suppliers`
- `GET/POST /api/catalog/warehouses`
- `GET/POST /api/catalog/products`
- `GET /api/catalog/inventory`

### Workflow kho
- `POST /api/warehouse/receipts`
- `POST /api/warehouse/receipts/:id/submit`
- `POST /api/warehouse/receipts/:id/approve`
- `POST /api/warehouse/issues`
- `POST /api/warehouse/issues/:id/submit`
- `POST /api/warehouse/issues/:id/approve`

### Xuất báo cáo
- `GET /api/warehouse/exports/products/excel`
- `GET /api/warehouse/exports/products/pdf`
- `GET /api/warehouse/exports/receipts/:id/excel`
- `GET /api/warehouse/exports/receipts/:id/pdf`
- `GET /api/warehouse/exports/issues/:id/excel`
- `GET /api/warehouse/exports/issues/:id/pdf`

---

## 7. Phân quyền (RBAC)

- **admin**: toàn quyền
- **manager**: quản lý kho, phiếu, danh mục
- **staff**: chỉ xem dữ liệu

---

## 8. Ghi chú triển khai

- Dữ liệu SQLite nằm trong `server/data/` (đã được ignore trong `.gitignore`).
- Frontend gọi backend qua `/api` nhờ Vite proxy (`vite.config.ts`).
- CORS backend có thể giới hạn bằng biến `CORS_ORIGIN`.

---

## 9. Tài liệu bổ sung

- Backend README: `server/README.md`
- Schema DB: `server/db/schema.sql`
