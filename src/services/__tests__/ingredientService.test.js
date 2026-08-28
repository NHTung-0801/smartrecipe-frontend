import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock module api trước khi import service, vì service giữ tham chiếu tới
// instance axios ngay khi được nạp.
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { default: api } = await import('../api');
const { ingredientService } = await import('../ingredientService');

describe('ingredientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuick', () => {
    it('gọi POST /ingredients/quick và chỉ gửi name + aisleId', async () => {
      api.post.mockResolvedValue({
        data: { data: { id: 291, name: 'Hoa atiso', baseUnit: 'g', caloriesPer100g: 0 } },
      });

      const result = await ingredientService.createQuick({ name: 'Hoa atiso', aisleId: 1 });

      expect(api.post).toHaveBeenCalledWith('/ingredients/quick', {
        name: 'Hoa atiso',
        aisleId: 1,
      });
      expect(result.data.id).toBe(291);
    });

    it('không gửi trường dinh dưỡng hay baseUnit — server tự quyết', async () => {
      api.post.mockResolvedValue({ data: { data: { id: 292, baseUnit: 'g' } } });

      await ingredientService.createQuick({ name: 'Rau đắng', aisleId: null });

      const body = api.post.mock.calls[0][1];
      expect(Object.keys(body).sort()).toEqual(['aisleId', 'name']);
      expect(body).not.toHaveProperty('baseUnit');
      expect(body).not.toHaveProperty('caloriesPer100g');
    });
  });

  describe('create', () => {
    it('vẫn trỏ tới POST /ingredients (endpoint chỉ ADMIN dùng được)', async () => {
      api.post.mockResolvedValue({ data: { data: { id: 1 } } });

      await ingredientService.create({ name: 'Cá hồi', baseUnit: 'g', caloriesPer100g: 208 });

      expect(api.post).toHaveBeenCalledWith('/ingredients', {
        name: 'Cá hồi',
        baseUnit: 'g',
        caloriesPer100g: 208,
      });
    });
  });

  describe('search', () => {
    it('encode ký tự tiếng Việt trong query', async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      await ingredientService.search('cá hồi');

      expect(api.get).toHaveBeenCalledWith(`/ingredients/search?q=${encodeURIComponent('cá hồi')}`);
    });
  });
});
