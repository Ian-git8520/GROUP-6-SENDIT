import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "./Driver.css";
import { driverAPI } from "./api";

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

    const routing = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: "#38bdf8", weight: 5 }] },
    }).addTo(map);

    return () => map.removeControl(routing);
  }, [pickup, destination, map]);

  return null;
};

const MapFocus = ({ selected }) => {
  const map = useMap();

  useEffect(() => {
    if (!selected?.pickup || !selected?.destination) return;

    const points = [
      L.latLng(selected.pickup.lat, selected.pickup.lng),
      L.latLng(selected.destination.lat, selected.destination.lng),
    ];
    map.fitBounds(points, { padding: [40, 40] });
  }, [selected, map]);

  return null;
};

const hasValidCoord = (loc) =>
  loc &&
  Number.isFinite(Number(loc.lat)) &&
  Number.isFinite(Number(loc.lng)) &&
  (Number(loc.lat) !== 0 || Number(loc.lng) !== 0);

const parseCoord = (loc) => {
  if (!loc) return null;

  if (typeof loc === "object") {
    if (Array.isArray(loc) && loc.length >= 2) {
      const lat = Number(loc[0]);
      const lng = Number(loc[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    if ("lat" in loc && "lng" in loc) {
      const lat = Number(loc.lat);
      const lng = Number(loc.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    return null;
  }

  if (typeof loc === "string") {
    const trimmed = loc.trim();

    const commaMatch = trimmed.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
    );
    if (commaMatch) {
      return { lat: Number(commaMatch[1]), lng: Number(commaMatch[2]) };
    }

    try {
      const parsed = JSON.parse(trimmed);
      return parseCoord(parsed);
    } catch {
      return null;
    }
  }

  return null;
};

const geocodeAddress = async (addressText) => {
  if (!addressText || typeof addressText !== "string") return null;
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        addressText
      )}`
    );
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
};

const getAddress = async (lat, lng) => {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await resp.json();
    return data.display_name || "Unknown address";
  } catch {
    return "Unknown address";
  }
};

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const Driver = () => {
  const driver = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!driver) return;

      try {
        const res = await driverAPI.getAssignedOrders();

        if (!res.ok) throw new Error("Fetch failed");

        const payload = await res.json();

        if (!Array.isArray(payload)) {
          console.error("Unexpected data structure:", payload);
          return;
        }

        const myOrders = payload;

        const enriched = await Promise.all(
          myOrders.map(async (o) => {
            let pickup = parseCoord(o.pickup_location);
            let drop = parseCoord(o.drop_off_location);

            if (!pickup && typeof o.pickup_location === "string") {
              pickup = await geocodeAddress(o.pickup_location);
            }
            if (!drop && typeof o.drop_off_location === "string") {
              drop = await geocodeAddress(o.drop_off_location);
            }

            const fallbackCenter = { lat: -1.286389, lng: 36.817223 };
            const resolvedPickup = pickup || fallbackCenter;
            const resolvedDrop = drop || fallbackCenter;

            const pickAddr = hasValidCoord(resolvedPickup)
              ? await getAddress(resolvedPickup.lat, resolvedPickup.lng)
              : o.pickup_location || "Unknown pickup";
            const dropAddr = hasValidCoord(resolvedDrop)
              ? await getAddress(resolvedDrop.lat, resolvedDrop.lng)
              : o.drop_off_location || "Unknown destination";

            return {
              ...o,
              pickup: { ...resolvedPickup, address: pickAddr },
              destination: { ...resolvedDrop, address: dropAddr },
            };
          })
        );

        setOrders(enriched);
      } catch (e) {
        console.error("Error fetching assigned orders:", e);
      }
    };

    loadOrders();
  }, [driver]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await driverAPI.updateOrderStatus(orderId, newStatus);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSelected((prev) =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      );
    } catch (error) {
      console.error("Driver status update failed:", error);
      alert(error.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!driver) return <p>Please log in as a driver.</p>;

  return (
    <div className="driver-container">
      <div className="driver-header">
        <h2>Driver Dashboard</h2>
        <div className="driver-profile-card">
          <h3>{driver.name}</h3>
          <p>Email: {driver.email}</p>
          <p>Phone: {driver.phone_number}</p>
        </div>
      </div>

      <div className="driver-layout">
        <div className="driver-orders">
          {orders.length === 0 && <p>No assigned orders yet.</p>}

          {orders.map((o) => (
            (() => {
              const status = normalizeStatus(o.status);
              const canStartTrip =
                status === "accepted" ||
                status === "pending" ||
                status === "approved" ||
                status === "assigned";
              const canMarkDelivered = status === "in_transit";
              const isDelivered = status === "delivered";
              const isCancelled = status === "cancelled";
              const isUpdating = updatingOrderId === o.id;

              return (
                <div
                  key={o.id}
                  className={`order-card ${
                    selected?.id === o.id ? "active" : ""
                  }`}
                  onClick={() => setSelected(o)}
                >
                  <h4>{o.order_name || "Delivery"}</h4>
                  <p>Status: {o.status}</p>
                  <p>Pickup: {o.pickup.address}</p>
                  <p>Destination: {o.destination.address}</p>
                  <p>Price: KES {Number(o.total_price || 0).toLocaleString()}</p>
                  <p>
                    Distance:{" "}
                    {o.distance != null ? `${Number(o.distance).toFixed(2)} km` : "N/A"}
                  </p>

                  <div className="order-actions">
                    {canStartTrip && (
                      <button
                        type="button"
                        className="action-btn in-transit-btn"
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(o.id, "in_transit");
                        }}
                      >
                        {isUpdating ? "Starting..." : "Start trip"}
                      </button>
                    )}

                    {canMarkDelivered && (
                      <button
                        type="button"
                        className="action-btn delivered-btn"
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(o.id, "delivered");
                        }}
                      >
                        {isUpdating ? "Saving..." : "Mark delivered"}
                      </button>
                    )}

                    {isDelivered && (
                      <button type="button" className="action-btn delivered-btn" disabled>
                        Delivered
                      </button>
                    )}

                    {isCancelled && (
                      <button type="button" className="action-btn in-transit-btn" disabled>
                        Cancelled
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ))}
        </div>

        <div className="driver-map">
          <MapContainer
            center={[-1.286389, 36.817223]}
            zoom={12}
            style={{ height: 500, width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selected && (
              <>
                <MapFocus selected={selected} />
                <Marker position={[selected.pickup.lat, selected.pickup.lng]}>
                  <Popup>{selected.pickup.address}</Popup>
                </Marker>

                <Marker
                  position={[
                    selected.destination.lat,
                    selected.destination.lng,
                  ]}
                >
                  <Popup>{selected.destination.address}</Popup>
                </Marker>

                <Route
                  pickup={selected.pickup}
                  destination={selected.destination}
                />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Driver;
