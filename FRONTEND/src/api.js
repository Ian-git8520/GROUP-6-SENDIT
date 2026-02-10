// Centralized API configuration
const API_BASE_URL = "http://localhost:5001";

export const getAuthHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  
  // Add JWT token from localStorage if it exists
  const currentUser = localStorage.getItem("currentUser");
  const token = localStorage.getItem("jwtToken");
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
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
  changeDestination: async (deliveryId, newDestination) => {
    const res = await fetch(`${API_BASE_URL}/user/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "change_destination", new_destination: newDestination }),
      credentials: "include",
    });
    return res;
  },

  cancelDelivery: async (deliveryId, cancellationReason) => {
    const res = await fetch(`${API_BASE_URL}/user/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "cancel", cancellation_reason: cancellationReason }),
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

// Driver endpoints
export const driverAPI = {
  getAssignedOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/driver/deliveries`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return res;
  },

  updateOrderStatus: async (deliveryId, status) => {
    const res = await fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return res;
  },
};
