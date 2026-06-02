# SKRT Enterprise Portal

**Sant Kanwar Ram Transport Corp.** — Enterprise Logistics Management System

Next.js 16 + Express 5 + MongoDB + Socket.io

## Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Analytics overview with charts and KPIs |
| **Shipments** | Consignment booking, tracking, and management |
| **Inventory** | Warehouse stock management with challan generation |
| **Invoices** | Billing and invoice generation |
| **Clients** | Client/party management |
| **Fleet** | Vehicle fleet management |
| **Drivers** | Driver records and vehicle assignment |
| **Tracking** | Real-time GPS tracking via Socket.io |
| **Expenses** | Fleet expense tracking (fuel, maintenance, toll) |
| **Entry** | Daily entry register with GR No. lookup |
| **Summary** | Daily trip summary with driver/vehicle auto-fill |
| **Delivery Statement** | Freight, labour, charges per delivery |
| **Challan** | Transport challan generation and printing |
| **Cash Memo** | Cash memo with freight, labour, commission |
| **Analytics** | Detailed reports and data visualization |
| **Notifications** | System-wide alerts and updates |

## Quick Start

```bash
# Backend
cd backend
npm install
node seed.js
npm start

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3001

**Login:** `admin@ttc.com` / `password123`

## Prerequisites

- Node.js 18+
- MongoDB 6+ (running on localhost:27017)
- npm 9+

## Documentation

- [INSTALLATION.md](INSTALLATION.md) — Full setup guide
- [INSTALLATION.txt](INSTALLATION.txt) — Plain text version

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

**Backend:** Express 5, Mongoose 9, JWT, Socket.io, Cloudinary

**Database:** MongoDB
