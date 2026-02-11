import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./TrackOrder.css";
import { deliveryAPI } from "./api";

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
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      const token = localStorage.getItem("jwtToken");
      if (!storedUser && !token) {
        navigate("/login");
        return;
      }

      try {
        const res = await deliveryAPI.getDeliveries();

        if (res.status === 401) {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("jwtToken");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        setActiveOrder(list.length ? list[0] : null);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    let isActive = true;

    const geocodeLocation = async (query) => {
      if (!query) return null;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!data || data.length === 0) return null;
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    };

    const hydrateLocations = async () => {
      if (!activeOrder) return;
      setPickupCoords(null);
      setDestinationCoords(null);

      try {
        const [pickup, destination] = await Promise.all([
          geocodeLocation(activeOrder.pickup_location),
          geocodeLocation(activeOrder.drop_off_location),
        ]);

        if (!isActive) return;
        setPickupCoords(pickup);
        setDestinationCoords(destination);
      } catch (err) {
        console.error(err);
      }
    };

    hydrateLocations();

    return () => {
      isActive = false;
    };
  }, [activeOrder]);

  const normalizedStatus = (status) => (status || "").toLowerCase();

  return (
    <div className="track-page">
      <div className="track-sidebar">
        <h2>My Orders</h2>

        {loading && <p>Loading orders...</p>}
        {error && <p>{error}</p>}
        {!loading && orders.length === 0 && <p>No orders found.</p>}

        {orders.map((order) => (
          <div
            key={order.id}
            className={`track-order-card ${activeOrder?.id === order.id ? "active" : ""
              }`}
            onClick={() => setActiveOrder(order)}
          >
            <p><strong>Item:</strong> {order.order_name || `Order #${order.id}`}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status ${normalizedStatus(order.status) === "delivered" ? "delivered" : "pending"}`}
              >
                {order.status}
              </span>
            </p>
            <p><strong>Price:</strong> KES {order.total_price?.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="track-main">
        {activeOrder && (
          <>
            {pickupCoords && destinationCoords ? (
              <div className="map-card">
                <MapContainer
                  center={[pickupCoords.lat, pickupCoords.lng]}
                  zoom={12}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
                    <Popup>Pickup</Popup>
                  </Marker>

                  <Marker
                    position={[
                      destinationCoords.lat,
                      destinationCoords.lng,
                    ]}
                  >
                    <Popup>Destination</Popup>
                  </Marker>

                  <Routing
                    pickup={pickupCoords}
                    destination={destinationCoords}
                  />
                </MapContainer>
              </div>
            ) : (
              <div className="map-card">
                <p>Loading map details...</p>
              </div>
            )}

            <div className="track-info">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${normalizedStatus(activeOrder.status) === "delivered" ? "delivered" : "pending"}`}
                >
                  {activeOrder.status}
                </span>
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {activeOrder.distance?.toFixed(2)} km
              </p>
              <p>
                <strong>Price:</strong> KES {activeOrder.total_price?.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;