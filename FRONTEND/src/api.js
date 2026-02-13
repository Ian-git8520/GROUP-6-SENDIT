// Centralized API configuration
const API_BASE_URL = "http://localhost:5000";

export const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };

  // Add JWT token from localStorage if it exists
  const token = localStorage.getItem("jwtToken");
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
  },

  register: async (name, email, password, role_id) => {
    return fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role_id }),
      credentials: "include",
    });
  },

  logout: async () => {
    return fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  },
};

// Profile endpoints
export const profileAPI = {
  getProfile: async () => {
    return fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },

  updateProfile: async (data) => {
    return fetch(`${API_BASE_URL}/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
  },
};

// Delivery endpoints
export const deliveryAPI = {
  getDeliveries: async () => {
    return fetch(`${API_BASE_URL}/deliveries`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },

  createDelivery: async (deliveryData) => {
    return fetch(`${API_BASE_URL}/deliveries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deliveryData),
      credentials: "include",
    });
  },

  trackDelivery: async (deliveryId) => {
    return fetch(`${API_BASE_URL}/deliveries/${deliveryId}/track`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },

  updateDelivery: async (deliveryId, data) => {
    return fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
  },

  changeDestination: async (deliveryId, newDestination) => {
    return fetch(`${API_BASE_URL}/user/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: "change_destination",
        new_destination: newDestination,
      }),
      credentials: "include",
    });
  },

  cancelDelivery: async (deliveryId, cancellationReason) => {
    return fetch(`${API_BASE_URL}/user/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: "cancel",
        cancellation_reason: cancellationReason,
      }),
      credentials: "include",
    });
  },
};

// User endpoints
export const userAPI = {
  getUsers: async () => {
    return fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },

  getUser: async (userId) => {
    return fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },
};

// Rider endpoints
export const riderAPI = {
  getRiders: async () => {
    return fetch(`${API_BASE_URL}/riders`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },
};

// Driver endpoints
export const driverAPI = {
  getAssignedOrders: async () => {
    return fetch(`${API_BASE_URL}/driver/deliveries`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
  },

  updateOrderStatus: async (deliveryId, status) => {
    return fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
      credentials: "include",
    });
  },
};