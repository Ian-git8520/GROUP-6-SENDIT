// Centralized API configuration
const API_BASE_URL = "http://127.0.0.1:5000";

export const getToken = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user?.token;
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res;
  },

  register: async (name, email, password, role_id) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role_id }),
    });
    return res;
  },
};

// Profile endpoints
export const profileAPI = {
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    return res;
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res;
  },
};

// Delivery endpoints
export const deliveryAPI = {
  getDeliveries: async () => {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      headers: getAuthHeaders(),
    });
    return res;
  },

  createDelivery: async (deliveryData) => {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deliveryData),
    });
    return res;
  },

  trackDelivery: async (deliveryId) => {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/track`, {
      headers: getAuthHeaders(),
    });
    return res;
  },

  updateDelivery: async (deliveryId, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res;
  },
};

// User endpoints
export const userAPI = {
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return res;
  },

  getUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return res;
  },
};

// Rider endpoints
export const riderAPI = {
  getRiders: async () => {
    const res = await fetch(`${API_BASE_URL}/riders`, {
      headers: getAuthHeaders(),
    });
    return res;
  },
};
