import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./CreateOrder.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Routing = ({ from, to, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    })
      .on("routesfound", (e) => {
        const route = e.routes[0];
        setDistance(route.summary.totalDistance / 1000);
      })
      .addTo(map);

    return () => map.removeControl(routingControl);
  }, [from, to, map, setDistance]);

  return null;
};

const CreateOrder = () => {
  const [itemType, setItemType] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [searchPickup, setSearchPickup] = useState("");
  const [searchDestination, setSearchDestination] = useState("");

  const geocode = async (address, setter) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );
    const data = await res.json();
    if (data.length > 0) {
      setter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } else {
      alert("Location not found");
    }
  };

  const handleRoute = async () => {
    if (!searchPickup || !searchDestination) {
      alert("Please enter both pickup and destination");
      return;
    }
    await geocode(searchPickup, setPickup);
    await geocode(searchDestination, setDestination);
  };

  const computedPrice = useMemo(() => {
    if (distance && weight && height && length) {
      return Math.round(
        300 +
          distance * 50 +
          Number(weight) * 10 +
          (Number(height) + Number(length)) * 2
      );
    }
    return null;
  }, [distance, weight, height, length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({
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
    });
    localStorage.setItem("orders", JSON.stringify(orders));
    alert("Order created successfully!");
  };

  return (
    <div className="order-container">
      <h2>Create Parcel Delivery Order</h2>

      <form className="order-form" onSubmit={handleSubmit}>
        <div className="order-grid">
          {/* LEFT SIDE */}
          <div className="form-left">
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
            <input
              type="text"
              placeholder="Pickup Location"
              value={searchPickup}
              onChange={(e) => setSearchPickup(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              required
            />
          </div>

          {/* CENTER MAP */}
          <div className="map-center">
            <button type="button" onClick={handleRoute} className="route-btn">
              Show Route & Calculate Price
            </button>

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
                    <Popup>Pickup Location</Popup>
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
                <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
                <p><strong>Estimated Price:</strong> KES {computedPrice}</p>
              </div>
            )}

            <button type="submit" className="submit-btn">
              Submit Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
