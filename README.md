# SENDIT 🚚📦

SENDIT is a courier service web application that enables users to send parcels to different destinations. The platform allows users to create delivery orders, track parcel status, and receive real-time updates, while administrators manage parcel movements and delivery statuses.

---

## 🧭 Project Overview

SENDIT helps individuals and businesses deliver parcels efficiently by providing courier services with pricing based on parcel weight categories. The application supports real-time notifications, delivery tracking using Google Maps, and role-based access for users and administrators.

---

## 👥 Team

- **Full Stack Application**
  - Frontend: React.js + Redux Toolkit
  - Backend: Ruby on Rails (API)

---

## ✨ MVP Features

### User Features
- User registration and authentication
- Create a parcel delivery order
- View delivery order details
- Change the destination of a parcel delivery order (if not yet delivered)
- Cancel a parcel delivery order (if not yet delivered)
- View pickup and destination locations on Google Maps
- Receive real-time email notifications when:
  - Parcel status changes
  - Parcel location is updated

### Admin Features
- View all parcel delivery orders
- Change the status of a parcel (e.g. pending, in transit, delivered)
- Update the present location of a parcel
- Trigger real-time email notifications to users

---

## 🌍 Optional Features

- Display a Google Map with:
  - A route line connecting pickup and destination points
  - Computed travel distance and estimated journey duration
- Real-time email notifications when:
  - Parcel status changes
  - Parcel present location changes

---

## ⚠️ Business Rules

- A parcel delivery order **can only be canceled or updated** if its status is **not marked as delivered**
- Only the **user who created the delivery order** can cancel or modify it
- Admins have full control over parcel status and location updates

---

## 🛠️ Tech Stack

### Backend
- Ruby on Rails (API)
- PostgreSQL (Database)
- Minitest (Testing)

### Frontend
- React.js
- Redux Toolkit (State Management)
- Jest (Testing)
- Google Maps API

---

All major features are covered with unit and integration tests to ensure application reliability.

---

## 🎨 Design & Wireframes

- Wireframes designed using **Figma**
- Fully responsive and mobile-friendly UI

---

## 🚀 Getting Started

### Prerequisites
- Ruby
- Rails
- PostgreSQL
- Node.js & npm
- Google Maps API Key

---