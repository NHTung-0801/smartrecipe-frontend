# Smart Recipe Frontend 🎨

Đây là giao diện người dùng (SPA - Single Page Application) của dự án **Smart Recipe & Grocery Platform**. Được thiết kế hướng tới trải nghiệm người dùng (UX) hiện đại, tốc độ cao và tối ưu hiển thị (Responsive).

## 🛠 Công nghệ Cốt lõi
- **Core**: ReactJS 18
- **Build Tool**: Vite (Cực nhanh, hỗ trợ HMR siêu việt)
- **Styling**: TailwindCSS v4 (Utility-first CSS)
- **API Client**: Axios (có interceptors cho JWT)
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand
- **Form Handling**: React Hook Form kết hợp Zod (Schema Validation)

## 📂 Cấu trúc Thư mục (Folder Structure)
Mã nguồn được thiết kế để dễ dàng mở rộng và bảo trì:
```text
src/
├── assets/       # Chứa ảnh, icons, fonts tĩnh
├── components/   # Các Component có thể tái sử dụng (UI, Layout, Specific features)
├── hooks/        # Custom React Hooks (vd: useAuth, useDebounce...)
├── pages/        # Các trang màn hình chính (Home, Login, RecipeDetail...)
├── services/     # Cấu hình gọi API (Axios instance, các file định nghĩa API endpoint)
├── store/        # Zustand stores quản lý Global State cục bộ
├── utils/        # Các hàm tiện ích (format ngày, tiền, tính toán dinh dưỡng)
├── App.jsx       # Component Root, cấu hình Router
└── main.jsx      # Entry point của React
```

## 🚀 Hướng dẫn Chạy (Run Locally)

### 1. Cài đặt thư viện (Dependencies)
Bạn cần cài đặt Node.js phiên bản 20 trở lên.
```bash
npm install
```

### 2. Khởi chạy Development Server
```bash
npm run dev
```
> Giao diện sẽ hiển thị ở địa chỉ `http://localhost:5173` (port mặc định của Vite). Mọi thay đổi code sẽ được tự động làm mới ngay lập tức (HMR).

### 3. Đóng gói sản phẩm (Production Build)
```bash
npm run build
```
Kết quả bản build tối ưu hóa sẽ được xuất ra thư mục `dist/`.

## 🐳 Docker Build
Frontend được đóng gói kèm với Nginx (thông qua file `nginx.conf`) để xử lý cơ chế routing của SPA (Client-side routing):
```bash
docker build -t smartrecipe-frontend .
docker run -p 3000:80 smartrecipe-frontend
```
> Web sẽ chạy ở port 3000 trên máy của bạn.
