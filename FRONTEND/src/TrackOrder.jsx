'use client';

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
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/deliveries", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: include cookies
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
        if (data.length > 0) {
          setActiveOrder(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [storedUser]);

  if (!storedUser) {
    return <div className="track-page"><p>Please log in to track orders</p></div>;
  }

  return (
    <div className="track-page">
      <div className="track-sidebar">
        <h2>My Orders</h2>
        {loading && <p>Loading orders...</p>}
        {error && <p className="error-message">{error}</p>}

        {orders.map((order) => {
          // pickup_location is stored as plain string (human-readable address)
          const pickupData = typeof order.pickup_location === "string"
            ? order.pickup_location
            : order.pickup_location;

          return (
            <div
              key={order.id}
              className={`track-order-card ${activeOrder?.id === order.id ? "active" : ""
                }`}
              onClick={() => setActiveOrder(order)}
            >
              <p><strong>Order:</strong> {order.order_name ? order.order_name : `#${order.id}`}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${order.status === "delivered" ? "delivered" : "pending"
                    }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </p>
              <p><strong>Price:</strong> KES {order.total_price}</p>
            </div>
          );
        })}
      </div>

      <div className="track-main">
        {activeOrder && (() => {
          const pickupData = typeof activeOrder.pickup_location === "string"
            ? activeOrder.pickup_location
            : activeOrder.pickup_location;
          const destData = typeof activeOrder.drop_off_location === "string"
            ? activeOrder.drop_off_location
            : activeOrder.drop_off_location;

          // If lat/lng coordinates are not available, show textual locations instead of map
          const hasCoords = pickupData && destData && typeof pickupData === 'object' && pickupData.lat && destData.lat;
          if (!hasCoords) {
            return (
              <div className="track-info">
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status ${activeOrder.status === "delivered" ? "delivered" : "pending"}`}
                  >
                    {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                  </span>
                </p>
                <p>
                  <strong>Distance:</strong> {activeOrder.distance?.toFixed(2)} km
                </p>
                <p>
                  <strong>Price:</strong> KES {activeOrder.total_price}
                </p>
                <p><strong>Pickup:</strong> {pickupData || 'N/A'}</p>
                <p><strong>Destination:</strong> {destData || 'N/A'}</p>
              </div>
            );
          }

          return (
            <>
              <div className="map-card">
                <MapContainer
                  center={[pickupData.lat, pickupData.lng]}
                  zoom={12}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={[pickupData.lat, pickupData.lng]}>
                    <Popup>Pickup</Popup>
                  </Marker>

                  <Marker position={[destData.lat, destData.lng]}>
                    <Popup>Destination</Popup>
                  </Marker>

                  <Routing
                    pickup={{ lat: pickupData.lat, lng: pickupData.lng }}
                    destination={{ lat: destData.lat, lng: destData.lng }}
                  />
                </MapContainer>
              </div>

              <div className="track-info">
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status ${activeOrder.status === "delivered" ? "delivered" : "pending"}`}
                  >
                    {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                  </span>
                </p>
                <p>
                  <strong>Distance:</strong> {activeOrder.distance?.toFixed(2)} km
                </p>
                <p>
                  <strong>Price:</strong> KES {activeOrder.total_price}
                </p>
                {typeof pickupData === 'object' && pickupData.display_name && (
                  <p>
                    <strong>Pickup:</strong> {pickupData.display_name}
                  </p>
                )}
                {typeof destData === 'object' && destData.display_name && (
                  <p>
                    <strong>Destination:</strong> {destData.display_name}
                  </p>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default TrackOrder;
