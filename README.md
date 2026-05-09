# LocalCRM — Full-Stack CRM System

LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.

This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, audit activity, and containerized development environments.

---

## 🚀 Tech Stack

### Backend
- ASP.NET Core (C#)
- Entity Framework Core
- PostgreSQL
- REST API design
- Structured console logging
- JSON error handling middleware

### Frontend
- React
- TypeScript
- Vite
- Electron desktop wrapper

### Infrastructure
- Docker
- PostgreSQL container
- Dev Containers
- GitHub Codespaces-ready development environment

---

## 📦 Current Features

### Customer Management
- Create customer records
- Retrieve customer records
- Select customer from list
- View customer details
- Edit customer profile fields
- Save customer updates
- Persist customer changes in PostgreSQL

### Customer Notes
- Add notes to a selected customer
- Mark notes as pinned
- View customer-specific notes
- Persist notes in PostgreSQL

### Audit Activity
- Audit entries for customer creation
- Audit entries for customer updates
- Audit entries for note creation
- Customer-specific audit activity panel

### Developer / Debug Features
- Backend health check
- Database connectivity status
- Structured console logging
- JSON error response middleware
- Debug endpoint for simulated backend errors
- Debug endpoint for simulated latency

---

## 📡 Current API Surface

### Health
- `GET /health`

### Customers
- `GET /customers`
- `GET /customers/{id}`
- `POST /customers`
- `PUT /customers/{id}`

### Notes
- `GET /customers/{customerId}/notes`
- `POST /customers/{customerId}/notes`

### Audit
- `GET /customers/{customerId}/audit`
- `GET /audit`

### Debug
- `GET /debug/status`
- `POST /debug/toggle-error`
- `POST /debug/set-delay/{ms}`

---

## 🧠 What This Project Demonstrates

- Full-stack application architecture
- API ↔ database ↔ frontend integration
- Desktop-client-style application design
- Entity Framework migrations and schema management
- PostgreSQL-backed persistence
- Customer workflow modeling
- Notes and activity tracking
- Audit logging patterns
- Debugging across TypeScript, .NET, Docker, and database layers
- Real-world development workflow inside a containerized Codespaces environment

---

## ✅ Phase 1 — Completed

Phase 1 established the core full-stack CRM foundation.

### Implemented
- Codespaces/devcontainer setup
- PostgreSQL container via Docker Compose
- ASP.NET Core backend API
- EF Core migrations
- Database seeding
- React/Vite frontend
- Electron desktop shell
- Customer create/retrieve workflow
- Frontend-to-backend proxy setup
- Persistent customer storage

### Verified Flow
1. Start PostgreSQL.
2. Start the ASP.NET Core API.
3. Start the React/Vite frontend.
4. Load customer records from PostgreSQL.
5. Create a new customer from the UI.
6. Confirm the new customer persists after refresh.

---

## ✅ Phase 2 — Current Progress

Phase 2 adds deeper customer-level workflow behavior.

### Implemented
- Customer detail panel
- Editable customer profile fields
- Customer update/save workflow
- Customer notes
- Pinned notes
- Customer-specific audit activity
- Audit entries for customer creation
- Audit entries for customer updates
- Audit entries for note creation
- Backend debug controls for simulated delay and forced errors
- Structured console logging
- JSON error handling middleware

### Verified Flow
1. Select a customer from the customer list.
2. Edit customer details.
3. Save the updated customer profile.
4. Add a note to the selected customer.
5. Mark a note as pinned.
6. View customer-specific audit activity.
7. Confirm customer updates and notes persist after refresh.

---

## ⚙️ Running the Project

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres