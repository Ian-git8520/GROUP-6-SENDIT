import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./TrackOrder.css";

const Routing = ({ pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!pickup || !destination) return;

    const control = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      lineOptions: {
        styles: [{ color: "#38bdf8", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    return () => map.removeControl(control);
  }, [pickup, destination, map]);

  return null;
};

const TrackOrder = () => {
  const [orders] = useState(() => JSON.parse(localStorage.getItem("orders")) || []);
  const [activeOrder, setActiveOrder] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    return stored.length ? stored[0] : null;
  });

  // Remove the useEffect since initialization is handled in useState

  return (
    <div className="track-page">
      <div className="track-sidebar">
        <h2>My Orders</h2>

        {orders.map((order) => (
          <div
            key={order.id}
            className={`track-order-card ${
              activeOrder?.id === order.id ? "active" : ""
            }`}
            onClick={() => setActiveOrder(order)}
          >
            <p><strong>Item:</strong> {order.itemType}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status ${
                  order.status === "Delivered" ? "delivered" : "pending"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p><strong>Price:</strong> KES {order.price}</p>
          </div>
        ))}
      </div>

      <div className="track-main">
        {activeOrder && (
          <>
            <div className="map-card">
              <MapContainer
                center={[activeOrder.pickup.lat, activeOrder.pickup.lng]}
                zoom={12}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[activeOrder.pickup.lat, activeOrder.pickup.lng]}>
                  <Popup>Pickup</Popup>
                </Marker>

                <Marker
                  position={[
                    activeOrder.destination.lat,
                    activeOrder.destination.lng,
                  ]}
                >
                  <Popup>Destination</Popup>
                </Marker>

                <Routing
                  pickup={activeOrder.pickup}
                  destination={activeOrder.destination}
                />
              </MapContainer>
            </div>

            <div className="track-info">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${
                    activeOrder.status === "Delivered"
                      ? "delivered"
                      : "pending"
                  }`}
                >
                  {activeOrder.status}
                </span>
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {activeOrder.distance?.toFixed(2)} km
              </p>
              <p>
                <strong>Price:</strong> KES {activeOrder.price}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;