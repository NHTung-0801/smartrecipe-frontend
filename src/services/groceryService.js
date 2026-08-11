import api from './api';

export const groceryService = {
  // ---------- LIST ----------
  getAllLists: async () => {
    const response = await api.get('/grocery/lists');
    return response.data.data; // unwrap wrapper
  },

  getActiveList: async () => {
    const response = await api.get('/grocery/lists/active');
    return response.data.data; // unwrap wrapper
  },

  createList: async (data) => {
    const response = await api.post('/grocery/lists', data);
    return response.data.data; // unwrap wrapper
  },

  getList: async (id) => {
    const response = await api.get(`/grocery/lists/${id}`);
    return response.data.data; // unwrap wrapper
  },

  deleteList: async (id) => {
    const response = await api.delete(`/grocery/lists/${id}`);
    return response.data;
  },

  updateList: async (listId, data) => {
    const response = await api.put(`/grocery/lists/${listId}`, data);
    return response.data.data; // unwrap wrapper
  },

  completeList: async (listId, addToPantry = false) => {
    const response = await api.post(`/grocery/lists/${listId}/complete`, { addToPantry });
    return response.data.data; // unwrap wrapper
  },

  clearItems: async (listId) => {
    const response = await api.delete(`/grocery/lists/${listId}/items`);
    return response.data;
  },

  // ---------- ITEM ----------
  addItem: async (listId, data) => {
    const response = await api.post(`/grocery/lists/${listId}/items`, data);
    return response.data.data; // unwrap wrapper
  },

  updateItem: async (itemId, listId, data) => {
    // listId gửi qua query param (theo backend @RequestParam)
    const response = await api.put(`/grocery/items/${itemId}`, data, { params: { listId } });
    return response.data.data; // unwrap wrapper
  },

  removeItem: async (itemId, listId) => {
    const response = await api.delete(`/grocery/items/${itemId}`, { params: { listId } });
    return response.data;
  },

  togglePurchased: async (itemId, listId) => {
    const response = await api.patch(`/grocery/items/${itemId}/toggle`, null, { params: { listId } });
    return response.data.data; // unwrap wrapper
  },

  // ---------- GENERATE ----------
  generateFromPantry: async () => {
    const response = await api.post('/grocery/lists/generate-from-pantry');
    return response.data.data; // unwrap wrapper
  },

  generateFromRecipe: async (recipeId, servings = 1) => {
    const response = await api.post(`/grocery/lists/generate-from-recipe/${recipeId}`, null, {
      params: { servings },
    });
    return response.data.data; // unwrap wrapper
  },
};