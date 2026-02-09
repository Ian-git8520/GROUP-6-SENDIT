'use client';

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./Driver.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Route = ({ pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!pickup || !destination) return;

    const routingControl = L.Routing.control({
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

    return () => {
      map.removeControl(routingControl);
    };
  }, [pickup, destination, map]);

  return null;
};

const Driver = () => {
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const [driverProfile, setDriverProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch driver profile
  useEffect(() => {
    const fetchDriverProfile = async () => {
      if (!storedUser) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/driver/profile", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch driver profile");
        }

        const data = await res.json();
        setDriverProfile(data.driver);
      } catch (err) {
        console.error(err);
        setError("Failed to load driver profile");
      }
    };

    fetchDriverProfile();
  }, [storedUser]);

  // Fetch orders assigned to this driver
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
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
        if (data.length > 0) {
          setSelectedOrder(data[0]);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/driver/deliveries/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      const data = await res.json();

      // Update local state
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      alert("Order status updated successfully");
    } catch (err) {
      console.error(err);
      alert(`Error updating order status: ${err.message}`);
    }
  };

  return (
    <div className="driver-container">
      <div className="driver-header">
        <h2 className="driver-title">Driver Dashboard</h2>
        {driverProfile && (
          <div className="driver-profile-card">
            <div className="profile-info">
              <h3>{driverProfile.name}</h3>
              <p>
                <strong>Phone:</strong> {driverProfile.phone_number}
              </p>
              <p>
                <strong>Email:</strong> {driverProfile.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="driver-layout">
        <div className="driver-orders">
          <h3>Assigned Orders</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No orders assigned</p>
          ) : (
            orders.map((order) => {
              const pickupData = typeof order.pickup_location === "string"
                ? JSON.parse(order.pickup_location)
                : order.pickup_location;
              const destData = typeof order.drop_off_location === "string"
                ? JSON.parse(order.drop_off_location)
                : order.drop_off_location;

              return (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? "active" : ""
                    }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <h3>Order #{order.id}</h3>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={order.status}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>

                  <p>
                    <strong>Pickup:</strong> {pickupData?.display_name || "N/A"}
                  </p>

                  <p>
                    <strong>Destination:</strong>{" "}
                    {destData?.display_name || "N/A"}
                  </p>

                  <p>
                    <strong>Distance:</strong>{" "}
                    {order.distance?.toFixed(2)} km
                  </p>

                  <p>
                    <strong>Price:</strong> KES {order.total_price}
                  </p>

                  {order.status === "accepted" && (
                    <div className="order-actions">
                      <button
                        className="action-btn in-transit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, "in_transit");
                        }}
                      >
                        Start Delivery
                      </button>
                    </div>
                  )}

                  {order.status === "in_transit" && (
                    <div className="order-actions">
                      <button
                        className="action-btn delivered-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, "delivered");
                        }}
                      >
                        Mark Delivered
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="driver-view">
          <div className="map-card">
            <MapContainer
              center={[-1.286389, 36.817223]}
              zoom={12}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedOrder && (() => {
                const pickupData = typeof selectedOrder.pickup_location === "string"
                  ? JSON.parse(selectedOrder.pickup_location)
                  : selectedOrder.pickup_location;
                const destData = typeof selectedOrder.drop_off_location === "string"
                  ? JSON.parse(selectedOrder.drop_off_location)
                  : selectedOrder.drop_off_location;

                if (!pickupData?.lat || !destData?.lat) {
                  return null;
                }

                return (
                  <>
                    <Route
                      pickup={{ lat: pickupData.lat, lng: pickupData.lng }}
                      destination={{ lat: destData.lat, lng: destData.lng }}
                    />

                    <Marker
                      position={[
                        pickupData.lat,
                        pickupData.lng,
                      ]}
                    >
                      <Popup>
                        Pickup: {pickupData.display_name}
                      </Popup>
                    </Marker>

                    <Marker
                      position={[
                        destData.lat,
                        destData.lng,
                      ]}
                    >
                      <Popup>
                        Destination: {destData.display_name}
                      </Popup>
                    </Marker>
                  </>
                );
              })()}
            </MapContainer>
          </div>

          {!selectedOrder && (
            <p className="map-placeholder">
              Select an order to view route
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;
