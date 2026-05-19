# TTC Logistics Backend

Node.js + Express backend for Travancore Transport Company portal.

## Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: Session-based (express-session)
- **Database**: LowDB (JSON file — no install needed, zero config)
- **Password hashing**: bcryptjs

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
http://localhost:3000
```

## Default Login
| Username | Password |
|---|---|
| `ttc_bhilwara` | `ttc@1234` |

> Change this password immediately after first login via your profile settings.

## Project Structure
```
ttc-backend/
├── server.js          ← Main app (all routes)
├── package.json
├── data/
│   └── ttc.json       ← Database (auto-created on first run)
└── public/
    ├── index.html     ← Login page
    ├── login.html     ← Login page
    └── dashboard.html ← Main dashboard
```

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/logout` | Logout (destroy session) |
| GET | `/api/auth/me` | Get current session user |
| POST | `/api/auth/change-password` | Change own password |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/stats` | Inventory, monthly, today stats |

### Consignments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/consignments` | List all (filter: `?q=TTC001&status=booked`) |
| GET | `/api/consignments/:cnNo` | Get single consignment |
| POST | `/api/consignments` | Create new consignment |
| PATCH | `/api/consignments/:cnNo/status` | Update status |

### Lorries
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/lorries` | List all lorries |
| POST | `/api/lorries` | Add lorry |
| DELETE | `/api/lorries/:id` | Delete lorry |

### Trips (Outgoing)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create trip (auto-dispatches linked CNs) |
| PATCH | `/api/trips/:id/status` | Update trip status |

### Challans
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/challans` | List all challans |
| POST | `/api/challans/by-id` | Create challan from CN list |
| POST | `/api/challans/by-filter` | Create challan by destination filter |

### Incoming Trips
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/incoming-trips` | List all incoming trips |
| POST | `/api/incoming-trips` | Record incoming trip |

### Users (Admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| DELETE | `/api/users/:id` | Delete user |

## Consignment Status Flow
```
booked → inventory → dispatched → in-transit → delivered
                                              → cancelled
```

## Deployment Notes
- For production, set `SESSION_SECRET` env variable and `secure: true` on cookies (requires HTTPS)
- Data is stored in `data/ttc.json` — back this file up regularly
- To migrate to PostgreSQL/MySQL later, only `server.js` needs updating (replace `db.get(...)` calls)
