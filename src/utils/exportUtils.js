/**
 * exportUtils.js
 * Tiện ích xuất dữ liệu chuẩn CSV UTF-8 kèm BOM (\uFEFF)
 * Giúp mở trực tiếp trên Microsoft Excel (Windows/Mac) mà không bị lỗi font tiếng Việt.
 */

/**
 * Tải xuống nội dung bảng dạng file CSV
 * @param {string[]} headers - Danh sách tiêu đề các cột
 * @param {Array<Array<any>>} rows - Mảng 2 chiều chứa các giá trị từng dòng
 * @param {string} filename - Tên file xuất (không cần đuôi .csv)
 */
export const downloadCsv = (headers, rows, filename) => {
  // Byte Order Mark (BOM) để Microsoft Excel nhận diện mã hóa UTF-8 tiếng Việt
  const BOM = '\uFEFF';

  // Format từng ô dữ liệu: thoát ký tự nháy kép "" và bọc trong cặp ngoặc kép
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(formatCell).join(',');
  const dataLines = rows.map((row) => row.map(formatCell).join(','));
  const csvContent = BOM + [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Xuất danh sách Công thức nấu ăn sang CSV
 */
export const exportRecipesToCsv = (recipes) => {
  const headers = [
    'ID',
    'Tên công thức',
    'Tác giả',
    'Tên đăng nhập',
    'Độ khó',
    'Thời gian chuẩn bị (phút)',
    'Thời gian nấu (phút)',
    'Số nguyên liệu',
    'Lượt thích',
    'Trạng thái kiểm duyệt',
    'Ngày đăng',
  ];

  const rows = recipes.map((r) => [
    r.id,
    r.title || '',
    r.authorDisplayName || '',
    r.authorUsername ? `@${r.authorUsername}` : '',
    r.difficulty === 'EASY' ? 'Dễ' : r.difficulty === 'HARD' ? 'Khó' : 'Trung bình',
    r.prepTime || 0,
    r.cookTime || 0,
    r.ingredientCount || 0,
    r.likeCount || 0,
    r.status === 'PUBLIC' ? 'Công khai' : r.status === 'PENDING_REVIEW' ? 'Chờ duyệt' : 'Riêng tư',
    r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '',
  ]);

  downloadCsv(headers, rows, 'smartrecipe_cong_thuc');
};

/**
 * Xuất danh mục Nguyên liệu & Dinh dưỡng sang CSV
 */
export const exportIngredientsToCsv = (ingredients) => {
  const headers = [
    'ID',
    'Tên nguyên liệu',
    'Kệ hàng siêu thị',
    'Đơn vị chuẩn',
    'Calo (kcal/100g)',
    'Đạm / Protein (g)',
    'Chất béo / Fat (g)',
    'Tinh bột / Carbs (g)',
  ];

  const rows = ingredients.map((ing) => [
    ing.id,
    ing.name || '',
    ing.aisleName || 'Chưa phân loại',
    ing.baseUnit || 'g',
    ing.caloriesPer100g != null ? ing.caloriesPer100g : 0,
    ing.protein != null ? ing.protein : 0,
    ing.fat != null ? ing.fat : 0,
    ing.carbs != null ? ing.carbs : 0,
  ]);

  downloadCsv(headers, rows, 'smartrecipe_nguyen_lieu_dinh_duong');
};

/**
 * Xuất danh sách Người dùng & Phân quyền sang CSV
 */
export const exportUsersToCsv = (users) => {
  const headers = [
    'ID',
    'Tên đăng nhập',
    'Tên hiển thị',
    'Email',
    'Vai trò',
    'Số công thức',
    'Số nhật ký nấu',
    'Ngày gia nhập',
  ];

  const rows = users.map((u) => [
    u.id,
    `@${u.username}`,
    u.displayName || '',
    u.email || '',
    u.role === 'ADMIN' ? 'Quản trị viên (ADMIN)' : 'Thành viên (USER)',
    u.recipeCount || 0,
    u.journalCount || 0,
    u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '',
  ]);

  downloadCsv(headers, rows, 'smartrecipe_nguoi_dung');
};

/**
 * Xuất bảng Quy chuẩn Đơn vị đo lường sang CSV
 */
export const exportUnitConversionsToCsv = (conversions) => {
  const headers = [
    'ID',
    'Nguyên liệu áp dụng',
    'Đơn vị đầu vào',
    'Hệ số quy đổi',
    'Đơn vị chuẩn hóa',
    'Mô tả quy tắc',
  ];

  const rows = conversions.map((c) => [
    c.id,
    c.ingredientName || 'Áp dụng chung',
    c.sourceUnit || c.unit || '',
    c.factor || c.conversionFactor || 1,
    c.targetUnit || c.baseUnit || 'g',
    `1 ${c.sourceUnit || c.unit || ''} = ${c.factor || c.conversionFactor || 1} ${c.targetUnit || c.baseUnit || 'g'}`,
  ]);

  downloadCsv(headers, rows, 'smartrecipe_quy_doi_don_vi');
};

/**
 * Xuất lịch sử gợi ý Trợ lý AI sang CSV
 */
export const exportAiLogsToCsv = (logs) => {
  const headers = [
    'Mã Log',
    'Tài khoản yêu cầu',
    'Họ tên',
    'Chế độ gợi ý',
    'Nguyên liệu đầu vào',
    'Món ăn AI gợi ý',
    'Thời gian nấu (phút)',
    'Đã lưu thành công thức',
    'Thời điểm thực hiện',
  ];

  const rows = logs.map((l) => [
    l.id,
    l.username ? `@${l.username}` : '',
    l.displayName || '',
    l.type === 'ZERO_WASTE' ? 'Tủ lạnh (Zero-Waste)' : 'Tìm theo yêu cầu',
    typeof l.inputIngredients === 'string' ? l.inputIngredients : JSON.stringify(l.inputIngredients || []),
    l.recipeTitle || 'Món ăn gợi ý',
    l.cookTime ? `${l.cookTime} phút` : '—',
    l.savedRecipeId ? `Đã lưu (ID #${l.savedRecipeId})` : 'Chưa lưu',
    l.createdAt ? new Date(l.createdAt).toLocaleString('vi-VN') : '',
  ]);

  downloadCsv(headers, rows, 'smartrecipe_nhat_ky_ai');
};
