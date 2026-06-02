# SKRT Enterprise Portal — Installation Manual

> **Sant Kanwar Ram Transport Corp.** — Enterprise Logistics Management System
> Built with Next.js 16 + Express 5 + MongoDB + Socket.io

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Step-by-Step Installation](#4-step-by-step-installation)
5. [Configuration](#5-configuration)
6. [Running the Application](#6-running-the-application)
7. [Default Login Credentials](#7-default-login-credentials)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Common Tasks](#9-common-tasks)
10. [Troubleshooting](#10-troubleshooting)
11. [Deployment](#11-deployment)
12. [Architecture Overview](#12-architecture-overview)

---

## 1. System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| MongoDB | 6.x | 7.x |
| RAM | 4 GB | 8 GB |
| Disk Space | 1 GB | 5 GB |
| OS | Windows / macOS / Linux | Any |

### Required Software

- **Node.js** (v18+): [Download](https://nodejs.org/)
- **MongoDB**: [Install Guide](https://www.mongodb.com/docs/manual/installation/)
- **Git**: [Download](https://git-scm.com/)
- **Code Editor** (recommended): VS Code

---

## 2. Technology Stack

### Backend (`backend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 5.x | HTTP server framework |
| Mongoose | 9.x | MongoDB ODM |
| Socket.io | 4.x | Real-time tracking updates |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 3.x | Password hashing |
| Cloudinary SDK | 2.x | File/image uploads |
| helmet | 8.x | Security headers |
| express-rate-limit | 8.x | API rate limiting |
| joi | 18.x | Request validation |
| cors | 2.x | Cross-origin support |
| dotenv | 17.x | Environment variables |

### Frontend (`frontend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.6 | React framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS |
| shadcn/ui (Radix) | latest | UI component library |
| Axios | 1.x | HTTP client |
| Recharts | 3.x | Charts & analytics |
| Framer Motion | 12.x | Animations |
| Sonner | 2.x | Toast notifications |
| TanStack React Query | 5.x | Server state management |
| Lucide React | latest | Icons |
| Socket.io Client | 4.x | Real-time tracking |

---

## 3. Project Structure

```
enterprise/
├── backend/                          # Express API server
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── seed.js                       # Database seeder
│   ├── check_db.js                   # DB connection test
│   ├── vercel.json                   # Vercel deployment config
│   └── src/
│       ├── server.js                 # Entry point (HTTP + Socket.io)
│       ├── app.js                    # Express app setup + route registration
│       ├── config/
│       │   └── db.js                 # MongoDB connection
│       ├── middleware/
│       │   └── authMiddleware.js     # JWT verification
│       ├── utils/
│       │   ├── generateToken.js      # JWT token generator
│       │   └── response.js           # Response helpers
│       └── modules/                  # Feature modules (each has model + controller + routes)
│           ├── auth/                 # Login, register, profile
│           ├── analytics/            # Dashboard stats
│           ├── cash-memo/            # Cash memo forms
│           ├── challan/              # Transport challans
│           ├── clients/              # Client management
│           ├── contacts/             # Consignor/consignee contacts
│           ├── delivery-statement/   # Delivery statements
│           ├── drivers/              # Driver records
│           ├── entry/                # Entry registers
│           ├── expenses/             # Fleet expenses
│           ├── inventory/            # Warehouse inventory
│           ├── invoices/             # Billing/invoices
│           ├── notifications/        # System notifications
│           ├── search/               # Global search endpoint
│           ├── shipments/            # Consignment management
│           ├── summary/              # Daily summaries
│           ├── tracking/             # Live GPS tracking
│           └── vehicles/             # Fleet vehicles
│
├── frontend/                         # Next.js client
│   ├── .env.local                    # Frontend env vars
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── components.json               # shadcn/ui config
│   ├── vercel.json
│   └── src/
│       ├── app/                      # Next.js App Router pages
│       │   ├── layout.tsx            # Root layout (AuthProvider)
│       │   ├── page.tsx              # Landing/redirect page
│       │   ├── globals.css           # Global styles + Tailwind
│       │   ├── login/                # Login page
│       │   ├── dashboard/            # Dashboard
│       │   ├── shipments/            # Shipments listing
│       │   ├── inventory/            # Inventory
│       │   ├── invoices/             # Invoices
│       │   ├── clients/              # Clients
│       │   ├── fleet/                # Vehicles
│       │   ├── drivers/              # Drivers
│       │   ├── analytics/            # Charts & analytics
│       │   ├── expenses/             # Expenses
│       │   ├── tracking/             # Live tracking
│       │   ├── entry/                # Entry register
│       │   ├── summary/              # Daily summary
│       │   ├── delivery-statement/   # Delivery statement
│       │   ├── challan/              # Challan form
│       │   ├── cash-memo/            # Cash memo
│       │   ├── settings/             # User settings
│       │   └── notifications/        # Notifications
│       ├── components/
│       │   ├── ui/                   # shadcn/ui primitives
│       │   ├── layout/               # DashboardLayout, Sidebar, etc.
│       │   ├── auth/                 # ProtectedRoute
│       │   ├── shipments/            # Shipment dialogs
│       │   ├── inventory/            # Inventory dialogs
│       │   ├── clients/              # Client dialogs
│       │   ├── drivers/              # Driver dialogs
│       │   ├── fleet/                # Vehicle dialogs
│       │   ├── expenses/             # Expense dialogs
│       │   └── test/                 # Test files
│       ├── context/
│       │   ├── AuthContext.tsx        # Auth state management
│       │   └── HeaderContext.tsx      # Header search state
│       └── lib/
│           ├── api.ts                # Axios instance with interceptors
│           └── utils.ts              # Utility functions (cn)
│
└── INSTALLATION.md                   # This file
```

---

## 4. Step-by-Step Installation

### Step 1: Install Prerequisites

```bash
# Verify Node.js is installed
node --version    # Should be v18 or higher

# Verify npm is installed
npm --version     # Should be v9 or higher

# Verify MongoDB
mongod --version  # Should be v6 or higher
```

If MongoDB is not installed:

**Windows:**
1. Download installer from https://www.mongodb.com/try/download/community
2. Run installer (select "Complete" setup)
3. MongoDB will run as a Windows service automatically

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB GPG key and add repository
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd Inventory/project1/enterprise
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit as needed)
# The .env file comes pre-configured for local development
```

Default `backend/.env` contents:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ttc_enterprise
JWT_SECRET=your_super_secret_jwt_key_123!
CLOUDINARY_CLOUD_NAME=dv7tcudnv
CLOUDINARY_API_KEY=368652942239883
CLOUDINARY_API_SECRET=8csLUdohWK0AmTg7zuUfgITjgIo
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

> **Note:** The JWT_SECRET, Cloudinary credentials, and Mapbox token shown here are development/test values. **Change them for production.**

### Step 4: Seed the Database

```bash
# Make sure MongoDB is running
node seed.js
```

This creates:
- **Admin user:** `admin@ttc.com` / `password123`
- 2 sample vehicles
- 2 sample shipments
- 1 sample invoice
- 3 sample inventory records

### Step 5: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# The .env.local comes pre-configured
# Verify NEXT_PUBLIC_API_URL points to your backend
```

Default `frontend/.env.local` contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MAPBOX_TOKEN=cYZ2Vr1Sc70gtVljbiZsHFF2SV4
```

> **Note:** The Mapbox token shown is a development token. Replace with your own Mapbox token for production.

### Step 6: Verify MongoDB Connection

```bash
cd backend
node check_db.js
```

Expected output: `Connected successfully to MongoDB`

---

## 5. Configuration

### Backend Configuration (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Backend server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (for image uploads) |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `NODE_ENV` | Yes | `development` or `production` |
| `FRONTEND_URL` | Yes | Frontend URL for CORS (e.g., `http://localhost:3001`) |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (include `/api` suffix) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox token for maps in tracking page |

### CORS Configuration

The backend allows requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- The value of `FRONTEND_URL` in `.env`

Add additional origins in `backend/src/app.js` if needed.

---

## 6. Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm start
```

Expected output:
```
MongoDB Connected: 127.0.0.1
🚀 SKRT Server running on port 5000
```

> For development with auto-restart, install nodemon globally and use:
> ```bash
> npx nodemon src/server.js
> ```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 16.2.6 (Turbopack)
- Local: http://localhost:3001
✓ Ready in 3.2s
```

### Access the Application

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 7. Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ttc.com` | `password123` |

After first login, change the password via **Settings** page.

To create additional users, use the registration API endpoint (admin only):
```
POST /api/auth/register
Body: { "name": "...", "email": "...", "password": "...", "role": "operator" }
```

Available roles: `admin`, `manager`, `operator`, `driver`, `client`

---

## 8. Environment Variables Reference

### Complete Backend `.env` Reference

```env
# Server
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ttc_enterprise

# Authentication
JWT_SECRET=<change-this-in-production>

# Cloudinary (optional — for image/file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Environment
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001
```

### Complete Frontend `.env.local` Reference

```env
# Backend API URL (must include /api suffix)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Mapbox token for tracking map (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
```

---

## 9. Common Tasks

### Seeding the Database

Run the seed script to populate initial data:

```bash
cd backend
node seed.js
```

The seed script will:
- Drop existing collections
- Create admin user
- Create sample vehicles, shipments, invoices, inventory records
- Display summary of created records

### Testing MongoDB Connection

```bash
cd backend
node check_db.js
```

### Building Frontend for Production

```bash
cd frontend
npm run build
```

This generates an optimized `.next` build in `frontend/.next/`.

### Linting

```bash
cd frontend
npm run lint
```

### Adding a New Module

Each backend module follows the pattern:

```
src/modules/<name>/
├── model.js       # Mongoose schema + model
├── controller.js  # Request handlers
└── routes.js      # Express router
```

Steps to add:
1. Create the module directory with model, controller, routes
2. Register routes in `backend/src/app.js`:
   ```js
   app.use('/api/<name>', require('./modules/<name>/routes'));
   ```

---

## 10. Troubleshooting

### "MongoDB Connection Error: connect ECONNREFUSED"

**Cause:** MongoDB is not running.

**Fix:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### "Not allowed by CORS"

**Cause:** Frontend URL not whitelisted.

**Fix:** Add your frontend URL to `allowedOrigins` in `backend/src/app.js` or update `FRONTEND_URL` in `.env`.

### "Missing credentials" / 401 on API calls

**Cause:** JWT token missing or expired.

**Fix:** Log out and log in again. Check `localStorage` for `token` key in browser DevTools.

### "Cannot find module '...'"

**Cause:** Dependencies not installed.

**Fix:**
```bash
cd backend && npm install
cd frontend && npm install
```

### Port already in use

**Cause:** Another process is using port 5000 or 3001.

**Fix:** Change the port in `.env` (backend) or `package.json` (frontend `dev` script's `-p` flag).

### "MongooseError: Operation `...` buffering timed out"

**Cause:** MongoDB connection was lost or never established.

**Fix:** Check MongoDB is running and `MONGODB_URI` is correct. Restart both MongoDB and the backend server.

### Frontend shows blank page / white screen

**Fix:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Clear browser cache and localStorage
4. Rebuild: `npm run build`

---

## 11. Deployment

### Deploy to Vercel

Both backend and frontend have `vercel.json` configurations.

**Backend:**
```bash
cd backend
npx vercel --prod
```

**Frontend:**
```bash
cd frontend
npx vercel --prod
```

> Set environment variables in Vercel dashboard for each project.

### Production Considerations

1. **Change JWT_SECRET** to a strong random value
2. **Set `NODE_ENV=production`** in backend
3. **Use MongoDB Atlas** for managed database
4. **Enable HTTPS** (Vercel provides this by default)
5. **Set up proper CORS origins** to only allow your production domain
6. **Remove or secure** development keys (Cloudinary, Mapbox)
7. **Set up MongoDB backups** (Atlas provides automated backups)
8. **Use PM2** or similar process manager for Node.js (if not using Vercel):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name skrt-backend
   pm2 save
   pm2 startup
   ```

### Environment Variables for Production

Set these in your hosting platform:

**Backend (Vercel):**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/ttc_enterprise
JWT_SECRET=<long-random-string>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app/api
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
```

---

## 12. Architecture Overview

### Data Flow

```
Browser (Next.js)
    │
    ├── Axios ──HTTP──▶ Express API ──Mongoose──▶ MongoDB
    │                    │
    └── Socket.io Client ──WebSocket──▶ Socket.io Server
                                         │
                                         └── Real-time tracking updates
```

### Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Backend validates → returns JWT token
3. Frontend stores token in localStorage
4. Every subsequent request includes Authorization: Bearer <token>
5. Auth middleware verifies token on protected routes
6. Token expiry → 401 → redirect to login
```

### Key Design Decisions

- **Page-based architecture:** Each major feature (Shipments, Inventory, Invoices, etc.) has its own page under `src/app/` and its own backend module under `src/modules/`
- **Search:** Global header search queries a dedicated `/api/search` endpoint that searches across all observation collections in parallel (Shipments, Invoices, Vehicles, Clients, Inventory, Tracking)
- **Real-time tracking:** Socket.io broadcasts location updates. Frontend listens on specific shipment channels for live map updates
- **Data-entry forms** (Entry, Summary, DS, Challan, Cash Memo) are blank daily forms — always POST (never PUT), auto-generate sequence numbers, and reset after save
- **Driver data** is stored in a dedicated Driver collection with vehicle number as key. Vehicle/Driver dropdowns source from this collection, with an "Others" option for manual entry of unregistered vehicles/drivers
- **All API routes** except login require authentication via JWT middleware

### MongoDB Collections Overview

| Collection | Stores | Key Relationships |
|------------|--------|-------------------|
| `users` | Authentication & user roles | — |
| `shipments` | Consignment records | Uses driver's `vehicleNumber` as string ref |
| `inventories` | Warehouse stock | Links to challans |
| `invoices` | Billing records | References shipment ID |
| `vehicles` | Fleet vehicles | Referenced by tracking |
| `drivers` | Driver info (name, phone, vehicle) | Keyed by `vehicleNumber` |
| `trackings` | Live GPS data | References vehicle ID |
| `clients` | Client companies | Used in invoice subdocs |
| `contacts` | Consignor/consignee addresses | Used in shipments |
| `expenses` | Fleet expenses | References vehicle |
| `notifications` | System alerts | References user (nullable) |
| `entryregisters` | Daily entry forms | Date-keyed |
| `summaryregisters` | Daily summaries | Date-keyed |
| `deliverystatements` | Delivery statements | Date + pageNo-keyed |
| `challans` | Transport challans | Date-keyed |
| `cashmemos` | Cash memos | GR No. / DR No. indexed |
| `seeddata` | Seeding metadata | Internal use |
