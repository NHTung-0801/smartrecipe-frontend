# 🎨 Admin Panel — Design System Reference
> SmartRecipe Project · Frontend · `smartrecipe-frontend`  
> Cập nhật lần cuối: 2026-09-16

Tài liệu này là **nguồn duy nhất** để tham chiếu khi tạo mới hoặc chỉnh sửa bất kỳ trang admin nào.  
Áp dụng nhất quán cho: `AdminDashboard`, `AdminRecipes`, `AdminIngredients`, `AdminUsers`, và mọi trang admin mới.

---

## 1. Font & Typography

| Vai trò | Font Family | Size | Weight | Màu |
|---|---|---|---|---|
| **Tiêu đề trang (H1)** | `'Plus Jakarta Sans', sans-serif` | `2rem` | `800` | `#2b130c` |
| **Thân trang (body)** | `'Be Vietnam Pro', sans-serif` | — | — | `#2b130c` |
| **Subtitle / Mô tả** | inherit | `0.95rem` | `400` | `#78716c` |
| **Tên item trong bảng** | `'Plus Jakarta Sans', sans-serif` | `0.92rem` | `700` | `#2b130c` |
| **Text phụ / sub** | inherit | `0.78–0.82rem` | `400` | `#78716c` |
| **Email / metadata** | inherit | `0.85rem` | `400` | `#57534e` |
| **Ngày tháng** | inherit | `0.82rem` | `400` | `#78716c` |
| **KPI Label** | inherit | `0.74rem` | `700` | `#78716c` |
| **KPI Value** | `'Plus Jakarta Sans', sans-serif` | `1.55rem` | `800` | `#2b130c` |
| **KPI Sub** | inherit | `0.72rem` | `400` | `#a8a29e` |
| **Table header (TH)** | inherit | `0.76rem` | `700` | `#57534e` |
| **Table body (TD)** | inherit | `0.88rem` | `400` | `#292524` |
| **Badge / pill** | inherit | `0.70–0.75rem` | `700` | theo màu |
| **Nút hành động** | inherit | `0.82–0.88rem` | `700` | theo loại |

---

## 2. Bảng màu (Color Palette)

### Màu nền & đường viền
| Token | Giá trị | Dùng ở |
|---|---|---|
| Nền trang admin | `#f5f0ea` (từ AdminLayout) | Nền toàn bộ khu admin |
| Nền card / panel | `#ffffff` | KPI card, bảng, drawer |
| Nền header card | `#fafaf9` | KPI strip, table `<thead>` |
| Nền hover header | `#fffbf9` | Row hover nhẹ |
| Border nhạt | `#f0e6e0` | Viền card, panel, table |
| Border bảng (TD) | `#f5ede8` | Giữa các hàng |

### Màu chính (Brand)
| Token | Giá trị | Dùng ở |
|---|---|---|
| Terracotta chính | `#a13923` | Accent, active, link hover |
| Terracotta đậm | `#7c2d12` | Gradient end, button hover |
| Gradient chính | `135deg, #a13923 → #7c2d12` | TitleBadge, icon, btn primary |

### Màu trạng thái
| Trạng thái | Màu chữ | Nền | Viền |
|---|---|---|---|
| PENDING / amber | `#b45309` | `#fef3c7` | `#fde68a` |
| PUBLIC / emerald | `#059669` | `#ecfdf5` | `#a7f3d0` |
| HIDDEN / slate | `#475569` | `#f1f5f9` | `#cbd5e1` |
| ADMIN role | `#dc2626` | `#fef2f2` | `#fecaca` |
| USER role | `#15803d` | `#f0fdf4` | `#bbf7d0` |
| Nguy hiểm / xóa | `#ef4444` | `#fff5f5` | `#fee2e2` |

### KPI Icon Gradient (luôn gradient, icon màu trắng)
| Tên class | Gradient |
|---|---|
| `terracotta` | `135deg, #a13923 → #7c2d12` |
| `amber` | `135deg, #f59e0b → #d97706` |
| `emerald` | `135deg, #10b981 → #059669` |
| `blue` | `135deg, #3b82f6 → #1d4ed8` |

---

## 3. Layout & Spacing

### `.page` — Container gốc mỗi trang admin
```css
display: flex;
flex-direction: column;
gap: 1.25rem;
font-family: 'Be Vietnam Pro', sans-serif;
color: #2b130c;
width: 100%;
max-width: 100%;
box-sizing: border-box;
```

### `.header` — Phần tiêu đề trang
```css
display: flex;
align-items: center;
justify-content: space-between;
gap: 1rem;
flex-wrap: wrap;
padding-bottom: 0.5rem;
border-bottom: 1px solid #f0e6e0;
```

### `.title` — Tiêu đề H1
```css
font-family: 'Plus Jakarta Sans', sans-serif;
font-size: 2rem;
font-weight: 800;
color: #2b130c;
margin: 0;
letter-spacing: -0.02em;
```

### `.titleBadge` — Nhãn cạnh tiêu đề
```css
display: inline-flex;
align-items: center;
gap: 0.35rem;
background: linear-gradient(135deg, #a13923 0%, #7c2d12 100%);
color: #fff;
font-size: 0.75rem;
font-weight: 700;
padding: 0.25rem 0.65rem;
border-radius: 20px;
text-transform: uppercase;
letter-spacing: 0.05em;
box-shadow: 0 2px 8px rgba(161, 57, 35, 0.25);
```

### `.subtitle`
```css
font-size: 0.95rem;
color: #78716c;
margin: 0;
```

---

## 4. KPI Cards

### `.kpiGrid` — Grid 4 cột
```css
display: grid;
grid-template-columns: repeat(4, minmax(0, 1fr));
gap: 1rem;
/* ≤1024px → repeat(2, 1fr) | ≤600px → 1fr */
```

### `.kpiCard`
```css
background: white;
border-radius: 16px;
padding: 0.95rem 1rem;
display: flex;
align-items: center;
gap: 0.8rem;
border: 1px solid #f0e6e0;
box-shadow: 0 2px 10px rgba(43, 19, 12, 0.03);
transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
position: relative;
overflow: hidden;
box-sizing: border-box;
```

### `.kpiIconWrap` — Icon 40×40, gradient, trắng
```css
width: 40px;
height: 40px;
border-radius: 10px;
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
color: white;
/* + class màu: xem bảng KPI Icon Gradient ở mục 2 */
```

### `.kpiBody`
```css
flex: 1;
min-width: 0;
overflow: hidden;
```

---

## 5. Table (Bảng dữ liệu)

### `.tableContainer`
```css
background: white;
border: 1px solid #f0e6e0;
border-radius: 14px;
overflow: hidden;
box-shadow: 0 2px 10px rgba(43, 19, 12, 0.03);
box-sizing: border-box;
width: 100%;
```

### `.table` — QUAN TRỌNG: luôn dùng `table-layout: fixed`
```css
width: 100%;
border-collapse: collapse;
table-layout: fixed;   /* BẮT BUỘC — ngăn text làm vỡ cột */
font-size: 0.88rem;
text-align: left;
box-sizing: border-box;
```

### `.table th`
```css
padding: 0.75rem 0.85rem;
font-size: 0.76rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.04em;
color: #57534e;
background: #fafaf9;
border-bottom: 1px solid #f0e6e0;
```

### `.table td`
```css
padding: 0.85rem;
border-bottom: 1px solid #f5ede8;
vertical-align: middle;
color: #292524;
```

### Row states
```css
/* hover  */ background: #fff8f4;
/* active */ background: #fff7f4 !important; border-left: 3px solid #a13923;
/* last   */ border-bottom: none;
```

---

## 6. Action Buttons trong bảng

### `.btnAction` — Icon-only, 36×36
```css
width: 36px;
height: 36px;
padding: 0;
border-radius: 9px;
cursor: pointer;
display: inline-flex;
align-items: center;
justify-content: center;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
border: 1px solid #e7e5e4;
background: #ffffff;
flex-shrink: 0;
```

### Modifier classes
| Class | Default | Hover |
|---|---|---|
| `.preview` (mắt) | `bg:#fafaf9, color:#44403c` | `bg:#fff1ed, border:#fbdad0, color:#a13923` |
| `.delete` (thùng rác) | `bg:#fff, color:#78716c` | `bg:#fef2f2, border:#fecaca, color:#dc2626` |

---

## 7. Drawer (Side panel)

| Thuộc tính | Giá trị |
|---|---|
| Width | `500px` (max `92vw`) |
| Animation vào | `slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)` |
| Animation ra | `slideOutRight 0.25s cubic-bezier(0.7, 0, 0.84, 0)` |
| Overlay nền | `rgba(43, 19, 12, 0.35)` |
| Overlay blur | `backdrop-filter: blur(3px)` |
| z-index | Overlay `500` / Panel `501` |
| Header nền | `#fffbf9` |
| Footer nền | `#fafaf9` |

---

## 8. Buttons (Drawer footer & Form)

Chiều cao chuẩn: **`38px`** · `border-radius: 9px` · `font-weight: 700`

| Class | Màu chữ | Nền | Viền | Ngữ nghĩa |
|---|---|---|---|---|
| `.btnSecondary` | `#44403c` | `white` | `#e7e5e4` | Đóng / Huỷ |
| `.btnPromote` | `#b45309` | `#fffbeb` | `#fde68a` | Nâng quyền ADMIN (amber) |
| `.btnDemote` | `#57534e` | `white` | `#e7e5e4` | Hạ quyền USER |
| `.btnDeleteUser` | `#ef4444` | `#fff5f5` | `#fee2e2` | Xóa tài khoản |
| `.btnPrimary` | `white` | gradient `#a13923→#7c2d12` | — | Lưu / Xác nhận |
| `.btnDanger` | `white` | `#ef4444` | — | Xóa vĩnh viễn |

---

## 9. State Boxes (Loading / Error / Empty)

```css
.stateBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 4rem 1.5rem;
  color: #78716c;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}
```

| State | Icon size | Icon màu |
|---|---|---|
| Loading (spin) | `28px` | `#a13923` |
| Error | `32px` | `#ef4444` |
| Empty | `36px` | `#d6d3d1` |

---

## 10. Checklist khi tạo trang Admin mới

- [ ] `.page` có đủ: `font-family`, `color`, `max-width`, `box-sizing`
- [ ] `.header` có `border-bottom: 1px solid #f0e6e0` và `padding-bottom: 0.5rem`
- [ ] `.title` dùng `'Plus Jakarta Sans'`, `font-size: 2rem`, màu `#2b130c`
- [ ] `.titleBadge` dùng **gradient đỏ** (không dùng flat màu nhạt)
- [ ] KPI icon dùng **gradient**, `color: white`, kích thước `40×40`
- [ ] Table dùng `table-layout: fixed` + `font-size: 0.88rem`
- [ ] Không có font-size nào vượt `2rem` (trừ số liệu dashboard đặc biệt)
- [ ] Text chính trong bảng ≤ `0.92rem`
- [ ] Nút **nguy hiểm** (xóa) → màu đỏ `#ef4444`
- [ ] Nút **tích cực** (nâng quyền, tạo mới) → amber `#d97706` hoặc gradient chính
- [ ] Import Google Fonts đã có trong `index.html`: `Plus Jakarta Sans` + `Be Vietnam Pro`
