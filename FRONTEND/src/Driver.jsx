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

  return (
    <div className="driver-container">
      <h2 className="driver-title">Driver Dashboard</h2>

      <div className="driver-layout">
        {/* LEFT FLOATING CARDS */}
        <div className="driver-orders">
          {orders.map((order) => (
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
                <span className="pending">{order.status}</span>
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {order.distance?.toFixed(2)} km
              </p>
              <p>
                <strong>Price:</strong> KES {order.price}
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT MAP SPACE (ALWAYS PRESENT) */}
        <div className="driver-view">
          <div className="map-card">
            <MapContainer
              center={
                selectedOrder
                  ? [
                      selectedOrder.pickup.lat,
                      selectedOrder.pickup.lng,
                    ]
                  : [-1.286389, 36.817223]
              }
              zoom={12}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedOrder && (
                <>
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
                </>
              )}
            </MapContainer>
          </div>

          {!selectedOrder && (
            <p className="map-placeholder">
              Select an order to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;



            