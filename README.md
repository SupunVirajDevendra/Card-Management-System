# Card Management System (CMS)

A full-stack web application for managing credit cards, processing card activation and closure requests, and generating operational reports. Built for Epic Lanka as an internal management tool.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
  - [Backend Environment Variables](#backend-environment-variables)
  - [Frontend Environment Variables](#frontend-environment-variables)
- [API Reference](#api-reference)
- [Features](#features)
- [Security](#security)
- [Database Schema](#database-schema)
- [Default Credentials](#default-credentials)

---

## Overview

The Card Management System provides a centralized platform for operations staff to issue and manage credit cards, submit and approve card lifecycle requests, and export data as CSV or PDF reports. The system enforces JWT-based authentication and applies AES-GCM payload encryption on sensitive API requests.

---

## Architecture

The project follows a two-tier client-server architecture:

```
cms-frontend/cms_project   (React SPA, Vite, TypeScript)
        |
        | HTTP/REST (JWT Bearer Token)
        |
cms-backed/cms_bkend       (Spring Boot 3, Java 21)
        |
        | JDBC
        |
   PostgreSQL Database
```

The frontend communicates with the backend exclusively through a RESTful JSON API. All write operations on card and request endpoints encrypt the request payload using AES-GCM (Web Crypto API on the client, AES/GCM/NoPadding on the server) when encryption is enabled.

---

## Technology Stack

### Backend

| Component | Technology |
|-----------|------------|
| Language | Java 21 |
| Framework | Spring Boot 3.5.x |
| Security | Spring Security, JWT (jjwt 0.11.5) |
| Database Access | Spring Data JDBC |
| Database | PostgreSQL |
| Validation | Jakarta Bean Validation |
| API Documentation | SpringDoc OpenAPI (Swagger UI) |
| Report Generation | OpenCSV 5.7.1, OpenPDF 1.3.30 |
| Build Tool | Maven |
| Utilities | Lombok |

### Frontend

| Component | Technology |
|-----------|------------|
| Language | TypeScript 5.9 |
| Framework | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Server State | TanStack React Query 5 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Project Structure

```
assesment1/
├── cms-backed/
│   └── cms_bkend/                        # Spring Boot backend
│       ├── src/main/java/com/epic/cms/
│       │   ├── CmsApplication.java        # Application entry point
│       │   ├── common/                    # Enums (CardStatus, UserRole, RequestStatus, RequestReasonCode)
│       │   ├── config/
│       │   │   ├── security/              # Spring Security config, JWT filter
│       │   │   ├── openapi/               # Swagger/OpenAPI configuration
│       │   │   └── JacksonConfig.java     # JSON serialization configuration
│       │   ├── controller/
│       │   │   ├── auth/                  # AuthController  (login, register, logout)
│       │   │   ├── card/                  # CardController  (CRUD operations)
│       │   │   ├── request/               # CardRequestController (create, process, list)
│       │   │   └── report/                # ReportController, ReportDataController
│       │   ├── service/
│       │   │   ├── auth/                  # AuthService, JwtService, TokenBlacklistService, UserManagementService
│       │   │   ├── card/                  # CardService, CardControllerService, CardEncryptionService, PayloadDecryptionService, EncryptedRequestHandlerService
│       │   │   ├── request/               # CardRequestService
│       │   │   └── report/                # ReportService
│       │   ├── repository/
│       │   │   ├── card/                  # CardRepository
│       │   │   ├── request/               # CardRequestRepository, CardRequestTypeRepository
│       │   │   ├── user/                  # UserRepository
│       │   │   └── status/                # StatusRepository, RequestStatusRepository
│       │   ├── entity/                    # Card, CardRequest, User, Status, CardRequestType
│       │   ├── dto/                       # Request/response DTOs for auth, card, request, report
│       │   ├── mapper/                    # RowMappers and DTO mappers
│       │   ├── exception/                 # GlobalExceptionHandler, custom exceptions
│       │   └── util/                      # CardNumberUtils, CardNumberResolver, Constants
│       └── src/main/resources/
│           ├── application.yaml           # Application configuration
│           ├── schema.sql                 # Database DDL
│           ├── data.sql                   # Seed data
│           └── logback-spring.xml         # Logging configuration
│
└── cms-frontend/
    └── cms_project/                       # React frontend
        ├── src/
        │   ├── main.tsx                   # Application entry point
        │   ├── app/
        │   │   ├── App.tsx                # Root layout component
        │   │   ├── routes.tsx             # Route definitions with auth guards
        │   │   └── QueryProvider.tsx      # React Query provider
        │   ├── pages/
        │   │   ├── LoginPage.tsx          # Authentication page
        │   │   ├── Dashboard.tsx          # Overview, request history, pending approvals
        │   │   ├── CardsPage.tsx          # Paginated card listing
        │   │   ├── CardFormPage.tsx       # Create / edit card form
        │   │   ├── CreateRequestPage.tsx  # Submit card activation or closure request
        │   │   ├── RequestsPage.tsx       # Paginated request listing with approve/reject
        │   │   ├── CardReportPage.tsx     # Card report with CSV/PDF export
        │   │   └── RequestReportPage.tsx  # Request report with CSV/PDF export
        │   ├── components/
        │   │   ├── layout/                # Sidebar, Topbar
        │   │   ├── card/                  # CardTable, CardRow
        │   │   ├── request/               # RequestTable, RequestRow
        │   │   └── common/                # Pagination, StatusBadge, Loader, ConfirmModal, ErrorBoundary
        │   ├── services/
        │   │   ├── api.ts                 # Axios instance with auth and encryption interceptors
        │   │   ├── authService.ts         # Login, logout, token storage
        │   │   ├── cardService.ts         # Card CRUD, stats
        │   │   ├── requestService.ts      # Request create, process, list
        │   │   └── reportService.ts       # Report data fetch and file download
        │   ├── hooks/
        │   │   └── useQueries.ts          # React Query hooks
        │   ├── types/
        │   │   ├── auth.ts                # Auth types and interfaces
        │   │   ├── card.ts                # Card types and interfaces
        │   │   └── request.ts             # Request types and interfaces
        │   └── utils/
        │       ├── crypto.ts              # AES-GCM encryption via Web Crypto API
        │       └── format.ts              # Date/value formatting helpers
        └── public/
```

---

## Prerequisites

- Java 21+
- Maven 3.8+
- Node.js 20+ and npm
- PostgreSQL 14+

---

## Getting Started

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE cms_db;
```

2. Run the schema and seed scripts located in `cms-backed/cms_bkend/src/main/resources/`:

```bash
psql -U postgres -d cms_db -f schema.sql
psql -U postgres -d cms_db -f data.sql
```

Alternatively, set `spring.sql.init.mode: always` in `application.yaml` to have Spring Boot execute the scripts automatically on startup (not recommended for production).

### Backend Setup

1. Navigate to the backend directory:

```bash
cd cms-backed/cms_bkend
```

2. Copy the environment file and adjust values as needed:

```bash
cp .env .env.local
```

3. Build and run the application:

```bash
./mvnw spring-boot:run
```

The server starts on `http://localhost:8080` by default.

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd cms-frontend/cms_project
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and adjust values as needed:

```bash
cp .env .env.local
```

4. Start the development server:

```bash
npm run dev
```

The application starts on `http://localhost:5173` by default.

To build for production:

```bash
npm run build
```

---

## Configuration

### Backend Environment Variables

Defined in `cms-backed/cms_bkend/.env` and referenced in `application.yaml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `cms_db` | Database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `root` | Database password |
| `SERVER_PORT` | `8080` | HTTP server port |
| `JWT_SECRET` | `mySecretKeyForCMSApplication2024` | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` | Token expiry in milliseconds (24 hours) |
| `ENABLE_ENCRYPTION` | `true` | Toggle payload encryption |
| `ENCRYPTION_KEY` | `9fK3xLm8PqR2sT7vXyZ1w4U6nB8cD0eF` | AES encryption key (must match frontend) |
| `ENCRYPTION_SALT` | `cms-salt-2024` | PBKDF2 salt (must match frontend) |
| `LOG_LEVEL` | `INFO` | Root logging level |

### Frontend Environment Variables

Defined in `cms-frontend/cms_project/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend base URL |
| `VITE_API_CARDS` | `/api/cards` | Cards API path |
| `VITE_API_CARD_REQUESTS` | `/api/card-requests` | Card requests API path |
| `VITE_API_AUTH` | `/api/auth` | Auth API path |
| `VITE_API_REPORTS` | `/api/reports` | Reports API path |
| `VITE_ENABLE_ENCRYPTION` | `true` | Toggle payload encryption |
| `VITE_ENCRYPTION_KEY` | `9fK3xLm8PqR2sT7vXyZ1w4U6nB8cD0eF` | AES encryption key (must match backend) |
| `VITE_ENCRYPTION_SALT` | `cms-salt-2024` | PBKDF2 salt (must match backend) |

> **Important:** The `VITE_ENCRYPTION_KEY` and `VITE_ENCRYPTION_SALT` values must be identical to `ENCRYPTION_KEY` and `ENCRYPTION_SALT` on the backend for encrypted requests to be processed correctly.

---

## API Reference

All endpoints (except login and register) require a `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Authenticate and receive a JWT token |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/logout` | Invalidate the current token |

### Cards — `/api/cards`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/cards` | Retrieve all cards |
| `GET` | `/api/cards/paginated` | Retrieve cards with pagination (`page`, `size` query params) |
| `GET` | `/api/cards/{cardIdentifier}` | Retrieve a card by plain number, masked number, or mask ID |
| `POST` | `/api/cards` | Create a new card |
| `PUT` | `/api/cards/{cardIdentifier}` | Update card details |

### Card Requests — `/api/card-requests`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/card-requests` | Retrieve all card requests |
| `GET` | `/api/card-requests/paginated` | Retrieve requests with pagination |
| `GET` | `/api/card-requests/{id}` | Retrieve a specific request by ID |
| `POST` | `/api/card-requests` | Submit a new card request (activation or closure) |
| `PUT` | `/api/card-requests/{id}/process` | Approve or reject a pending request |

### Reports — `/api/reports`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/reports/cards` | Download card report (`format=csv\|pdf`, optional `startDate`, `endDate`, `status`) |
| `GET` | `/api/reports/requests` | Download request report (`format=csv\|pdf`, optional date and status filters) |
| `GET` | `/api/reports/data/cards` | Raw card data for frontend-side report rendering |
| `GET` | `/api/reports/data/requests` | Raw request data for frontend-side report rendering |

---

## Features

### Card Management

- Issue new credit cards with configurable credit limit, cash limit, and expiry date
- View and edit card details
- View card status: Inactive (`IACT`), Active (`CACT`), Deactivated (`DACT`)
- Paginated card listing

### Card Request Workflow

- Submit card activation requests (`ACTI`) and card closure requests (`CDCL`)
- Approve or reject pending requests from the dashboard or the requests page
- Request status tracking: `PENDING`, `APPROVED`, `REJECTED`
- Duplicate request prevention per card

### Dashboard

- KPI summary cards: total cards, active cards, inactive cards, pending approvals
- Request history search with filtering by type and card identifier
- Inline pending approval queue with one-click approve and reject actions

### Reporting

- Generate card and request reports filtered by date range and status
- Export reports as CSV or PDF
- Reports are generated server-side using OpenCSV and OpenPDF

### Security

- JWT-based stateless authentication with configurable token expiry
- Token blacklisting on logout (in-memory)
- BCrypt password hashing
- AES-GCM payload encryption for all card and request write operations
- Card numbers stored encrypted in the database (AES/ECB/PKCS5Padding)
- Card numbers masked in API responses and reports

---

## Security

### Authentication Flow

1. The user submits credentials to `POST /api/auth/login`.
2. The backend validates credentials against the `users` table using BCrypt.
3. On success, a signed JWT token is returned and stored in `localStorage` by the frontend.
4. All subsequent API requests include the token in the `Authorization` header.
5. On logout, the token is added to an in-memory blacklist and removed from `localStorage`.

### Payload Encryption

Write requests to card and request endpoints are encrypted when `ENABLE_ENCRYPTION=true`:

- **Frontend:** The request body is serialized to JSON, encrypted with AES-GCM (256-bit key derived via PBKDF2 with SHA-256, 100,000 iterations), and transmitted as a Base64-encoded string in a `{ "payload": "..." }` envelope.
- **Backend:** The `EncryptedRequestHandlerService` detects the encrypted envelope and decrypts it using the corresponding key and salt before deserializing into the target DTO.

Report endpoints and authentication endpoints are excluded from payload encryption.

### Card Number Storage

Card numbers are encrypted at rest using AES/ECB/PKCS5Padding before being written to the database. They are decrypted and masked (`****-****-****-XXXX`) before being returned in API responses and reports.

---

## Database Schema

The schema consists of the following tables:

| Table | Type | Description |
|-------|------|-------------|
| `card_status` | Master | Card status codes: `IACT`, `CACT`, `DACT` |
| `request_status` | Master | Request status codes: `PENDING`, `APPROVED`, `REJECTED` |
| `card_request_type` | Master | Request type codes: `ACTI` (Activation), `CDCL` (Closure) |
| `users` | Master | System users with hashed passwords and roles |
| `card` | Transaction | Credit card records with limits and status |
| `card_request` | Transaction | Card lifecycle requests linked to cards and users |

Indexes are defined on `card.status_code`, `card_request.status_code`, and `card_request.card_number` to support common query patterns.

---

## Default Credentials

The seed script (`data.sql`) creates the following users. Both use the password `password` (BCrypt-hashed).

| Username | Role | Password |
|----------|------|----------|
| `supun` | ADMIN | `password` |
| `sahan` | ADMIN | `password` |

> **Note:** Change these credentials before deploying to any non-development environment.
