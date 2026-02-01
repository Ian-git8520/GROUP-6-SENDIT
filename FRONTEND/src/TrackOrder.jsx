import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TrackOrder.css";

/* Fix leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(stored);
    if (stored.length > 0) setSelectedOrder(stored[0]);
  }, []);

  return (
    <div className="track-page">
      <h2 className="page-title">Track Your Orders</h2>

      <div className="track-layout">
        {/* LEFT: ORDER LIST */}
        <div className="order-list">
          {orders.length === 0 && <p>No orders created yet.</p>}

          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-item ${
                selectedOrder?.id === order.id ? "active" : ""
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <p><strong>ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Price:</strong> KES {order.price}</p>
            </div>
          ))}
        </div>

        {/* RIGHT: MAP */}
        <div className="map-section">
          {selectedOrder ? (
            <>
              <div className="order-summary">
                <span>Status: {selectedOrder.status}</span>
                <span>Distance: {selectedOrder.distance?.toFixed(2)} km</span>
              </div>

              <div className="map-box">
                <MapContainer
                  center={[
                    selectedOrder.pickup.lat,
                    selectedOrder.pickup.lng,
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
                      selectedOrder.pickup.lat,
                      selectedOrder.pickup.lng,
                    ]}
                  >
                    <Popup>Pickup</Popup>
                  </Marker>

                  <Marker
                    position={[
                      selectedOrder.destination.lat,
                      selectedOrder.destination.lng,
                    ]}
                  >
                    <Popup>Destination</Popup>
                  </Marker>

                  <Polyline
                    positions={[
                      [
                        selectedOrder.pickup.lat,
                        selectedOrder.pickup.lng,
                      ],
                      [
                        selectedOrder.destination.lat,
                        selectedOrder.destination.lng,
                      ],
                    ]}
                  />
                </MapContainer>
              </div>
            </>
          ) : (
            <p>Select an order to view map</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;




