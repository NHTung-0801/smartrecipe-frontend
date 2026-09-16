import axios from 'axios';
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

  // ── Users ──────────────────────────────────────────
  getAdminUsers: (page = 0, size = 20, search = '', role = 'ALL') =>
    api.get('/admin/users', {
      params: {
        page,
        size,
        search: search || undefined,
        role: role !== 'ALL' ? role : undefined,
      },
    }).then(r => r.data),

  getAdminUserDetail: (id) =>
    api.get(`/admin/users/${id}`).then(r => r.data),

  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, null, { params: { role } }).then(r => r.data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then(r => r.data),

  // ── Master Data: Aisles (Quầy hàng) ─────────────────
  getAisles: () =>
    api.get('/aisles').then(r => r.data),

  createAisle: (name) =>
    api.post('/aisles', { name }).then(r => r.data),

  updateAisle: (id, name) =>
    api.put(`/aisles/${id}`, { name }).then(r => r.data),

  deleteAisle: (id) =>
    api.delete(`/aisles/${id}`).then(r => r.data),

  // ── Master Data: Tags (Thẻ công thức) ───────────────
  getTags: () =>
    api.get('/tags').then(r => r.data),

  createTag: (name) =>
    api.post('/tags', { name }).then(r => r.data),

  updateTag: (id, name) =>
    api.put(`/tags/${id}`, { name }).then(r => r.data),

  deleteTag: (id) =>
    api.delete(`/tags/${id}`).then(r => r.data),

  // ── Master Data: Unit Conversions (Quy đổi đơn vị) ──
  getUnitConversions: () =>
    api.get('/unit-conversions').then(r => r.data),

  getGenericConversions: () =>
    api.get('/unit-conversions/generic').then(r => r.data),

  createUnitConversion: (payload) =>
    api.post('/unit-conversions', payload).then(r => r.data),

  updateUnitConversion: (id, payload) =>
    api.put(`/unit-conversions/${id}`, payload).then(r => r.data),

  deleteUnitConversion: (id) =>
    api.delete(`/unit-conversions/${id}`).then(r => r.data),

  // ── AI Suggestion Logs (Trợ lý AI Monitor) ─────────
  getAdminAiLogs: (page = 0, size = 20, type = 'ALL') =>
    api.get('/admin/ai-logs', {
      params: {
        page,
        size,
        type: type !== 'ALL' ? type : undefined,
      },
    }).then(r => r.data),

  // ── System Health (Spring Boot Actuator) ─────────────
  getSystemHealth: async () => {
    const baseURL = api.defaults.baseURL || 'http://localhost:8080/api/v1';
    const rootURL = baseURL.replace(/\/api\/v1\/?$/, '');
    const startTime = Date.now();
    const res = await axios.get(`${rootURL}/actuator/health`, { timeout: 5000 });
    const latency = Date.now() - startTime;
    return { ...res.data, latency };
  },
};

