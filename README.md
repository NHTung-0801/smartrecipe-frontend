# 🍳 SmartRecipe — Frontend

> **React SPA** (Single Page Application) cho nền tảng quản lý công thức nấu ăn và đi chợ thông minh. Giao tiếp với [SmartRecipe Backend](../smartrecipe-backend/README.md) qua REST API, tích hợp trợ lý AI gợi ý công thức từ tủ nguyên liệu sẵn có.

---

## 📋 Mục lục

- [Tech Stack](#-tech-stack)
- [Kiến trúc ứng dụng](#-kiến-trúc-ứng-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hệ thống Routing](#-hệ-thống-routing)
- [Quản lý State](#-quản-lý-state)
- [Luồng xác thực (Auth Flow)](#-luồng-xác-thực-auth-flow)
- [Luồng Đi chợ thông minh](#-luồng-đi-chợ-thông-minh)
- [Hệ thống Design](#-hệ-thống-design)
- [Thiết lập & Chạy local](#-thiết-lập--chạy-local)
- [Biến môi trường](#-biến-môi-trường)
- [Scripts](#-scripts)

---

## 🛠 Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **UI Framework** | React | 19.2 |
| **Build Tool** | Vite | 8.2 |
| **Routing** | React Router DOM | 7.18 |
| **Server State** | TanStack Query (React Query) | 5.101 |
| **Client State** | Zustand | 5.0 |
| **HTTP Client** | Axios | 1.19 |
| **Form & Validation** | React Hook Form + Zod | 7.84 / 4.4 |
| **Styling** | CSS Modules + Tailwind CSS v4 | - |
| **Icons** | Lucide React | 1.28 |
| **Notifications** | React Toastify | 11.1 |
| **Export PDF** | html2pdf.js | 0.14 |
| **Hiệu ứng** | canvas-confetti | 1.9 |
| **Linter** | OxLint | 1.75 |
| **Testing** | Vitest + Testing Library + jsdom | 4.1 |

---

## 🏛 Kiến trúc ứng dụng

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │               React Router DOM                   │    │
│  │         Routing + ProtectedRoute guard           │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │                   Pages (13)                     │    │
│  │    Orchestrate components + trigger queries      │    │
│  └──────────┬──────────────────────────┬───────────┘    │
│             │                          │                  │
│  ┌──────────▼──────────┐  ┌───────────▼───────────┐    │
│  │  Components (30+)   │  │  TanStack Query Cache  │    │
│  │  UI + Business UI   │  │  staleTime: 5 phút     │    │
│  └──────────┬──────────┘  └───────────┬───────────┘    │
│             │                          │                  │
│  ┌──────────▼──────────┐  ┌───────────▼───────────┐    │
│  │  Zustand Auth Store │  │   Service Layer (9)    │    │
│  │  isAuthenticated    │  │   authService          │    │
│  │  user, tokens       │  │   recipeService        │    │
│  └─────────────────────┘  │   groceryService ...   │    │
│                            └───────────┬───────────┘    │
│                                        │                  │
│  ┌─────────────────────────────────────▼───────────┐    │
│  │                  api.js (Axios Instance)          │    │
│  │   Request Interceptor: auto-attach JWT           │    │
│  │   Response Interceptor: auto-refresh token       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────▼───────────────────────────────┐
│              SmartRecipe Backend (Spring Boot)            │
│                    localhost:8080                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc dự án

```
smartrecipe-frontend/
├── public/
│
├── src/
│   │
│   ├── main.jsx                   # Entry point: mount React app
│   ├── App.jsx                    # Router, QueryClient, layout cấp cao
│   │
│   ├── pages/                     # 13 trang ứng với 13 route
│   │   ├── LoginPage.jsx          # Đăng nhập
│   │   ├── RegisterPage.jsx       # Đăng ký
│   │   ├── HomePage.jsx           # Feed công thức + tìm kiếm + AI gợi ý
│   │   ├── MyRecipesPage.jsx      # Công thức của tôi (quản lý CRUD)
│   │   ├── RecipeFormPage.jsx     # Tạo / Chỉnh sửa công thức (form phức tạp)
│   │   ├── RecipeDetailPage.jsx   # Xem chi tiết công thức, bình luận, like
│   │   ├── EditProfilePage.jsx    # Chỉnh sửa hồ sơ cá nhân, đổi avatar
│   │   ├── UserProfilePage.jsx    # Xem profile người dùng khác, follow
│   │   ├── PantryPage.jsx         # Tủ nguyên liệu (nhóm theo 9 kệ)
│   │   ├── GroceryPage.jsx        # Danh sách đi chợ (tạo, mua, hoàn thành)
│   │   ├── GroceryHistoryPage.jsx # Lịch sử danh sách đi chợ đã hoàn thành
│   │   ├── CookingJournalPage.jsx # Nhật ký nấu ăn
│   │   └── JournalDetailPage.jsx  # Chi tiết một lần nấu
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.jsx             # Thanh điều hướng chính
│   │   ├── RecipeCard.jsx         # Card hiển thị công thức trong feed
│   │   ├── FollowButton.jsx       # Nút theo dõi / bỏ theo dõi
│   │   │
│   │   ├── layout/
│   │   │   └── AppLayout.jsx      # Wrapper layout: Navbar + main content
│   │   │
│   │   ├── recipe/                # Components cho công thức
│   │   │   ├── AddJournalModal.jsx    # Modal ghi nhật ký nấu ăn
│   │   │   ├── CookingMode.jsx        # Chế độ nấu ăn step-by-step
│   │   │   ├── QuickFilterChips.jsx   # Bộ lọc nhanh (tag, độ khó...)
│   │   │   ├── SearchBar.jsx          # Thanh tìm kiếm công thức
│   │   │   └── ShareRecipeModal.jsx   # Modal chia sẻ công thức
│   │   │
│   │   ├── pantry/                # Components cho tủ nguyên liệu
│   │   │   ├── PantryGrid.jsx         # Grid nhóm nguyên liệu theo kệ (dynamic)
│   │   │   ├── PantryItemCard.jsx     # Card 1 nguyên liệu trong tủ
│   │   │   ├── PantryDetailModal.jsx  # Modal xem + chỉnh sửa nguyên liệu
│   │   │   ├── AddPantryItemModal.jsx # Modal thêm nguyên liệu vào tủ
│   │   │   ├── ExpiryAlertBanner.jsx  # Banner cảnh báo sắp hết hạn
│   │   │   └── PantrySummaryBar.jsx   # Thanh tóm tắt số lượng kệ/nguyên liệu
│   │   │
│   │   ├── grocery/               # Components cho đi chợ
│   │   │   ├── AisleGroupHeader.jsx   # Header kệ hàng (icon động theo tên kệ)
│   │   │   ├── GenerateListModal.jsx  # Modal tạo danh sách từ công thức + AI
│   │   │   ├── ShoppingModeView.jsx   # Chế độ đi chợ thực tế (tick mua)
│   │   │   ├── AddGroceryItemModal.jsx # Modal thêm item thủ công
│   │   │   ├── GroceryItemRow.jsx     # Hàng 1 item trong danh sách
│   │   │   ├── HistoryDetailModal.jsx # Modal xem lại danh sách cũ
│   │   │   └── CompleteSuccessModal.jsx # Modal chúc mừng hoàn thành
│   │   │
│   │   ├── comment/               # Components bình luận
│   │   │
│   │   ├── effects/               # Visual effects (animations)
│   │   │
│   │   └── ui/                    # Atomic UI components dùng chung
│   │       ├── ConfirmModal.jsx       # Modal xác nhận (Delete, Reset...)
│   │       ├── IngredientAutocomplete.jsx # Tìm kiếm nguyên liệu có gợi ý
│   │       └── UnitAutocomplete.jsx   # Dropdown đơn vị có gợi ý thông minh
│   │
│   ├── services/                  # API Service Layer (Axios calls)
│   │   ├── api.js                 # Axios instance + interceptors JWT auto-refresh
│   │   ├── authService.js         # register, login, refreshToken
│   │   ├── recipeService.js       # CRUD công thức, search, like, export
│   │   ├── ingredientService.js   # search, getByAisle, createQuick
│   │   ├── pantryService.js       # getMyPantry, add, update, delete
│   │   ├── groceryService.js      # CRUD grocery lists, complete, export
│   │   ├── commentService.js      # CRUD bình luận
│   │   ├── journalService.js      # CRUD nhật ký nấu ăn
│   │   └── userService.js         # getProfile, updateProfile, follow
│   │
│   ├── store/                     # Zustand Global State
│   │   ├── authStore.js           # Auth state schema
│   │   └── useAuthStore.js        # Hook: user, isAuthenticated, login/logout
│   │
│   └── styles/                    # Design System
│       ├── tokens.css             # CSS custom properties (màu sắc, spacing)
│       ├── animations.css         # Keyframe animations dùng chung
│       ├── effects.module.css     # Visual effects (glassmorphism, blur...)
│       ├── components/            # Styles cho shared components
│       ├── layout/                # Styles cho AppLayout, Navbar
│       └── pages/                 # CSS Modules cho từng trang (10 modules)
│
├── .env.example                   # Template biến môi trường
├── vite.config.js                 # Vite + React plugin configuration
└── package.json
```

---

## 🗺 Hệ thống Routing

Toàn bộ route được bảo vệ bởi `ProtectedRoute` — redirect về `/login` nếu chưa xác thực.

| Path | Page | Mô tả |
|---|---|---|
| `/login` | `LoginPage` | 🔓 Public |
| `/register` | `RegisterPage` | 🔓 Public |
| `/` | `HomePage` | Feed công thức cộng đồng + AI gợi ý |
| `/recipes` | `MyRecipesPage` | Quản lý công thức cá nhân |
| `/recipes/new` | `RecipeFormPage` | Soạn công thức mới |
| `/recipes/:id` | `RecipeDetailPage` | Xem chi tiết công thức |
| `/recipes/:id/edit` | `RecipeFormPage` | Chỉnh sửa công thức (reuse form) |
| `/users/:id` | `UserProfilePage` | Hồ sơ người dùng + Follow |
| `/profile` | `EditProfilePage` | Chỉnh sửa thông tin cá nhân |
| `/pantry` | `PantryPage` | Tủ nguyên liệu (nhóm theo 9 kệ) |
| `/grocery` | `GroceryPage` | Danh sách đi chợ hiện tại |
| `/grocery/history` | `GroceryHistoryPage` | Lịch sử đi chợ |
| `/journal` | `CookingJournalPage` | Nhật ký nấu ăn |
| `/journal/:id` | `JournalDetailPage` | Chi tiết một lần nấu |
| `/inventory` | — | Redirect → `/pantry` |

---

## 🗃 Quản lý State

Ứng dụng dùng **hai tầng state** theo nguyên tắc phân tách trách nhiệm:

```
┌─────────────────────────────────────────────────────────┐
│           TanStack Query (Server State)                  │
│                                                          │
│  Quản lý toàn bộ dữ liệu đến từ API:                   │
│  · Fetch tự động khi component mount                    │
│  · Cache kết quả 5 phút (staleTime)                    │
│  · Background refetch khi window focus lại              │
│  · Tự động retry 1 lần nếu lỗi                         │
│  · Invalidate cache khi mutation thành công             │
│                                                          │
│  useQuery(['recipes'])  → danh sách công thức           │
│  useQuery(['pantry'])   → nguyên liệu trong tủ          │
│  useMutation(createRecipe) → tạo + invalidate cache     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               Zustand (Client State)                     │
│                                                          │
│  Chỉ quản lý Auth state (persist sang localStorage):    │
│  · user: { id, username, email, role, avatarUrl }       │
│  · isAuthenticated: boolean                             │
│  · accessToken, refreshToken                            │
│  · login(userData) / logout()                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Luồng xác thực (Auth Flow)

```
                     ┌─────────────────┐
                     │    LoginPage     │
                     └────────┬────────┘
                              │ POST /auth/login
                              ▼
                    ┌──────────────────┐
                    │  authService.js  │
                    └────────┬─────────┘
                             │ Nhận { accessToken, refreshToken, user }
                             ▼
                    ┌──────────────────┐
                    │  useAuthStore    │   → Persist vào localStorage
                    │  .login(data)    │     (Zustand persist middleware)
                    └────────┬─────────┘
                             │ Navigate → "/"
                             ▼
                    ┌──────────────────────────────┐
                    │   api.js — Request Interceptor│
                    │   Tự động attach JWT token    │
                    │   vào mọi request             │
                    └────────────┬──────────────────┘
                                 │
                    ┌────────────▼──────────────────┐
                    │  api.js — Response Interceptor │
                    │  Nếu 401/403:                  │
                    │  1. POST /auth/refresh         │
                    │  2. Lưu accessToken mới        │
                    │  3. Retry request gốc          │
                    │  Nếu refresh thất bại:         │
                    │  → logout() + redirect /login  │
                    └───────────────────────────────-┘
```

---

## 🛒 Luồng Đi chợ thông minh

```
User mở GroceryPage
        │
        ▼ Nhấn "Tạo danh sách mới"
[GenerateListModal]
        │
        ├── Chọn công thức + số phần ăn
        │         │
        │    POST /grocery/lists/{id}/recipes
        │    → Backend tính: tổng nguyên liệu cần
        │                  - lượng đã có trong pantry
        │                  = lượng cần mua (final_to_buy)
        │                  + nhóm theo kệ hàng (aisle_id)
        │
        ├── Hoặc: AI gợi ý công thức từ tủ lạnh
        │         │
        │    GET /ai/suggest/pantry (Gemini API)
        │    → Gợi ý từ nguyên liệu sắp hết hạn
        │
        ▼
[GroceryPage - Items nhóm theo 9 kệ]
  AisleGroupHeader + GroceryItemRow
        │
        ▼ Nhấn "Bắt đầu đi chợ"
[ShoppingModeView]  ← Full-screen mode
  Tick từng item khi mua ✓
  Progress bar theo từng kệ
        │
        ▼ POST /grocery/lists/{id}/complete
  Backend: pantry.quantity += item.final_to_buy
           grocery_list.status = COMPLETED
        │
        ▼
[CompleteSuccessModal] 🎉 confetti
  Tủ lạnh tự động được cập nhật
```

---

## 🎨 Hệ thống Design

### Design Tokens (`tokens.css`)
Màu sắc, spacing, border-radius được định nghĩa là CSS Custom Properties:

```css
:root {
  --color-primary: ...;
  --color-surface: ...;
  --radius-card: ...;
}
```

### Styling Strategy

| Loại | Cách style |
|---|---|
| Pages | CSS Module riêng (`PageName.module.css`) |
| Shared Components | CSS Module hoặc Tailwind inline |
| Keyframe Animations | `animations.css` (dùng chung) |
| Visual Effects | `effects.module.css` (glassmorphism, blur) |
| Design Tokens | `tokens.css` (CSS custom properties) |

### Smart Icon Matching — `AisleGroupHeader` & `PantryGrid`
Icon kệ hàng dùng **token matching theo từ** thay vì so khớp chuỗi cứng. Lý do: tên kệ trong DB có thể thay đổi qua API admin, chỉ cần đổi một chữ là mất icon nếu dùng `includes()` thông thường. Bên cạnh đó, chuỗi con `"cá"` nằm trong `"Các"` nên cần tách từ trước:

```javascript
// Tách từ đúng với tiếng Việt (không dùng \b — chỉ hiểu ASCII)
const words = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

// Kiểm tra theo TỪ, không theo chuỗi con
const hasWord = (list, ...targets) => targets.some(t => list.includes(t));

// Thứ tự luật quan trọng: hẹp trước, rộng sau
if (hasPhrase(name, 'các loại hạt') || hasWord(w, 'hạt')) return '🥜';
if (hasWord(w, 'cá', 'tôm', 'cua') || hasPhrase(name, 'hải sản')) return '🦐';
```

---

## ⚙️ Thiết lập & Chạy local

### Yêu cầu
- Node.js 20+
- npm 10+
- Backend đang chạy tại `http://localhost:8080`

### Cài đặt và chạy

```bash
cd smartrecipe-frontend
npm install
cp .env.example .env    # Điền VITE_API_BASE_URL nếu cần
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173` với Hot Module Replacement.

---

## 🔧 Biến môi trường

```env
# .env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> **Lưu ý:** Vite chỉ expose biến có tiền tố `VITE_` ra client-side. Không đặt secret key trong `.env` frontend.

---

## 📜 Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server với HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint toàn bộ code (OxLint) |
| `npm run test` | Chạy unit tests (CI mode) |
| `npm run test:watch` | Watch mode cho TDD |

---

## 🧪 Unit Test

Vitest + Testing Library, môi trường `jsdom`. Cấu hình nằm trong khối `test` của
`vite.config.js`; `src/test/setup.js` nạp matcher của jest-dom và gọi `cleanup()`
sau mỗi ca. Test đặt cạnh code trong thư mục `__tests__/`.

```bash
npm test
```

17 ca:

| File | Số ca | Phạm vi |
|---|---|---|
| `services/__tests__/ingredientService.test.js` | 4 | `createQuick` gọi đúng `/ingredients/quick` và chỉ gửi `name` + `aisleId`; `search` encode tiếng Việt |
| `components/pantry/__tests__/AddPantryItemModal.test.jsx` | 4 | Auto-create dùng `createQuick` (không phải `create`); đơn vị gửi lên tủ là `baseUnit` backend trả về |
| `components/pantry/__tests__/ExpiryAlertBanner.test.jsx` | 5 | Ẩn khi không có gì hết hạn; nút "Dọn tủ ngay" chỉ hiện khi `expiredCount > 0` |
| `components/ui/__tests__/ConfirmModal.test.jsx` | 4 | Không render khi đóng; `onConfirm`/`onCancel` đúng nút; disable khi `isLoading` |

`test.css = false` nên CSS Module trả về object rỗng trong test — component vẫn
render bình thường, chỉ `className` thành `undefined`. Vì vậy assertion dựa vào
role, text và label thay vì class.

---

## 📦 Tổng quan tính năng theo trang

| Trang | Tính năng nổi bật |
|---|---|
| **Home** | Feed công thức, tìm kiếm real-time, filter tag/độ khó, AI gợi ý từ tủ lạnh |
| **RecipeForm** | Form nhiều bước, autocomplete nguyên liệu + đơn vị, preview ảnh |
| **RecipeDetail** | Cooking Mode step-by-step, chia sẻ, export Word, bình luận |
| **Pantry** | Grid 9 kệ động, cảnh báo hết hạn, thêm nhanh nguyên liệu |
| **Grocery** | Tạo từ công thức hoặc AI, Shopping Mode full-screen, confetti khi hoàn thành |
| **Journal** | Nhật ký nấu ăn có ảnh, đánh giá sao, ghi chú cải tiến |
| **UserProfile** | Follow/Unfollow, xem công thức người dùng khác |

---

*Xây dựng với ❤️ — SmartRecipe Frontend v0.0.0*
