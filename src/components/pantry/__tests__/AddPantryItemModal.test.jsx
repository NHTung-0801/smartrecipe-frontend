import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock service trước khi import component: AddPantryItemModal gọi
// ingredientService.createQuick khi nguyên liệu chưa có trong hệ thống,
// và IngredientAutocomplete bên trong gọi ingredientService.search.
vi.mock('../../../services/ingredientService', () => ({
  ingredientService: {
    search: vi.fn(),
    createQuick: vi.fn(),
    create: vi.fn(),
  },
  aisleService: {
    getAll: vi.fn(),
  },
}));

const { ingredientService } = await import('../../../services/ingredientService');
const { default: AddPantryItemModal } = await import('../AddPantryItemModal');

const AISLES = [
  { id: 1, name: 'Rau củ' },
  { id: 2, name: 'Thịt & Gia cầm' },
];

// aisles truyền qua prop nên useQuery bị disable (enabled: isOpen && !aisles),
// nhưng vẫn cần QueryClientProvider vì useQuery đọc context.
function renderModal(props = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const view = render(
    <QueryClientProvider client={client}>
      <AddPantryItemModal
        isOpen
        item={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        aisles={AISLES}
        {...props}
      />
    </QueryClientProvider>
  );
  return { ...view, onSubmit };
}

describe('AddPantryItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ingredientService.search.mockResolvedValue({ data: [] });
  });

  it('nguyên liệu chưa có: gọi createQuick (không phải create) với name + aisleId', async () => {
    const user = userEvent.setup();
    ingredientService.createQuick.mockResolvedValue({
      data: { id: 306, name: 'Cá rô đồng', baseUnit: 'g', caloriesPer100g: 0 },
    });
    renderModal();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.type(screen.getByPlaceholderText('Gõ tên nguyên liệu...'), 'Cá rô đồng');
    await user.type(screen.getByPlaceholderText('0'), '500');
    await user.click(screen.getByRole('button', { name: /Thêm vào tủ/ }));

    await waitFor(() => expect(ingredientService.createQuick).toHaveBeenCalledTimes(1));
    expect(ingredientService.createQuick).toHaveBeenCalledWith({
      name: 'Cá rô đồng',
      aisleId: 1,
    });
    // POST /ingredients giờ chỉ ADMIN gọi được -> user thường không được đi đường này
    expect(ingredientService.create).not.toHaveBeenCalled();
  });

  it('đơn vị gửi lên pantry là baseUnit backend trả về, không phải đơn vị user gõ', async () => {
    const user = userEvent.setup();
    ingredientService.createQuick.mockResolvedValue({
      data: { id: 307, name: 'Trứng ngan', baseUnit: 'g' },
    });
    const { onSubmit } = renderModal();

    await user.type(screen.getByPlaceholderText('Gõ tên nguyên liệu...'), 'Trứng ngan');
    await user.type(screen.getByPlaceholderText('0'), '10');
    // User gõ "quả": nguyên liệu vừa tạo chưa có tỉ lệ quy đổi quả -> g,
    // nên phải bỏ đơn vị này và dùng baseUnit của backend.
    await user.type(screen.getAllByPlaceholderText('đơn vị')[0], 'quả');
    await user.click(screen.getByRole('button', { name: /Thêm vào tủ/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ ingredientId: 307, unit: 'g', quantityAvailable: 10 })
    );
  });

  it('chọn nguyên liệu có sẵn: không tạo nguyên liệu mới', async () => {
    const user = userEvent.setup();
    ingredientService.search.mockResolvedValue({
      data: [{ id: 14, name: 'Bí đao', baseUnit: 'g', aisle: { id: 1, name: 'Rau củ' } }],
    });
    const { onSubmit } = renderModal();

    await user.type(screen.getByPlaceholderText('Gõ tên nguyên liệu...'), 'Bí đao');
    await user.click(await screen.findByText('Bí đao'));
    await user.type(screen.getByPlaceholderText('0'), '300');
    await user.click(screen.getByRole('button', { name: /Thêm vào tủ/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(ingredientService.createQuick).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ ingredientId: 14, unit: 'g' })
    );
  });

  it('chặn submit khi chưa nhập số lượng', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByPlaceholderText('Gõ tên nguyên liệu...'), 'Rau đắng');
    await user.click(screen.getByRole('button', { name: /Thêm vào tủ/ }));

    expect(await screen.findByText('Số lượng phải lớn hơn 0.')).toBeInTheDocument();
    expect(ingredientService.createQuick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
