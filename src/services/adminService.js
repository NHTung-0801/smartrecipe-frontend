import api from './api';

export const adminService = {
  // ── Dashboard ────────────────────────────────────
  getStats: () => api.get('/admin/stats').then(r => r.data),

  // ── Recipe Moderation ────────────────────────────
  getAdminRecipes: (status = 'PENDING_REVIEW', page = 0, size = 20, search = '') =>
    api.get('/admin/recipes', { params: { status, page, size, search: search || undefined } }).then(r => r.data),

  getAdminRecipeDetail: (id) =>
    api.get(`/admin/recipes/${id}`).then(r => r.data),

  // action: 'APPROVE' | 'HIDE' | 'DELETE'
  updateRecipeStatus: (id, action) =>
    api.patch(`/admin/recipes/${id}/status`, null, { params: { action } }).then(r => r.data),

  // ── Ingredients ───────────────────────────────────
  getPendingIngredients: (page = 0, size = 20) =>
    api.get('/admin/ingredients/pending-review', { params: { page, size } }).then(r => r.data),

  getAllIngredients: (page = 0, size = 50, keyword = '', aisleId = '') =>
    api.get('/admin/ingredients', {
      params: {
        page,
        size,
        keyword: keyword || undefined,
        aisleId: aisleId || undefined,
      },
    }).then(r => r.data),

  createIngredient: (payload) =>
    api.post('/admin/ingredients', payload).then(r => r.data),

  updateIngredient: (id, payload) =>
    api.patch(`/admin/ingredients/${id}`, payload).then(r => r.data),

  deleteIngredient: (id) =>
    api.delete(`/admin/ingredients/${id}`).then(r => r.data),
};
