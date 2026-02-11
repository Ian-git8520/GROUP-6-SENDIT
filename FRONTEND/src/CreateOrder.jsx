'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./CreateOrder.css";
import { deliveryAPI } from "./api";

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

/* ROUTING */
const Routing = ({ from, to, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routing = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    })
      .on("routesfound", (e) => {
        setDistance(e.routes[0].summary.totalDistance / 1000);
      })
      .addTo(map);

    return () => map.removeControl(routing);
  }, [from, to, map, setDistance]);

  return null;
};

let searchTimeout;

const CreateOrder = () => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState("");
  const [orderName, setOrderName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);

  const [searchPickup, setSearchPickup] = useState("");
  const [searchDestination, setSearchDestination] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  /* AUTOCOMPLETE */
  const searchLocations = (query, setSuggestions) => {
    clearTimeout(searchTimeout);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ke&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 400);
  };

  const computedPrice = useMemo(() => {
    if (!distance || !weight || !height || !length) return null;

    return Math.round(
      300 +
      distance * 50 +
      Number(weight) * 10 +
      (Number(height) + Number(length)) * 2
    );
  }, [distance, weight, height, length]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pickup || !destination) {
      alert("Select pickup and destination from suggestions");
      return;
    }

    const newOrder = {
      id: Date.now(),
      itemType,
      weight,
      height,
      length,
      pickup,
      destination,
      distance,
      price: computedPrice,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
    };

    setPendingOrder(newOrder);
    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("jwtToken");

    if (!storedUser && !token) {
      alert("You must be logged in to place an order.");
      navigate("/login");
      return;
    }

    try {
      const response = await deliveryAPI.createDelivery({
        distance: Number(distance),
        weight: Number(weight),
        size: Number(height) + Number(length),
        pickup_location: searchPickup,
        drop_off_location: searchDestination,
        order_name: orderName || undefined,
      });

      if (response.status === 401) {
        alert("Invalid or expired session. Please log in again.");
        localStorage.removeItem("currentUser");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error placing order: " + (errorData.error || "Unknown error"));
        return;
      }

      const data = await response.json();

      setShowConfirm(false);
      setPendingOrder(null);

      alert("Order placed successfully! Delivery ID: " + data.delivery_id);

      // Reset form
      setItemType("");
      setOrderName("");
      setWeight("");
      setHeight("");
      setLength("");
      setPickup(null);
      setDestination(null);
      setDistance(null);
      setSearchPickup("");
      setSearchDestination("");
    } catch (error) {
      console.error(error);
      alert("Error placing order. Please try again.");
    }
  };

  const cancelOrder = () => {
    setShowConfirm(false);
    setPendingOrder(null);
  };

  return (
    <div className="order-dashboard">
      <div className="order-container">
        <h2>Create Parcel Delivery Order</h2>

        <form onSubmit={handleSubmit}>
          <div className="order-grid">
            {/* LEFT CARD */}
            <div className="card form-left">
              <input
                type="text"
                placeholder="Order Name (optional)"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Item Type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Length (cm)"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                required
              />

              {/* PICKUP */}
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="Pickup Location"
                  value={searchPickup}
                  onChange={(e) => {
                    setSearchPickup(e.target.value);
                    searchLocations(e.target.value, setPickupSuggestions);
                  }}
                />

                {pickupSuggestions.length > 0 && (
                  <ul className="autocomplete-list">
                    {pickupSuggestions.map((p) => (
                      <li
                        key={p.place_id}
                        onClick={() => {
                          setSearchPickup(p.display_name);
                          setPickup({ lat: +p.lat, lng: +p.lon });
                          setPickupSuggestions([]);
                        }}
                      >
                        {p.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* DESTINATION */}
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="Destination"
                  value={searchDestination}
                  onChange={(e) => {
                    setSearchDestination(e.target.value);
                    searchLocations(
                      e.target.value,
                      setDestinationSuggestions
                    );
                  }}
                />

                {destinationSuggestions.length > 0 && (
                  <ul className="autocomplete-list">
                    {destinationSuggestions.map((p) => (
                      <li
                        key={p.place_id}
                        onClick={() => {
                          setSearchDestination(p.display_name);
                          setDestination({ lat: +p.lat, lng: +p.lon });
                          setDestinationSuggestions([]);
                        }}
                      >
                        {p.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button type="submit" className="submit-btn">
                Submit Order
              </button>
            </div>

            {/* RIGHT CARD */}
            <div className="card">
              <div className="map-wrapper">
                <MapContainer
                  center={[-1.286389, 36.817223]}
                  zoom={12}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]}>
                      <Popup>Pickup</Popup>
                    </Marker>
                  )}

                  {destination && (
                    <Marker position={[destination.lat, destination.lng]}>
                      <Popup>Destination</Popup>
                    </Marker>
                  )}

                  {pickup && destination && (
                    <Routing
                      from={pickup}
                      to={destination}
                      setDistance={setDistance}
                    />
                  )}
                </MapContainer>
              </div>

              {distance && (
                <div className="price-box">
                  <p>
                    <strong>Distance:</strong> {distance.toFixed(2)} km
                  </p>
                  <p>
                    <strong>Estimated Price:</strong> KES {computedPrice}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Order</h3>
            <p>Are you sure you want to place this order?</p>

            <div className="modal-actions">
              <button className="modal-confirm-btn" onClick={confirmOrder}>
                Confirm
              </button>
              <button className="modal-cancel-btn" onClick={cancelOrder}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
