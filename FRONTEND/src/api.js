// Centralized API configuration
const API_BASE_URL = "http://localhost:5000";

export const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Important: include cookies
    });
    return res;
  },

  register: async (name, email, password, role_id) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role_id }),
      credentials: "include",
    });
    return res;
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return res;
  },
};

// Profile endpoints
export const profileAPI = {
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return res;
  },
};

// Delivery endpoints
export const deliveryAPI = {
  getDeliveries: async () => {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },

  createDelivery: async (deliveryData) => {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deliveryData),
      credentials: "include",
    });
    return res;
  },

  trackDelivery: async (deliveryId) => {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/track`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },

  updateDelivery: async (deliveryId, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return res;
  },
};

// User endpoints
export const userAPI = {
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },

  getUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },
};

// Rider endpoints
export const riderAPI = {
  getRiders: async () => {
    const res = await fetch(`${API_BASE_URL}/riders`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },
};
