// Points to the backend 
const API_BASE_URL = "http://localhost:5000";

// Helper function to make API requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
};

// Auth API calls
export const authAPI = {
  signup: (userData) =>
    makeRequest("/users", {
      method: "POST",
      body: userData,
    }),

  login: (email, password) =>
    makeRequest("/users/login", {
      method: "POST",
      body: { email, password },
    }),
};

// Delivery/Order API calls
export const deliveryAPI = {
  createOrder: (orderData) =>
    makeRequest("/deliveries", {
      method: "POST",
      body: orderData,
    }),

  getOrders: () =>
    makeRequest("/deliveries"),

  deleteOrder: (orderId) =>
    makeRequest(`/deliveries/${orderId}`, {
      method: "DELETE",
    }),

  assignDriver: (orderId, riderId) =>
    makeRequest(`/deliveries/${orderId}`, {
      method: "PATCH",
      body: { rider_id: riderId },
    }),

  updateStatus: (orderId, status) =>
    makeRequest(`/deliveries/${orderId}`, {
      method: "PATCH",
      body: { status },
    }),

  getOrderById: (orderId) =>
    makeRequest(`/deliveries/${orderId}`),
};

export const riderAPI = {
  getRiders: () =>
    makeRequest("/riders"),

  createRider: (riderData) =>
    makeRequest("/riders", {
      method: "POST",
      body: riderData,
    }),
};
