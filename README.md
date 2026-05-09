# LocalCRM — Full-Stack CRM System

LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.

This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, audit activity, backend-backed search, UI state handling, and containerized development environments.

---

## 🚀 Tech Stack

### Backend
- ASP.NET Core (C#)
- Entity Framework Core
- PostgreSQL
- REST API design
- Backend-backed search/filtering
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
- Store customer contact and address details
- Persist customer changes in PostgreSQL

### Search & Filtering
- Backend-backed customer search
- Search by name, email, phone, type, city, and state
- Filter customers by status
- Combine text search with status filtering
- Customer result count display

### Customer Notes
- Add notes to a selected customer
- Mark notes as pinned
- View customer-specific notes
- Pinned notes sort above standard notes
- Compact note display for faster scanning
- Persist notes in PostgreSQL

### Audit Activity
- Audit entries for customer creation
- Audit entries for customer updates
- Audit entries for note creation
- Customer-specific audit activity panel
- Compact audit display with activity counts

### UI State Handling
- Loading state for customer records
- Empty-state messaging
- No-results messaging for search/filter combinations
- API failure messaging
- Selected-customer fallback when filtered results change
- Clear validation messages for customer and note forms

### Backend Reliability Features
- Backend health check
- Database connectivity status
- Structured console logging
- JSON error response middleware

---

## 📡 Current API Surface

### Health
- `GET /health`

### Customers
- `GET /customers`
- `GET /customers/search?q=&status=`
- `GET /customers/{id}`
- `POST /customers`
- `PUT /customers/{id}`

### Notes
- `GET /customers/{customerId}/notes`
- `POST /customers/{customerId}/notes`

### Audit
- `GET /customers/{customerId}/audit`
- `GET /audit`

---

## 🧠 What This Project Demonstrates

- Full-stack application architecture
- API ↔ database ↔ frontend integration
- Desktop-client-style application design
- Entity Framework migrations and schema management
- PostgreSQL-backed persistence
- Backend query/filter design
- Customer workflow modeling
- Notes and activity tracking
- Audit logging patterns
- UI state handling for loading, empty, no-results, and API-failure scenarios
- Client-facing form validation
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

## ✅ Phase 2 — Completed

Phase 2 added deeper customer-level workflow behavior.

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

## ✅ Phase 3 — Completed

Phase 3 improved customer list usability, backend search behavior, frontend state handling, form validation, and customer detail usability.

### Implemented
- Customer search toolbar
- Status filter dropdown
- Result count display
- Backend search endpoint
- Search by customer name, email, phone, type, city, and state
- Status filtering through API query parameters
- Combined search + status filtering
- Frontend wired to backend search instead of local-only filtering
- Loading state for customer records
- API failure state for customer loading
- Empty state when no customers exist
- No-results state for search/filter combinations
- Selected-customer fallback when the current selection is filtered out
- Refined customer create/edit validation
- Email format validation
- Minimum note length validation
- Expanded customer create/edit forms with address fields
- Improved customer detail summary layout
- Status chips for customer status
- Compact notes display
- Pinned notes sorted above standard notes
- Compact audit activity display
- Notes and audit activity count badges
- Removed client-facing debug tooling from the CRM workflow

### Verified Flow
1. Load customer records.
2. Search customers by text.
3. Filter customers by status.
4. Combine search and status filtering.
5. Select a filtered customer.
6. Create a customer with contact and address fields.
7. Edit selected customer details.
8. Validate malformed customer input.
9. Add notes and pinned notes.
10. Confirm pinned notes sort first.
11. Confirm notes and audit activity still load correctly.
12. Confirm empty/no-results/error states display cleanly.
13. Confirm the UI remains client-facing without debug controls.

---

## ⚙️ Running the Project

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres