# SmartLeads — Lead Management Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript. Features JWT authentication, role-based access control, advanced filtering, debounced search, CSV export, pagination, dark mode, and a fully responsive UI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, TailwindCSS, Zustand, TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
smart-leads/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routers
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # JWT helpers, response formatters
│   │   ├── validators/     # express-validator chains
│   │   └── index.ts        # App entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + API calls
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── leads/
│   │   │   └── ui/
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route-level page components
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # Shared TypeScript types
│   │   └── utils/          # Helpers (colors, formatters, cn)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

---

## Features

- **Authentication** — Register, login, JWT-protected routes, bcrypt password hashing
- **Leads CRUD** — Create, read, update, delete leads with full validation
- **Advanced Filtering** — Filter by status, source; search by name/email; sort by date
- **Debounced Search** — 400ms debounce on search input for performance
- **Pagination** — Backend pagination (10 per page) with metadata
- **CSV Export** — Download all leads as CSV
- **Role-Based Access** — Admin sees all leads; Sales Users see only their own
- **Dark Mode** — System preference detection + manual toggle
- **Responsive UI** — Mobile-first design with table + card layouts

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Option 1: Manual Setup (Development)

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd smart-leads
```

#### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET
npm install
npm run dev
```

The backend starts on **http://localhost:5000**

#### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**

---

### Option 2: Docker Compose (Recommended)

```bash
# From the project root
cp backend/.env.example backend/.env
# Edit backend/.env — set a strong JWT_SECRET

docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

To stop:
```bash
docker compose down
```

To wipe data volumes too:
```bash
docker compose down -v
```

---

## API Documentation

### Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth Endpoints

#### POST `/auth/register`
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "role": "sales_user"  // or "admin"
}
```
Response: `{ success, message, data: { token, user } }`

#### POST `/auth/login`
```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```
Response: `{ success, message, data: { token, user } }`

#### GET `/auth/me` 🔒
Response: `{ success, message, data: { id, name, email, role } }`

---

### Leads Endpoints (all protected 🔒)

#### GET `/leads`
Query params:
| Param | Type | Description |
|-------|------|-------------|
| `status` | `New \| Contacted \| Qualified \| Lost` | Filter by status |
| `source` | `Website \| Instagram \| Referral` | Filter by source |
| `search` | string | Search by name or email |
| `sort` | `latest \| oldest` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 10, max: 100) |

Response:
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": [...],
  "meta": {
    "totalDocs": 42,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET `/leads/stats` 🔒
Response: `{ total, statusStats, sourceStats }`

#### GET `/leads/export/csv` 🔒
Returns a downloadable CSV file.

#### GET `/leads/:id` 🔒
Response: `{ success, message, data: Lead }`

#### POST `/leads` 🔒
```json
{
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Reached out via DM"
}
```

#### PUT `/leads/:id` 🔒
Same fields as POST (all optional).

#### DELETE `/leads/:id` 🔒
Admin can delete any lead. Sales users can only delete their own.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Secret for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Role-Based Access Control

| Action | Admin | Sales User |
|--------|-------|------------|
| View all leads | ✅ | ❌ (own only) |
| Create lead | ✅ | ✅ |
| Edit any lead | ✅ | Own only |
| Delete any lead | ✅ | Own only |
| Export CSV | ✅ | ✅ (own leads) |
| View stats | ✅ | ✅ (own stats) |

---

## Git Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add CSV export functionality
fix: correct pagination skip calculation
refactor: extract lead filter logic into hook
chore: update dependencies
```
