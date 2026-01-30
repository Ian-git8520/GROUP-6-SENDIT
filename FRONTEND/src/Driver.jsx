import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./Driver.css";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Driver = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  const markDelivered = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: "Delivered" } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  return (
    <div className="driver-container">
      <h2 className="driver-title">Driver Dashboard</h2>

      <div className="driver-layout">
        {/* ORDERS LIST */}
        <div className="driver-orders">
          {orders.length === 0 ? (
            <p className="empty">No deliveries available.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className={`order-card ${
                  selectedOrder?.id === order.id ? "active" : ""
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <h3>{order.itemType}</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      order.status === "Delivered" ? "done" : "pending"
                    }
                  >
                    {order.status}
                  </span>
                </p>
                <p>
                  <strong>Distance:</strong>{" "}
                  {order.distance?.toFixed(2)} km
                </p>
                <p>
                  <strong>Price:</strong> KES {order.price}
                </p>

                {order.status !== "Delivered" && (
                  <button
                    className="deliver-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      markDelivered(order.id);
                    }}
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* MAP + DETAILS CARD */}
        <div className="driver-view">
          {!selectedOrder ? (
            <p className="map-placeholder">
              Select an order to view details
            </p>
          ) : (
            <div className="map-card">
              <div className="map-section">
                <MapContainer
                  center={[
                    selectedOrder.pickup.lat,
                    selectedOrder.pickup.lng,
                  ]}
                  zoom={12}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      selectedOrder.pickup.lat,
                      selectedOrder.pickup.lng,
                    ]}
                  >
                    <Popup>Pickup Location</Popup>
                  </Marker>

                  <Marker
                    position={[
                      selectedOrder.destination.lat,
                      selectedOrder.destination.lng,
                    ]}
                  >
                    <Popup>Destination</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="order-details">
                <h3>Order Details</h3>
                <p>
                  <strong>Item:</strong> {selectedOrder.itemType}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Distance:</strong>{" "}
                  {selectedOrder.distance?.toFixed(2)} km
                </p>
                <p>
                  <strong>Price:</strong> KES {selectedOrder.price}
                </p>
                <p>
                  <strong>Created:</strong> {selectedOrder.createdAt}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;

