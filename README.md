# Sweety – Blood Glucose Tracker (PERN Stack)

Sweety is a blood glucose tracking web application designed for diabetes patients to record up to 4 readings per day (mg/dl), edit or delete them, and view three real-time reports: **Daily**, **Month-to-date**, and **Monthly** (previous month).

> **Architecture Stack:** PostgreSQL 16 + Express 4 + React 18 (Vite) + Node.js 20 LTS (**PERN**).

---

## Repository Structure (Monorepo)

```text
sweety/
├── README.md                          # Complete setup, testing, and architecture guide
├── .gitignore                         # Root gitignore
├── .env.example                       # Root environment template (used by docker-compose)
├── docker-compose.yml                 # Local PostgreSQL 16 container setup
│
├── server/                            # BACKEND API (Express + PostgreSQL + Knex)
│   ├── package.json                   # Dependencies & scripts
│   ├── .env.example                   # Server environment template
│   ├── .env                           # Server local environment configuration
│   ├── knexfile.js                    # Knex configuration (dev, test, prod)
│   ├── migrations/                    # Database schema migrations
│   │   ├── 001_create_users.js        # Users table + case-insensitive email index
│   │   └── 002_create_readings.js     # Readings table + slot enum + 40-600 check
│   ├── seeds/
│   │   └── 001_demo_user.js           # Idempotent demo user seed script
│   ├── src/
│   │   ├── server.js                  # App bootstrap, DB ping & graceful shutdown
│   │   ├── app.js                     # Express app setup (exported for tests)
│   │   ├── config/env.js              # Environment loader & validator
│   │   ├── constants/slots.js         # Canonical slots mapping & UI labels
│   │   ├── db/knex.js                 # Knex database client & query proxy
│   │   ├── middleware/
│   │   │   ├── requireAuth.js          # JWT Bearer token authentication guard
│   │   │   ├── validate.js             # Zod schema validation middleware
│   │   │   ├── errorHandler.js         # Standard error response formatter
│   │   │   └── notFound.js             # 404 handler
│   │   ├── repositories/
│   │   │   ├── user.repository.js      # User queries
│   │   │   ├── reading.repository.js   # Reading queries (user-scoped)
│   │   │   └── report.repository.js    # Aggregate statistical SQL query
│   │   ├── services/
│   │   │   ├── auth.service.js         # Auth business logic (bcrypt, JWT)
│   │   │   ├── reading.service.js      # Concurrency lock & domain rules
│   │   │   └── report.service.js       # Date range resolutions & report aggregations
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # Auth HTTP handlers
│   │   │   ├── readings.controller.js  # Readings HTTP handlers
│   │   │   └── report.controller.js    # Reports HTTP handlers
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # /api/auth routes
│   │   │   ├── readings.routes.js      # /api/readings routes
│   │   │   └── reports.routes.js       # /api/reports routes
│   │   ├── validators/
│   │   │   ├── auth.schema.js          # Auth Zod schemas
│   │   │   ├── reading.schema.js       # Reading Zod schemas
│   │   │   └── report.schema.js        # Report Zod schemas
│   │   └── utils/
│   │       ├── AppError.js             # Custom operational error class
│   │       ├── asyncHandler.js         # Async error wrapper
│   │       ├── dates.js                # Timezone & date range utilities
│   │       └── jwt.js                  # JWT token helpers
│   └── tests/
│       ├── setup.js                    # Test database lifecycle & migrations
│       ├── auth.test.js                # Auth suite (register, login, timing leak)
│       ├── readings.test.js            # Readings validation & isolation suite
│       ├── reports.test.js             # Reports boundaries & statistics suite
│       └── dates.util.test.js          # Pure date arithmetic & leap year suite
│
└── client/                            # FRONTEND SPA (React 18 + Vite + Tailwind)
    ├── package.json                   # Client dependencies (React, Axios, Router, Lucide)
    ├── vite.config.js                 # Vite configuration
    ├── index.html                     # HTML entry point
    ├── .env.example                   # Client environment template
    ├── .env                           # Client local environment configuration
    └── src/
        ├── main.jsx                   # React root entry
        ├── App.jsx                    # Router, AuthProvider & layout
        ├── api/
        │   ├── axiosClient.js         # Axios instance with JWT interceptor & 401 handler
        │   ├── auth.api.js            # Auth endpoints
        │   ├── readings.api.js        # Readings CRUD endpoints
        │   └── reports.api.js         # Daily, Month-to-date, Monthly endpoints
        ├── context/
        │   └── AuthContext.jsx        # User state, token, login, register, logout
        ├── routes/
        │   └── ProtectedRoute.jsx     # Route guard with session-loading spinner
        ├── pages/
        │   ├── Dashboard.jsx          # Today's 4 slots at a glance & quick add
        │   ├── Readings.jsx           # Date picker, daily reading rows, CRUD modal
        │   ├── Reports.jsx            # Date picker + tabs (Daily, MTD, Monthly)
        │   ├── Login.jsx              # Sign-in with one-click demo credentials
        │   ├── Register.jsx           # Sign-up form with input validations
        │   └── NotFound.jsx           # 404 fallback page
        ├── components/
        │   ├── Navbar.jsx             # Top bar navigation & user profile
        │   ├── DatePicker.jsx         # Accessible date selector with next/prev buttons
        │   ├── ReadingForm.jsx        # Add/edit form with validations & slot indicators
        │   ├── ReadingList.jsx        # Daily reading list & medical disclaimer
        │   ├── ReadingRow.jsx         # Reading card with color hints (green/amber/red)
        │   ├── ReportCard.jsx         # 4 stat tiles (Highest, Lowest, Average, Count)
        │   ├── EmptyState.jsx         # Friendly empty state with CTA
        │   ├── ErrorAlert.jsx         # Accessible error alert (aria-live)
        │   └── Spinner.jsx            # Loading indicator
        ├── constants/
        │   └── slots.js               # Slots mappings & labels
        ├── utils/
        │   ├── dates.js               # Date formatting utilities
        │   └── errors.js              # API error message extraction
        └── styles/
            └── index.css              # Tailwind CSS styling & animations
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20+ LTS
- **PostgreSQL**: v14+ or Docker

---

### 2. Database Setup

#### Option A: Using Docker Compose
```bash
docker compose up -d db
```
This runs PostgreSQL 16 on port `5432` with user `sweety`, password `sweety`, and database `sweety`.

#### Option B: Local PostgreSQL Installation
```sql
CREATE USER sweety WITH PASSWORD 'sweety';
CREATE DATABASE sweety OWNER sweety;
CREATE DATABASE sweety_test OWNER sweety;
```

---

### 3. Backend Setup & Run

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Run migrations and seed the database:
   ```bash
   npm run migrate
   npm run seed
   ```

4. Start the backend API server:
   ```bash
   npm run dev
   ```
   *The API will start listening on `http://localhost:5000`.*

5. Run Backend Tests:
   ```bash
   npm test
   ```
   *Runs all 42 automated integration and unit tests.*

---

### 4. Frontend Setup & Run

1. In a separate terminal, navigate to the `client/` directory:
   ```bash
   cd client
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## Demo Account Credentials
- **Email:** `demo@sweety.app`
- **Password:** `Demo@1234`
*(A convenient "Auto-fill Demo" button is also present on the Login page).*
