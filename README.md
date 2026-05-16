LocalCRM — Full-Stack CRM System
LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.
This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, audit activity, backend-backed search, role-aware workflows, JWT authentication, password hashing, approval workflows, UI state handling, and containerized development environments.
---
🚀 Tech Stack
Backend
ASP.NET Core (C#)
Entity Framework Core
PostgreSQL
REST API design
JWT bearer authentication
Authorization policies
Backend-backed search/filtering
Role-aware backend workflow enforcement
Staff-to-Admin approval workflow
Password hashing with ASP.NET Core Identity password hasher
Structured console logging
JSON error handling middleware
Frontend
React
TypeScript
Vite
Electron desktop wrapper
Role-aware UI behavior
JWT-backed authenticated API requests
Staff edit-request submission workflow
Admin approval/rejection workflow
Local session persistence with browser localStorage
Infrastructure
Docker
PostgreSQL container
Dev Containers
GitHub Codespaces-ready development environment
---
📦 Current Features
Authentication & Roles
Login/logout flow
Admin and Staff user roles
JWT token issued on successful login
JWT bearer authentication for protected backend routes
Persistent signed-in user state across browser refreshes
Token expiration tracking on the frontend
Admin-only Staff user creation
Password hashing for seeded and newly created users
Legacy development passwords upgrade to hashed passwords after successful login
Role-Aware Workflow
Admin users can create customers
Admin users can directly edit customers
Admin users can create Staff users
Staff users can create customers
Staff users can view/search customers
Staff users can view customer notes and audit activity
Staff users cannot directly edit customer records
Staff users can submit customer edit requests
Admin users can approve or reject Staff-submitted edit requests
Backend enforces Admin-only customer edits
Backend enforces Admin-only Staff user creation
Backend enforces Admin-only edit-request approval/rejection
Customer Edit Requests
Staff can submit proposed customer changes for Admin review
Proposed changes are stored separately from the live customer record
Admin can view pending edit requests
Admin can approve edit requests
Admin can reject edit requests
Approved requests update the live customer record
Rejected requests leave the live customer record unchanged
Customer detail view shows edit request history
Audit trail records request, approval, and rejection events
Customer Management
Create customer records
Retrieve customer records
Select customer from list
View customer details
Edit customer profile fields as Admin
Submit customer profile edits as Staff for approval
Store customer contact and address details
Persist customer changes in PostgreSQL
Search & Filtering
Backend-backed customer search
Search by name, email, phone, type, city, and state
Filter customers by status
Combine text search with status filtering
Customer result count display
Customer Notes
Add notes to a selected customer
Mark notes as pinned
View customer-specific notes
Pinned notes sort above standard notes
Compact note display for faster scanning
Persist notes in PostgreSQL
Audit Activity
Audit entries for customer creation
Audit entries for customer updates
Audit entries for note creation
Audit entries for edit request submission
Audit entries for edit request approval
Audit entries for edit request rejection
User-aware audit activity from authenticated JWT claims
Customer-specific audit activity panel
Compact audit display with activity counts
UI State Handling
Loading state for customer records
Empty-state messaging
No-results messaging for search/filter combinations
API failure messaging
Unauthorized/session-expired messaging
Selected-customer fallback when filtered results change
Pending edit request count display
Edit request history display
Clear validation messages for customer, note, login, Staff user, and edit request forms
Backend Reliability Features
Backend health check
Database connectivity status
Structured console logging
JSON error response middleware
---
📡 Current API Surface
Health
`GET /health`
Auth
`POST /auth/login`
Users
`POST /users/staff`
Customers
`GET /customers`
`GET /customers/search?q=&status=`
`GET /customers/{id}`
`POST /customers`
`PUT /customers/{id}`
Customer Edit Requests
`POST /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/edit-requests`
`GET /customer-edit-requests?status=`
`POST /customer-edit-requests/{requestId}/approve`
`POST /customer-edit-requests/{requestId}/reject`
Notes
`GET /customers/{customerId}/notes`
`POST /customers/{customerId}/notes`
Audit
`GET /customers/{customerId}/audit`
`GET /audit`
---
🔐 Authorization Model
Public Routes
`GET /health`
`POST /auth/login`
Authenticated User Routes
Require a valid JWT bearer token:
`GET /customers`
`GET /customers/search`
`GET /customers/{id}`
`POST /customers`
`POST /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/notes`
`POST /customers/{customerId}/notes`
`GET /customers/{customerId}/audit`
`GET /audit`
Admin-Only Routes
Require a valid JWT bearer token with the `Admin` role:
`PUT /customers/{id}`
`POST /users/staff`
`GET /customer-edit-requests?status=`
`POST /customer-edit-requests/{requestId}/approve`
`POST /customer-edit-requests/{requestId}/reject`
---
🧠 What This Project Demonstrates
Full-stack application architecture
API ↔ database ↔ frontend integration
Desktop-client-style application design
Entity Framework migrations and schema management
PostgreSQL-backed persistence
Backend query/filter design
Customer workflow modeling
Staff-to-Admin approval workflow design
Notes and activity tracking
Audit logging patterns
JWT authentication
Role-based authorization policies
Role-aware frontend behavior
Backend role enforcement for protected workflows
Password hashing and legacy password upgrade flow
UI state handling for loading, empty, no-results, unauthorized, pending-approval, and API-failure scenarios
Client-facing form validation
Debugging across TypeScript, .NET, Docker, and database layers
Real-world development workflow inside a containerized Codespaces environment
---
✅ Phase 1 — Completed
Phase 1 established the core full-stack CRM foundation.
Implemented
Codespaces/devcontainer setup
PostgreSQL container via Docker Compose
ASP.NET Core backend API
EF Core migrations
Database seeding
React/Vite frontend
Electron desktop shell
Customer create/retrieve workflow
Frontend-to-backend proxy setup
Persistent customer storage
Verified Flow
Start PostgreSQL.
Start the ASP.NET Core API.
Start the React/Vite frontend.
Load customer records from PostgreSQL.
Create a new customer from the UI.
Confirm the new customer persists after refresh.
---
✅ Phase 2 — Completed
Phase 2 added deeper customer-level workflow behavior.
Implemented
Customer detail panel
Editable customer profile fields
Customer update/save workflow
Customer notes
Pinned notes
Customer-specific audit activity
Audit entries for customer creation
Audit entries for customer updates
Audit entries for note creation
Structured console logging
JSON error handling middleware
Verified Flow
Select a customer from the customer list.
Edit customer details.
Save the updated customer profile.
Add a note to the selected customer.
Mark a note as pinned.
View customer-specific audit activity.
Confirm customer updates and notes persist after refresh.
---
✅ Phase 3 — Completed
Phase 3 improved customer list usability, backend search behavior, frontend state handling, form validation, and customer detail usability.
Implemented
Customer search toolbar
Status filter dropdown
Result count display
Backend search endpoint
Search by customer name, email, phone, type, city, and state
Status filtering through API query parameters
Combined search + status filtering
Frontend wired to backend search instead of local-only filtering
Loading state for customer records
API failure state for customer loading
Empty state when no customers exist
No-results state for search/filter combinations
Selected-customer fallback when the current selection is filtered out
Refined customer create/edit validation
Email format validation
Minimum note length validation
Expanded customer create/edit forms with address fields
Improved customer detail summary layout
Status chips for customer status
Compact notes display
Pinned notes sorted above standard notes
Compact audit activity display
Notes and audit activity count badges
Removed client-facing debug tooling from the CRM workflow
Verified Flow
Load customer records.
Search customers by text.
Filter customers by status.
Combine search and status filtering.
Select a filtered customer.
Create a customer with contact and address fields.
Edit selected customer details.
Validate malformed customer input.
Add notes and pinned notes.
Confirm pinned notes sort first.
Confirm notes and audit activity still load correctly.
Confirm empty/no-results/error states display cleanly.
Confirm the UI remains client-facing without debug controls.
---
✅ Phase 4A — Completed
Phase 4A added the authentication and role-aware workflow foundation.
Implemented
User model updated for auth-ready fields
Admin and Staff roles
Seeded development Admin and Staff users
Login endpoint
Frontend login screen
Logout flow
Signed-in user display in app header
Session persistence across browser refreshes
Admin-only Staff user creation
Staff user creation backend route
Frontend role-aware behavior
Staff can create customers
Staff cannot edit customers
Admin can edit customers
Backend Admin-only enforcement for customer edits
User-aware audit entries
Password hashing using ASP.NET Core Identity password hasher
Automatic upgrade path for legacy development password rows after successful login
Vite proxy support for auth, users, customers, audit, and health routes
Verified Flow
Sign in as seeded Admin.
Confirm Admin can create customers.
Confirm Admin can edit customers.
Confirm Admin can create Staff users.
Sign out.
Sign in as seeded Staff.
Confirm Staff can create customers.
Confirm Staff can view/search customers.
Confirm Staff can view notes and audit activity.
Confirm Staff cannot edit customer records.
Confirm direct backend Staff edit attempts are rejected.
Confirm audit entries show the signed-in user.
Confirm passwords are hashed after login.
Confirm newly created Staff users can sign in.
---
✅ Phase 4B — Completed
Phase 4B hardened the auth layer by replacing temporary frontend-sent identity headers with JWT-based authentication and authorization.
Implemented
JWT bearer authentication package
JWT issuer, audience, signing key, and expiration settings
Signed JWT returned from login
Frontend token storage
Authenticated frontend API requests using `Authorization: Bearer <token>`
Backend authentication middleware
Backend authorization middleware
Authenticated-user policy
Admin-only policy
Protected customer routes
Protected note routes
Protected audit routes
Admin-only customer edit route
Admin-only Staff user creation route
Audit identity derived from JWT claims
Removal of frontend `X-LocalCRM-User` identity trust
Frontend session clearing on unauthorized/expired-token responses
Verified Flow
Unauthenticated customer API calls return `401 Unauthorized`.
Admin login returns a JWT token.
Staff login returns a JWT token.
Authenticated users can load/search customers.
Authenticated users can create customers.
Authenticated users can create notes.
Admin users can edit customer records.
Staff users cannot edit customer records.
Admin users can create Staff users.
Audit activity records the authenticated user from JWT claims.
Frontend clears session on unauthorized or expired access.
---
✅ Phase 5 — Completed
Phase 5 added a Staff-to-Admin customer edit approval workflow.
Implemented
`CustomerEditRequest` model
`CustomerEditRequests` database table
EF Core migration for edit requests
Staff edit request submission endpoint
Customer-specific edit request history endpoint
Admin pending edit request endpoint
Admin approve endpoint
Admin reject endpoint
Frontend Staff edit request submission UI
Frontend Admin pending request review panel
Admin decision note field
Edit request history under Customer Detail
Audit entries for:
`EditRequested`
`EditApproved`
`EditRejected`
Vite proxy support for `/customer-edit-requests`
Verified Flow
Sign in as Staff.
Select a customer.
Change customer fields.
Submit an edit request.
Confirm the live customer record does not immediately change.
Confirm the edit request appears in customer edit request history.
Sign in as Admin.
Confirm the pending edit request appears in the Admin review panel.
Approve the request.
Confirm the live customer record updates.
Submit another Staff edit request.
Reject it as Admin.
Confirm the live customer record does not change.
Confirm audit activity records request, approval, and rejection events.
---
⚙️ Running the Project
1. Start PostgreSQL
From the repository root:
```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres
```
2. Start the Backend API
```bash
cd apps/host-api/src/LocalCRM.Api
dotnet run --urls=http://0.0.0.0:8080
```
Expected backend port:
```text
8080
```
3. Start the Frontend
Open a second terminal:
```bash
cd apps/desktop
npm install
npm run dev
```
Expected frontend port:
```text
5173
```
Open the forwarded `5173` port in the browser.
---
🔐 Development Login Users
Seeded users:
```text
Admin:
admin@localcrm.dev
Admin123!

Staff:
staff@localcrm.dev
Staff123!
```
After successful login, legacy development passwords are upgraded to hashed password storage.
---
🧪 Quick Test Commands
Health Check
```bash
curl http://localhost:8080/health
```
Login as Admin and Store Token
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localcrm.dev","password":"Admin123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```
Login as Staff and Store Token
```bash
STAFF_TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@localcrm.dev","password":"Staff123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```
Confirm Customers Require Auth
```bash
curl -i http://localhost:8080/customers
```
Expected:
```text
HTTP/1.1 401 Unauthorized
```
List Customers as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/customers
```
List Customers as Staff
```bash
curl -H "Authorization: Bearer $STAFF_TOKEN" http://localhost:8080/customers
```
Search Customers
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customers/search?q=acme&status=All"
```
Create Staff User as Admin
```bash
curl -i -X POST http://localhost:8080/users/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"displayName":"Test Staff","email":"test.staff@localcrm.dev","password":"Staff1234!"}'
```
Submit Customer Edit Request as Staff
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -i -X POST http://localhost:8080/customers/<CUSTOMER_ID>/edit-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"name":"Requested Customer Name","type":"Company","email":"requested@example.com","phone":"555-0100","addressLine1":"","addressLine2":"","city":"Oklahoma City","state":"OK","postalCode":"73101","status":"Active"}'
```
List Pending Edit Requests as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=Pending"
```
Approve Edit Request as Admin
Replace `<REQUEST_ID>` with an actual edit request ID.
```bash
curl -i -X POST http://localhost:8080/customer-edit-requests/<REQUEST_ID>/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"note":"Approved"}'
```
Reject Edit Request as Admin
Replace `<REQUEST_ID>` with an actual edit request ID.
```bash
curl -i -X POST http://localhost:8080/customer-edit-requests/<REQUEST_ID>/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"note":"Rejected"}'
```
Confirm Staff Cannot Directly Edit Customer
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -i -X PUT http://localhost:8080/customers/<CUSTOMER_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"id":"<CUSTOMER_ID>","name":"Blocked Staff Edit","type":"Company","email":"","phone":"","addressLine1":"","addressLine2":"","city":"","state":"","postalCode":"","status":"Active","createdAtUtc":"2026-01-01T00:00:00Z","updatedAtUtc":"2026-01-01T00:00:00Z"}'
```
Expected:
```text
HTTP/1.1 403 Forbidden
```
Get Customer Notes
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/customers/<CUSTOMER_ID>/notes
```
Get Customer Audit Activity
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/customers/<CUSTOMER_ID>/audit
```
---
📁 Project Structure
```text
localCRM/
├── .devcontainer/
│   ├── devcontainer.json
│   ├── docker-compose.yml
│   └── post-create.sh
├── apps/
│   ├── desktop/
│   │   ├── electron/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── host-api/
│       └── src/
│           └── LocalCRM.Api/
│               ├── Data/
│               ├── Models/
│               ├── Migrations/
│               ├── Program.cs
│               └── appsettings.json
├── README.md
└── .gitignore
```
---
🔭 Next Planned Milestones
Phase 6
Improve approval workflow UX
Show side-by-side “current vs requested” customer values
Add clearer per-field change highlighting
Add request filters by status/date/requester
Add request counts to customer list or dashboard
Later Phases
Password change/reset workflow
Owner/SuperAdmin distinction before allowing Admin-user creation
Security-sensitive audit entries
Quotes
Contracts
Scope-of-work records
Document templates
Email workflow
Calendar/ICS export
Backup/export tools
Tenant/custom branding support
---
📌 Status
Current milestone:
```text
Phase 5 complete — Staff-submitted customer edit requests, Admin approval/rejection, live customer update on approval, rejection without mutation, edit request history, and audit events are working.
```
---
👤 Author
Baine S. Hadick  
Independent Researcher & Developer