import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import CreateOrder from "./CreateOrder";
import ViewOrders from "./ViewOrders";
import TrackOrder from "./TrackOrder";
import AdminPanel from "./AdminPanel";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/create-order" element={<CreateOrder />} />
      <Route path="/dashboard/view-orders" element={<ViewOrders />} />
      <Route path="/dashboard/track-order" element={<TrackOrder />} />
      <Route path="/dashboard/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
