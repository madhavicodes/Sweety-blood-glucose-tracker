# Sweety – Blood Glucose Tracker (PERN Stack)

Sweety is a blood glucose tracking web application designed for diabetes patients to record up to 4 readings per day (mg/dl), edit or delete them, and view reports (Daily, Month-to-date, Monthly).

> **Stack Note:** While often referred to in MERN templates, the database is PostgreSQL, making this architecture truly **PERN** (PostgreSQL, Express, React, Node.js).

---

## Repository Structure

```text
sweety/
├── README.md                  # Complete project documentation and API guide
├── .gitignore                 # Root gitignore
├── .env.example               # Root environment template (used by docker-compose)
├── docker-compose.yml         # Local PostgreSQL container service
├── server/
│   ├── package.json           # Backend dependencies and scripts
│   ├── .env.example           # Server environment template
│   ├── .env                   # Local server environment configuration
│   ├── knexfile.js            # Knex connection & migration config
│   ├── migrations/            # Database schema migrations
│   │   ├── 001_create_users.js
│   │   └── 002_create_readings.js
│   ├── seeds/
│   │   └── 001_demo_user.js   # Idempotent demo seed script
│   ├── src/
│   │   ├── server.js          # Startup listener & graceful shutdown
│   │   ├── app.js             # Express app setup (exported for tests)
│   │   ├── config/env.js      # Environment loader & validator
│   │   ├── constants/slots.js # Canonical slot enum mappings and labels
│   │   ├── db/knex.js         # Knex database client & proxy
│   │   ├── middleware/
│   │   │   ├── requireAuth.js  # JWT Bearer authentication guard
│   │   │   ├── validate.js     # Zod request validator
│   │   │   ├── errorHandler.js # Standard error response formatter
│   │   │   └── notFound.js     # 404 handler
│   │   ├── repositories/
│   │   │   ├── user.repository.js    # User SQL queries
│   │   │   └── reading.repository.js # Reading SQL queries (userId-scoped)
│   │   ├── services/
│   │   │   ├── auth.service.js       # Auth logic (bcrypt, JWT, timing protection)
│   │   │   └── reading.service.js    # Reading rules & transaction locking
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Auth HTTP response handler
│   │   │   └── readings.controller.js# Readings HTTP response handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth route definitions
│   │   │   ├── readings.routes.js    # Readings route definitions
│   │   │   └── reports.routes.js     # Reports route definitions
│   │   ├── validators/
│   │   │   ├── auth.schema.js        # Auth Zod schemas
│   │   │   └── reading.schema.js     # Reading Zod schemas
│   │   └── utils/
│   │       ├── AppError.js           # Custom operational error class
│   │       ├── asyncHandler.js       # Route async wrapper
│   │       ├── dates.js              # Timezone-safe date arithmetic & ranges
│   │       └── jwt.js                # JWT sign and verify helpers
│   └── tests/
│       ├── setup.js                  # Test database lifecycle & migration runner
│       ├── auth.test.js              # Auth suite (registration, login, JWT)
│       ├── readings.test.js          # Readings validation, CRUD & isolation suite
│       └── dates.util.test.js        # Date ranges, leap year & rollover suite
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20+ LTS
- **PostgreSQL**: 14+ or Docker Desktop

### 2. Database Setup (via Docker Compose)
From the repository root:
```bash
docker compose up -d db
```
This spins up PostgreSQL 16 on port `5432` with user `sweety`, password `sweety`, and database `sweety`.

Alternatively, use your local PostgreSQL installation:
```sql
CREATE USER sweety WITH PASSWORD 'sweety';
CREATE DATABASE sweety OWNER sweety;
CREATE DATABASE sweety_test OWNER sweety;
```

### 3. Server Setup
```bash
cd server
npm install
```

Copy the environment file (a pre-configured `.env` is already provided):
```bash
cp .env.example .env
```

Run database migrations:
```bash
npm run migrate
```

Seed initial demo data (idempotent):
```bash
npm run seed
```

### 4. Running the Server
```bash
npm run dev
```
The server starts listening on `http://localhost:5000`.

### 5. Running the Tests
```bash
npm test
```
To run tests with full coverage report:
```bash
npm run test:coverage
```
*Note: The test suite automatically runs seamlessly against the test database, or defaults to an in-memory database if an external instance is offline.*

---

## Architectural Decisions & Core Rules

1. **Layer Responsibilities:**
   - **Routes**: Define path and middleware chains only.
   - **Controllers**: Extract request parameters, invoke service, shape HTTP responses. Never contain SQL or business logic.
   - **Services**: Enforce domain validation, ordering of rules, date checks, and transactional row locking. Throw `AppError`.
   - **Repositories**: Encapsulate all database interaction using Knex query builder. Every query strictly enforces `user_id = req.user.id`.

2. **Validation Order of Precedence:**
   1. Value required and integer check (`Zod`).
   2. Glucose range 40–600 mg/dl (`Zod` + DB `CHECK`).
   3. Slot validity and date format (`Zod`).
   4. Date cannot be in the future (compared against `APP_TIMEZONE` today).
   5. Maximum 4 readings per day (evaluated inside user row lock).
   6. Duplicate slot on selected date (evaluated inside user row lock + DB `UNIQUE`).

3. **Concurrency & Race Condition Prevention:**
   When adding or updating readings, a database transaction first locks the user row:
   ```javascript
   await trx('users').where({ id: userId }).forUpdate().first();
   ```
   This serializes simultaneous incoming requests per user, eliminating race conditions. If a concurrent clash slips past due to network jitter, PostgreSQL's `23505` constraint violation error is trapped and normalized into the standard `409 DUPLICATE_SLOT` response.

4. **Timing Attack Protection:**
   During authentication, when a user is not found, `bcrypt.compare` is still executed against a pre-computed dummy hash to prevent response-time differences from leaking email presence.

5. **Data Isolation:**
   When attempting to access, edit, or delete another user's reading, the API responds with `404 NOT_FOUND` rather than `403 FORBIDDEN` to prevent resource ID enumeration.
