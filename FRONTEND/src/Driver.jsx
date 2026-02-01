import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./Driver.css";
import "leaflet/dist/leaflet.css";
import { deliveryAPI, riderAPI } from "./services/api";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || currentUser.role !== "driver") {
          setOrders([]);
          setSelectedOrder(null);
          setLoading(false);
          return;
        }

        const riders = await riderAPI.getRiders();
        const matchedRider = riders.find(
          (rider) =>
            rider.name?.toLowerCase() === currentUser.name?.toLowerCase()
        );

        let riderId = matchedRider?.id;
        if (!riderId) {
          const createdRider = await riderAPI.createRider({
            name: currentUser.name,
            phone_number: currentUser.phone || null,
          });
          riderId = createdRider.id;
        }

        const allOrders = await deliveryAPI.getOrders();
        const assigned = allOrders.filter((order) => order.rider?.id === riderId);
        setOrders(assigned);
        setSelectedOrder(assigned[0] || null);
      } catch (err) {
        setError("Failed to load assigned deliveries.");
        console.error("Driver load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDriverOrders();
  }, []);

  const markDelivered = async (id) => {
    try {
      await deliveryAPI.updateStatus(id, "delivered");
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: "delivered" } : order
        )
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "delivered" } : prev
        );
      }
    } catch (err) {
      setError("Failed to update delivery status.");
      console.error("Update status error:", err);
    }
  };

  return (
    <div className="driver-container">
      <h2 className="driver-title">Driver Dashboard</h2>

      <div className="driver-layout">
        {/* ORDERS LIST */}
        <div className="driver-orders">
          {loading && <p className="empty">Loading deliveries...</p>}
          {error && <p className="empty" style={{ color: "red" }}>{error}</p>}
          {!loading && !error && orders.length === 0 ? (
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
                <h3>{order.item_type || "Delivery"}</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      order.status === "delivered" ? "done" : "pending"
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
                  <strong>Price:</strong> KES {order.total_price}
                </p>

                {order.status !== "delivered" && (
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
                    selectedOrder.pickup_latitude,
                    selectedOrder.pickup_longitude,
                  ]}
                  zoom={12}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      selectedOrder.pickup_latitude,
                      selectedOrder.pickup_longitude,
                    ]}
                  >
                    <Popup>Pickup Location</Popup>
                  </Marker>

                  <Marker
                    position={[
                      selectedOrder.destination_latitude,
                      selectedOrder.destination_longitude,
                    ]}
                  >
                    <Popup>Destination</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="order-details">
                <h3>Order Details</h3>
                <p>
                  <strong>Item:</strong> {selectedOrder.item_type || "Delivery"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Distance:</strong>{" "}
                  {selectedOrder.distance?.toFixed(2)} km
                </p>
                <p>
                  <strong>Price:</strong> KES {selectedOrder.total_price}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleString()
                    : "N/A"}
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

