# LocalCRM — Full-Stack CRM System

LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.

This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, audit activity, backend-backed search, role-aware workflows, password hashing, UI state handling, and containerized development environments.

---

## 🚀 Tech Stack

### Backend
- ASP.NET Core (C#)
- Entity Framework Core
- PostgreSQL
- REST API design
- Backend-backed search/filtering
- Role-aware backend workflow enforcement
- Password hashing with ASP.NET Core Identity password hasher
- Structured console logging
- JSON error handling middleware

### Frontend
- React
- TypeScript
- Vite
- Electron desktop wrapper
- Role-aware UI behavior
- Local session persistence with browser localStorage

### Infrastructure
- Docker
- PostgreSQL container
- Dev Containers
- GitHub Codespaces-ready development environment

---

## 📦 Current Features

### Authentication & Roles
- Login/logout flow
- Admin and Staff user roles
- Persistent signed-in user state across browser refreshes
- Admin-only Staff user creation
- Password hashing for seeded and newly created users
- Legacy development passwords upgrade to hashed passwords after successful login

### Role-Aware Workflow
- Admin users can create customers
- Admin users can edit customers
- Admin users can create Staff users
- Staff users can create customers
- Staff users can view/search customers
- Staff users can view customer notes and audit activity
- Staff users cannot edit customer records
- Backend enforces Admin-only customer edits

### Customer Management
- Create customer records
- Retrieve customer records
- Select customer from list
- View customer details
- Edit customer profile fields as Admin
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
- User-aware audit activity using the current signed-in user
- Customer-specific audit activity panel
- Compact audit display with activity counts

### UI State Handling
- Loading state for customer records
- Empty-state messaging
- No-results messaging for search/filter combinations
- API failure messaging
- Selected-customer fallback when filtered results change
- Clear validation messages for customer, note, login, and Staff user forms

### Backend Reliability Features
- Backend health check
- Database connectivity status
- Structured console logging
- JSON error response middleware

---

## 📡 Current API Surface

### Health
- `GET /health`

### Auth
- `POST /auth/login`

### Users
- `POST /users/staff`

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
- Role-aware frontend behavior
- Backend role enforcement for protected workflows
- Password hashing and legacy password upgrade flow
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

## ✅ Phase 4A — Completed

Phase 4A added the authentication and role-aware workflow foundation.

### Implemented
- User model updated for auth-ready fields
- Admin and Staff roles
- Seeded development Admin and Staff users
- Login endpoint
- Frontend login screen
- Logout flow
- Signed-in user display in app header
- Session persistence across browser refreshes
- Admin-only Staff user creation
- Staff user creation backend route
- Frontend role-aware behavior
- Staff can create customers
- Staff cannot edit customers
- Admin can edit customers
- Backend Admin-only enforcement for customer edits
- User-aware audit entries
- Password hashing using ASP.NET Core Identity password hasher
- Automatic upgrade path for legacy development password rows after successful login
- Vite proxy support for auth, users, customers, audit, and health routes

### Verified Flow
1. Sign in as seeded Admin.
2. Confirm Admin can create customers.
3. Confirm Admin can edit customers.
4. Confirm Admin can create Staff users.
5. Sign out.
6. Sign in as seeded Staff.
7. Confirm Staff can create customers.
8. Confirm Staff can view/search customers.
9. Confirm Staff can view notes and audit activity.
10. Confirm Staff cannot edit customer records.
11. Confirm direct backend Staff edit attempts are rejected.
12. Confirm audit entries show the signed-in user.
13. Confirm passwords are hashed after login.
14. Confirm newly created Staff users can sign in.

---

## ⏳ Phase 4B — Not Started

Phase 4B is the production-grade authentication and authorization hardening pass.

### Planned
- Replace temporary `X-LocalCRM-User` identity header with real token/session authentication
- Add authenticated claims
- Protect API routes using authentication middleware
- Add authorization policies for Admin and Staff workflows
- Remove trust in frontend-sent identity headers
- Add session expiration or token expiration
- Consider password change/reset workflow
- Consider Owner/SuperAdmin distinction before allowing Admin-user creation
- Add audit records for user creation and security-sensitive activity

### Current Limitation
The current Phase 4A auth layer uses hashed passwords and backend role checks, but the signed-in user identity is still passed from the frontend through a temporary development header. This is suitable for the current development milestone, but it is not production-grade authentication yet.

---

## ⚙️ Running the Project

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres