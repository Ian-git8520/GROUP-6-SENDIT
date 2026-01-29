import React, { useEffect, useState } from "react";
import "./Driver.css";

const Driver = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
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
  };

  return (
    <div className="driver-container">
      <h2>Driver Dashboard</h2>

      {orders.length === 0 ? (
        <p className="empty">No deliveries available.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>{order.itemType}</h3>

              <p>
                <strong>Status:</strong>{" "}
                <span className={order.status === "Delivered" ? "done" : "pending"}>
                  {order.status}
                </span>
              </p>

              <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
              <p><strong>Price:</strong> KES {order.price}</p>
              <p><strong>Created:</strong> {order.createdAt}</p>

              <div className="location-buttons">
                <button
                  onClick={() =>
                    openInMaps(order.pickup.lat, order.pickup.lng)
                  }
                >
                  Pickup
                </button>

                <button
                  onClick={() =>
                    openInMaps(order.destination.lat, order.destination.lng)
                  }
                >
                  Destination
                </button>
              </div>

              {order.status !== "Delivered" && (
                <button
                  className="deliver-btn"
                  onClick={() => markDelivered(order.id)}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Driver;
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

            