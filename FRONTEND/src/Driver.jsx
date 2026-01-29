import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Driver.css";

// Fix Leaflet icons
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
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
    if (storedOrders.length > 0) {
      setActiveOrder(storedOrders[0]);
    }
  }, []);

  const markDelivered = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: "Delivered" } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const openInMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank"
    );
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  return (
    <div className="driver-page">
      <h2>Driver Dashboard</h2>

      <div className="driver-grid">
        {/* LEFT: ORDERS LIST */}
        <div className="driver-orders">
          {orders.length === 0 ? (
            <p className="empty">No deliveries available.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className={`order-card ${
                  activeOrder?.id === order.id ? "active" : ""
                }`}
                onClick={() => setActiveOrder(order)}
              >
                <h4>{order.itemType}</h4>
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
                <p>{order.distance?.toFixed(2)} km</p>

                {order.status !== "Delivered" && (
                  <button
                    className="deliver-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      markDelivered(order.id);
                    }}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* CENTER: MAP CARD */}
        <div className="driver-map-card">
          <h3>Delivery Route</h3>

          {activeOrder ? (
            <MapContainer
              center={[
                activeOrder.pickup.lat,
                activeOrder.pickup.lng,
              ]}
              zoom={12}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  activeOrder.pickup.lat,
                  activeOrder.pickup.lng,
                ]}
              >
                <Popup>Pickup Location</Popup>
              </Marker>

              <Marker
                position={[
                  activeOrder.destination.lat,
                  activeOrder.destination.lng,
                ]}
              >
                <Popup>Destination</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="empty">Select an order to view route</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;

            