# Fullstack E-Commerce Storefront & Admin Backoffice Suite

A complete dual-application architecture featuring two separate web applications that interact seamlessly in real-time:

- 🛒 **Customer Application** (`apps/customer-app`): Runs on **http://localhost:5173**
  - Modern storefront catalog, category filtering, instant search.
  - Interactive cart drawer, checkout modal (Pay-in-Store Cashier or Online QRIS proof upload).
  - Real-time order status tracking via Socket.IO.
  
- 👑 **Admin Application** (`apps/admin-app`): Runs on **http://localhost:5174**
  - Executive backoffice dashboard with revenue counters and low-stock alerts.
  - Real-time live order dispatch queue with instant sound/toast alerts upon customer checkout.
  - Full product CRUD management & stock control.
  - Payment gateway controls.

- ⚡ **Shared Backend & DB** (`backend`): Runs on **http://localhost:5001**
  - Express REST API, Prisma ORM, PostgreSQL database schema, and Socket.IO WebSocket bridge.

---

## Repository Structure

```
ecommerce-admin-suite/
├── package.json                 # Monorepo root runner
├── README.md                    # System architecture guide
├── backend/                     # Express REST API + Socket.IO + Prisma
│   ├── prisma/                  # Schema & seed script
│   └── src/                     # Controllers, routes, socket server
└── apps/
    ├── customer-app/            # Customer Web Application (Port 5173)
    └── admin-app/               # Admin Web Application (Port 5174)
```

---

## Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

### 2. Launch Applications

To launch all applications concurrently from the root directory:
```bash
# Run backend, customer app (5173), and admin app (5174) together:
npm run dev:all
```

Or run each app individually:
- **Customer App**: `cd apps/customer-app && npm run dev` (http://localhost:5173)
- **Admin App**: `cd apps/admin-app && npm run dev` (http://localhost:5174)
- **Backend API**: `cd backend && npm run dev` (http://localhost:5001)
