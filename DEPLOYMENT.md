# SKRT Transport ERP — Deployment Guide

## Architecture Overview

```
Frontend (Next.js 16)  ──────►  Vercel
Backend (Node.js/Express 5) ───► Render / Railway
Database (MongoDB Atlas) ───────► MongoDB Atlas (skrt.vmtncha.mongodb.net)
File Storage (Cloudinary) ──────► Cloudinary (dqlilqo7t)
```

---

## ✅ Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Step 1 — Backend
```bash
cd backend
npm install
node seed-admin.js       # Creates admin@skrt.com / Admin@1234
npm run dev              # Starts on http://localhost:5000
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:3001
```

### Login
| Role    | Email                | Password      |
|---------|----------------------|---------------|
| Admin   | admin@skrt.com       | Admin@1234    |
| Manager | manager@skrt.com     | Manager@1234  |

---

## 🚀 Production Deployment

### Database — MongoDB Atlas
The database `skrt_transport` is already configured at:
- **Host**: `skrt.vmtncha.mongodb.net`
- **Database**: `skrt_transport`
- ✅ Connection string is in backend `.env`

> [!IMPORTANT]
> **Action Required**: Go to MongoDB Atlas → Network Access → Add IP Address → Add `0.0.0.0/0` to allow all IPs (needed for Render/Railway dynamic IPs).

---

### Backend — Deploy to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Node Version**: 18

4. Add Environment Variables:
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://parthmaniyar1211_db_user:EPl63F9DoqvZc7c1@skrt.vmtncha.mongodb.net/skrt_transport?appName=Skrt&tls=true&tlsAllowInvalidCertificates=false
JWT_SECRET=5f390ce52d11e14d0b3922acad1df6724dc9c5684f88318da192f97860751f65
JWT_EXPIRE=30d
FRONTEND_URL=https://your-skrt-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=dqlilqo7t
CLOUDINARY_API_KEY=216686293897981
CLOUDINARY_API_SECRET=y2tlzw3qUV72hAOu4pRYqvwQHss
```

5. Deploy → Copy the URL (e.g., `https://skrt-backend.onrender.com`)

---

### Frontend — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js

4. Add Environment Variables:
```
NEXT_PUBLIC_API_URL=https://skrt-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://skrt-backend.onrender.com
```

5. Deploy → Your frontend URL will be shown (e.g., `https://skrt.vercel.app`)

6. **Update Backend CORS**: Go to Render → Environment → Update `FRONTEND_URL` to your Vercel URL

---

## 📋 All API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Private | Get own profile |
| PUT | `/api/auth/profile` | Private | Update own profile |
| POST | `/api/auth/change-password` | Private | Change own password |
| POST | `/api/auth/register` | Admin/Manager | Create user |
| GET | `/api/auth/users` | Admin | List all users |
| PUT | `/api/auth/users/:id` | Admin | Update user |
| DELETE | `/api/auth/users/:id` | Admin | Delete user |
| POST | `/api/auth/users/:id/reset-password` | Admin | Reset user password |

### Shipments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List (supports `?status=&search=`) |
| POST | `/api/shipments` | Create |
| GET | `/api/shipments/next-number` | Get next consignment number |
| GET | `/api/shipments/:id` | Get by ID |
| PUT | `/api/shipments/:id` | Update |
| DELETE | `/api/shipments/:id` | Delete |
| PATCH | `/api/shipments/:id/status` | Update status |

### Other Modules
All modules (inventory, clients, vehicles, drivers, challans, cash-memo, entry, delivery-statement, summary) follow the same REST pattern.

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats from MongoDB |
| GET | `/api/analytics/detailed` | Weekly/monthly trends |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file to Cloudinary (base64) |
| DELETE | `/api/upload/:publicId` | Delete file from Cloudinary |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + DB status |
| GET | `/api/search?q=` | Global search |

---

## 🔒 Role Permissions

| Feature | Admin | Manager | Driver | Client |
|---------|-------|---------|--------|--------|
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Shipments | Full | Full | View Own | View Own |
| Inventory | Full | Full | ❌ | ❌ |
| Challans | Full | Full | ❌ | ❌ |
| Cash Memos | Full | Full | ❌ | ❌ |
| Clients | Full | Full | ❌ | Own |
| Vehicles | Full | View | ❌ | ❌ |
| Settings | Full | Profile Only | Profile Only | Profile Only |
| User Management | ✅ Admin Only | ❌ | ❌ | ❌ |

---

## 🔧 Environment Variables Reference

### Backend (backend/.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_EXPIRE` | No | Token expiry (default: 30d) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

### Frontend (frontend/.env.local)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Backend Socket.io URL |

---

## 🔍 Verification Commands

```bash
# Check health
curl https://skrt-backend.onrender.com/api/health

# Test login
curl -X POST https://skrt-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skrt.com","password":"Admin@1234"}'
```

---

## ⚠️ Important Notes

1. **MongoDB Atlas IP Whitelist**: Add `0.0.0.0/0` for production (Render uses dynamic IPs)
2. **Seed Script**: Only run once. It's idempotent but will skip existing users.
3. **Socket.io**: Uses polling fallback if WebSockets are blocked by proxy
4. **File Upload**: Accepts base64 encoded files. Max size: 10MB.
5. **Rate Limiting**: Auth endpoints limited to 50 req/15min. General API: 1000 req/15min.
