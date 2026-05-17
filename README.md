LocalCRM — Full-Stack CRM System
LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.
This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, quote workflow modeling, quote document generation, audit activity, backend-backed search, role-aware workflows, Owner/Admin/Staff permission hardening, JWT authentication, password hashing, approval workflows, dashboard reporting, password management, security-sensitive audit review, UI state handling, and containerized development environments.
---
🚀 Tech Stack
Backend
ASP.NET Core (C#)
Entity Framework Core
PostgreSQL
REST API design
JWT bearer authentication
Authorization policies
Owner/Admin/Staff role enforcement
Backend-backed search/filtering
Role-aware backend workflow enforcement
Staff-to-Admin approval workflow
Quote record workflow
Quote status workflow
Printable quote document workflow
Browser-printable HTML document generation
Current-vs-requested approval review data
Dashboard summary endpoint
Request queue filtering by status, requester, and date range
Global audit filtering by entity, action, actor, and date range
Password hashing with ASP.NET Core Identity password hasher
Authenticated password change workflow
Admin/Owner Staff password reset workflow
Owner-only Admin user creation workflow
Security-sensitive audit events for login, password changes/resets, user creation, quote activity, and quote document generation
Structured console logging
JSON error handling middleware
Frontend
React
TypeScript
Vite
Electron desktop wrapper
Role-aware UI behavior
JWT-backed authenticated API requests
Owner/Admin/Staff role-aware controls
Staff edit-request submission workflow
Admin/Owner approval/rejection workflow
Quote creation workflow
Quote list/search/filter/sort workflow
Quote status controls
Customer-specific quote history
Quote View / Print workflow
Browser-based hard-copy printing and local PDF save workflow
Current-vs-requested edit review UI
Changed-field highlighting
Edit request status/requester/date filtering
Admin/Owner dashboard summary cards
Per-customer pending request indicators
Account security panel
Admin/Owner Staff password reset panel
Owner-only Admin creation panel
Admin/Owner global audit review panel
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
Owner, Admin, and Staff user roles
JWT token issued on successful login
JWT bearer authentication for protected backend routes
Persistent signed-in user state across browser refreshes
Token expiration tracking on the frontend
Owner-only Admin user creation
Admin/Owner Staff user creation
Admin/Owner Staff password reset
Authenticated user password change
Password hashing for seeded and newly created users
Legacy development passwords upgrade to hashed passwords after successful login
Password validation on backend and frontend
Login success and failed-login attempts are audit logged
Password Management
Signed-in users can change their own password
Current password is required before changing password
Owner and Admin users can reset active Staff user passwords
Admin users cannot reset Admin or Owner passwords through the Staff reset workflow
Owner can create Admin users
Admin cannot create Admin users
Password requirements:
Minimum 8 characters
At least one uppercase letter
At least one lowercase letter
At least one number
Password changes are audit logged
Password resets are audit logged
Admin user creation is audit logged
Staff user creation is audit logged
Password update operations preserve ASP.NET Core Identity password hashing
Role-Aware Workflow
Owner users can create Admin users
Owner users can create Staff users
Owner users can reset Staff passwords
Owner users can create, edit, and review customer workflows
Owner users can review global audit activity
Owner users can create quotes and manage quote statuses
Owner users can view and print quote documents
Admin users can create customers
Admin users can directly edit customers
Admin users can create Staff users
Admin users can reset Staff passwords
Admin users can review global audit activity
Admin users can create quotes and manage quote statuses
Admin users can view and print quote documents
Admin users cannot create Admin or Owner users
Staff users can create customers
Staff users can view/search customers
Staff users can view customer notes and customer-specific audit activity
Staff users can create quotes
Staff users can view quote records
Staff users can view and print quote documents
Staff users cannot directly edit customer records
Staff users cannot view the global audit review panel
Staff users cannot manage quote status transitions
Staff users can submit customer edit requests
Owner/Admin users can approve or reject Staff-submitted edit requests
Backend enforces Owner-only Admin creation
Backend enforces Admin/Owner Staff user creation
Backend enforces Admin/Owner customer edits
Backend enforces Admin/Owner Staff password reset
Backend enforces Admin/Owner edit-request approval/rejection
Backend enforces Admin/Owner-only global audit review
Backend enforces Admin/Owner-only quote status updates
Admin / Owner Dashboard
Dashboard summary cards for operational workflow visibility
Total customer count
Active customer count
Lead customer count
Pending edit request count
Pending requests created today
Edit requests from the last 7 days
Summary refresh after approval/rejection workflow actions
Customer Edit Requests
Staff can submit proposed customer changes for Admin/Owner review
Proposed changes are stored separately from the live customer record
Admin/Owner can view pending, approved, rejected, or all edit requests
Admin/Owner can filter edit requests by requester
Admin/Owner can filter edit requests by date range
Admin/Owner can review current customer values beside requested values
Changed fields are visually highlighted
Changed-field counts are shown per request
Admin/Owner can approve edit requests
Admin/Owner can reject edit requests
Approved requests update the live customer record
Rejected requests leave the live customer record unchanged
Customer detail view shows edit request history
Customer list shows pending edit indicators
Audit trail records request, approval, and rejection events
Customer Management
Create customer records
Retrieve customer records
Select customer from list
View customer details
Edit customer profile fields as Admin/Owner
Submit customer profile edits as Staff for approval
Store customer contact and address details
Persist customer changes in PostgreSQL
Quote Management
Create quote records linked to customers
Store quote number, title, description, amount, status, and dates
Automatically generate quote numbers
View global quote list
View customer-specific quote history under Customer Detail
Search quotes by customer name, quote number, title, and description
Filter quotes by status
Filter quotes by quote date range
Sort quotes by:
Date
Status
Customer/name
Amount
Supported quote statuses:
Draft
Sent
Accepted
Rejected
Expired
Admin/Owner users can update quote statuses
Sent quotes are automatically marked expired after 30 days if not otherwise updated
Quote creation is audit logged
Quote status changes are audit logged
Automatic quote expiration is audit logged
Quote Documents
Generate printable quote documents from database-backed quote records
View/print quote documents from the global Quotes panel
View/print quote documents from the Customer Quotes section
Printable quote document includes:
Quote number
Quote status
Quote date
Generated date
Customer name
Customer type
Customer email
Customer phone
Customer address
Quote title
Quote description
Quote amount
Sent/accepted/rejected/expired dates when available
Built-in `Print / Save as PDF` button inside the quote document
Browser print supports physical hard-copy printing
Browser print dialog supports local “Save as PDF”
Quote document generation is audit logged
Printable quote document output uses safe HTML encoding for customer and quote fields
Server-side DOCX/PDF generation and document template mapping remain planned for a later document-template layer
Search & Filtering
Backend-backed customer search
Search by name, email, phone, type, city, and state
Filter customers by status
Combine text search with status filtering
Customer result count display
Backend-backed quote search/filter/sort
Backend-backed audit search/filter
Backend-backed edit request filtering
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
Audit entries for password changes
Audit entries for Staff password resets
Audit entries for Staff user creation
Audit entries for Admin user creation
Audit entries for successful logins
Audit entries for failed login attempts
Audit entries for quote creation
Audit entries for quote status changes
Audit entries for automatic quote expiration
Audit entries for printable quote document generation
User-aware audit activity from authenticated JWT claims
Customer-specific audit activity panel
Admin/Owner global audit review panel
Global audit filtering by:
Entity type
Entity ID
Action
Performed by
From date
To date
Compact audit display with activity counts
UI State Handling
Loading state for customer records
Empty-state messaging
No-results messaging for search/filter combinations
API failure messaging
Unauthorized/session-expired messaging
Selected-customer fallback when filtered results change
Dashboard summary state
Pending edit request count display
Edit request history display
Current-vs-requested comparison grid
Changed-field highlighting
Edit request status/requester/date filtering
Quote form state
Quote filter/sort state
Quote status action state
Quote document opening state
Customer quote history state
Account security form state
Staff password reset form state
Owner-only Admin creation form state
Global audit review filter state
Clear validation messages for customer, quote, note, login, Staff user, Admin user, password, audit, and edit request forms
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
`POST /auth/change-password`
Dashboard
`GET /dashboard/summary`
Users
`GET /users`
`POST /users/staff`
`POST /users/admin`
`POST /users/{userId}/reset-password`
Customers
`GET /customers`
`GET /customers/search?q=&status=`
`GET /customers/{id}`
`POST /customers`
`PUT /customers/{id}`
Quotes
`GET /quotes?q=&status=&sortBy=&sortDirection=&customerId=&from=&to=`
`GET /customers/{customerId}/quotes`
`POST /quotes`
`GET /quotes/{quoteId}/document`
`POST /quotes/{quoteId}/status`
Customer Edit Requests
`POST /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/edit-requests`
`GET /customer-edit-requests?status=&requestedBy=&from=&to=`
`POST /customer-edit-requests/{requestId}/approve`
`POST /customer-edit-requests/{requestId}/reject`
Notes
`GET /customers/{customerId}/notes`
`POST /customers/{customerId}/notes`
Audit
`GET /customers/{customerId}/audit`
`GET /audit?entityType=&entityId=&action=&performedBy=&from=&to=`
---
🔐 Authorization Model
Public Routes
`GET /health`
`POST /auth/login`
Authenticated User Routes
Require a valid JWT bearer token:
`POST /auth/change-password`
`GET /customers`
`GET /customers/search`
`GET /customers/{id}`
`POST /customers`
`GET /quotes?q=&status=&sortBy=&sortDirection=&customerId=&from=&to=`
`GET /customers/{customerId}/quotes`
`POST /quotes`
`GET /quotes/{quoteId}/document`
`POST /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/notes`
`POST /customers/{customerId}/notes`
`GET /customers/{customerId}/audit`
Admin / Owner Routes
Require a valid JWT bearer token with the `Admin` or `Owner` role:
`GET /dashboard/summary`
`GET /users`
`PUT /customers/{id}`
`POST /users/staff`
`POST /users/{userId}/reset-password`
`POST /quotes/{quoteId}/status`
`GET /customer-edit-requests?status=&requestedBy=&from=&to=`
`POST /customer-edit-requests/{requestId}/approve`
`POST /customer-edit-requests/{requestId}/reject`
`GET /audit?entityType=&entityId=&action=&performedBy=&from=&to=`
Owner-Only Routes
Require a valid JWT bearer token with the `Owner` role:
`POST /users/admin`
---
🧠 What This Project Demonstrates
Full-stack application architecture
API ↔ database ↔ frontend integration
Desktop-client-style application design
Entity Framework migrations and schema management
PostgreSQL-backed persistence
Backend query/filter design
Customer workflow modeling
Quote workflow modeling
Quote status lifecycle handling
Automatic expiration logic
Printable document generation from database records
Browser-based hard-copy printing workflow
Local PDF save workflow through browser print
Staff-to-Admin approval workflow design
Current-vs-requested approval review patterns
Dashboard summary/reporting endpoint design
Queue filtering and operational workflow visibility
Password management workflow design
Owner/Admin/Staff authorization hierarchy
Protected role elevation workflow
Security-sensitive audit logging
Global audit review workflow design
Audit filtering by actor, action, entity, and date
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
✅ Phase 6 — Completed
Phase 6 improved the Admin approval workflow with clearer review context and filtering.
Implemented
Backend enriched edit-request review response
Current customer snapshot included with Admin edit-request results
Frontend current-vs-requested comparison grid
Field-level changed-value highlighting
Changed-field count display
Admin edit request status filter
Pending, Approved, Rejected, and All Requests views
Manual request refresh button
Status chip styling for edit-request states
Responsive layout for comparison rows
Verified Flow
Sign in as Staff.
Submit a customer edit request with multiple changed fields.
Sign in as Admin.
Confirm the request appears in the Admin review panel.
Confirm current values and requested values appear side-by-side.
Confirm changed fields are highlighted.
Confirm changed-field count displays correctly.
Approve the request.
Confirm the request moves out of Pending.
Switch filter to Approved.
Confirm the approved request appears there.
Submit another Staff edit request.
Reject it as Admin.
Switch filter to Rejected.
Confirm the rejected request appears there.
Confirm the live customer record only changes after approval.
---
✅ Phase 7 — Completed
Phase 7 added an Admin workflow dashboard and improved request queue visibility.
Implemented
Admin-only dashboard summary endpoint
Frontend Admin dashboard summary cards
Customer counts by total, active, and lead status
Edit request counts by pending status and recent activity
Pending edit requests created today count
Seven-day edit request activity count
Request queue filtering by:
Status
Requester
From date
To date
Manual workflow refresh button
Clear request filters button
Per-customer pending edit indicators in the customer list
Frontend pending customer ID tracking
Vite proxy support for `/dashboard`
Verified Flow
Sign in as Admin.
Confirm dashboard summary cards appear.
Confirm dashboard counts load from the backend.
Submit a Staff edit request.
Confirm the pending edit request count updates.
Confirm the customer list shows a `Pending Edit` indicator for affected customers.
Filter edit requests by status.
Filter edit requests by requester.
Filter edit requests by date range.
Clear request filters.
Approve or reject an edit request.
Confirm dashboard counts update after workflow actions.
Confirm existing approval/rejection behavior still works.
---
✅ Phase 8 — Completed
Phase 8 added password change and Admin Staff password reset workflows.
Implemented
`POST /auth/change-password`
`GET /users`
`POST /users/{userId}/reset-password`
Authenticated self-service password change
Admin-only Staff password reset
Frontend Account Security panel
Frontend Admin Staff Password Reset panel
Staff user selector for password reset
Backend password validation
Frontend password validation
Password hashing through ASP.NET Core Identity password hasher
Audit entry for `PasswordChanged`
Audit entry for `PasswordReset`
No additional Vite proxy route required because `/auth` and `/users` were already proxied
Verified Flow
Sign in as Admin.
Confirm Account Security panel appears.
Confirm Reset Staff Password panel appears.
Reset a Staff user password.
Sign out.
Confirm Staff can sign in with the reset password.
As Staff, change own password.
Sign out.
Confirm Staff can sign in with the changed password.
Confirm password audit events are created.
---
✅ Phase 9 — Completed
Phase 9 added Owner/SuperAdmin role hardening and protected role elevation.
Implemented
Seeded Owner user
Owner login support
Backend `AdminOrOwner` authorization policy
Backend `OwnerOnly` authorization policy
Owner-only Admin creation endpoint
Frontend Owner role recognition
Frontend Admin/Owner shared workflow visibility
Frontend Owner-only Admin creation panel
Admin user creation audit event
Staff user creation audit event
Admin users blocked from Admin creation
Owner users allowed to create Admin users
Owner/Admin users allowed to create Staff users
Owner/Admin users allowed to reset Staff passwords
Owner/Admin users allowed to edit customers
Owner/Admin users allowed to approve/reject edit requests
Staff remains blocked from management/admin workflows
No additional Vite proxy route required because `/users/admin` is covered by `/users`
Verified Flow
Sign in as Owner.
Confirm Owner sees dashboard, request queue, Staff reset, Staff creation, and Admin creation.
Create a test Admin user as Owner.
Sign out.
Sign in as the newly created Admin user.
Confirm the new Admin can create Staff users.
Confirm the new Admin can reset Staff passwords.
Confirm the new Admin cannot create Admin users.
Sign in as Owner again.
Confirm Owner can still create Admin users.
Sign in as Staff.
Confirm Staff cannot see dashboard/user-management/admin tools.
Confirm Staff can still create customers and submit edit requests.
---
✅ Phase 10 — Completed
Phase 10 added security-sensitive audit entries and a global Admin/Owner audit review workflow.
Implemented
Enhanced global audit endpoint:
`GET /audit?entityType=&entityId=&action=&performedBy=&from=&to=`
Global `/audit` endpoint changed to Admin/Owner only
Global audit result limit increased to 250
Backend audit filtering by:
Entity type
Entity ID
Action
Performed by
From date
To date
Audit event for `LoginSucceeded`
Audit event for `LoginFailed`
Frontend Admin/Owner Audit Review panel
Frontend audit filters by:
Entity type
Entity ID
Action
Performed by
From date
To date
Refresh Audit button
Clear Audit Filters button
Staff remains blocked from global Audit Review
Customer-specific audit view remains available in Customer Detail
No additional Vite proxy route required because `/audit` was already proxied
Verified Flow
Sign in as Owner.
Confirm Audit Review panel appears.
Confirm login activity appears in the audit feed.
Filter audit entries by `User`, `Customer`, and `Auth`.
Filter audit entries by action terms such as `Login`, `Password`, `Created`, and `Edit`.
Filter audit entries by actor, such as `owner`.
Filter audit entries by from/to date.
Clear audit filters.
Sign in as Admin and confirm Audit Review is available.
Sign in as Staff and confirm global Audit Review is not visible.
Confirm customer-specific audit activity still appears under Customer Detail.
---
✅ Phase 11a — Completed
Phase 11a added database-backed quote records, quote filtering/sorting, customer quote history, and quote status workflow.
Implemented
`Quote` model
`Quotes` database table
EF Core migration for quotes
`DbSet<Quote>` and quote model configuration
Quote number generation
Quote creation endpoint:
`POST /quotes`
Global quote list/search/filter/sort endpoint:
`GET /quotes?q=&status=&sortBy=&sortDirection=&customerId=&from=&to=`
Customer-specific quote history endpoint:
`GET /customers/{customerId}/quotes`
Quote status update endpoint:
`POST /quotes/{quoteId}/status`
Supported quote statuses:
`Draft`
`Sent`
`Accepted`
`Rejected`
`Expired`
Automatic expiration of sent quotes after 30 days
Quote creation audit event:
`QuoteCreated`
Quote status change audit event:
`QuoteStatusChanged`
Automatic quote expiration audit event:
`QuoteExpired`
Frontend global Quotes panel
Frontend quote creation form
Frontend quote search/filter/sort controls
Frontend quote status action controls
Frontend customer-specific quote history under Customer Detail
Vite proxy support for `/quotes`
Fixed quote read endpoints by avoiding EF Core projection/sort translation issues
Verified Flow
Sign in as Owner or Admin.
Create a quote linked to a customer.
Confirm quote creation appears in Audit Review.
Confirm quote appears in the global Quotes panel.
Select the linked customer.
Confirm quote appears under Customer Quotes.
Filter quotes by status.
Search quotes by customer/name/title/quote number.
Sort quotes by date, status, customer/name, and amount.
Update quote status to Sent.
Update quote status to Accepted, Rejected, or Expired.
Confirm quote status changes are audit logged.
Confirm `GET /quotes` returns `HTTP/1.1 200 OK`.
Confirm customer-specific quote history returns the customer’s quotes.
---
✅ Phase 11a+ — Completed
Phase 11a+ added printable quote documents and browser-based quote printing/export.
Implemented
Printable quote document endpoint:
`GET /quotes/{quoteId}/document`
Printable HTML quote layout generated from database quote records
Document includes:
Quote number
Quote status
Quote date
Generated date
Customer name
Customer type
Customer email
Customer phone
Customer address
Quote title
Quote description
Quote amount
Sent/accepted/rejected/expired dates where available
Built-in `Print / Save as PDF` button inside the generated quote document
Browser-based hard-copy printing support
Browser-based local “Save as PDF” support
Frontend `View / Print` button in the global Quotes panel
Frontend `View / Print` button in the Customer Quotes section
Authenticated frontend quote document fetch
Blob-based printable document opening in a new browser tab/window
Quote document generation audit event:
`QuoteDocumentGenerated`
Safe HTML encoding for customer and quote fields
Compile-safe C# raw string quote document template
No database migration required
No additional Vite proxy route required because `/quotes` was already proxied
Verified Flow
Sign in as Owner or Admin.
Find an existing quote in the global Quotes panel.
Click `View / Print`.
Confirm the printable quote document opens in a new tab/window.
Click `Print / Save as PDF` inside the generated document.
Confirm the browser print dialog opens.
Save as PDF or print a hard copy.
Select the linked customer.
Confirm the same quote can be opened from Customer Quotes.
Confirm Audit Review shows `QuoteDocumentGenerated`.
Confirm backend build succeeds after the raw string template fix.
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
Owner:
owner@localcrm.dev
Owner123!

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
Login as Owner and Store Token
```bash
OWNER_TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@localcrm.dev","password":"Owner123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
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
Get Dashboard Summary as Owner
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/dashboard/summary
```
Get Dashboard Summary as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/dashboard/summary
```
List Users as Owner
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/users
```
List Users as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/users
```
Create Admin User as Owner
```bash
curl -i -X POST http://localhost:8080/users/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"displayName":"Test Admin","email":"test.admin@localcrm.dev","password":"Admin1234!"}'
```
Confirm Admin Cannot Create Admin User
```bash
curl -i -X POST http://localhost:8080/users/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"displayName":"Blocked Admin","email":"blocked.admin@localcrm.dev","password":"Admin1234!"}'
```
Expected:
```text
HTTP/1.1 403 Forbidden
```
Change Own Password
```bash
curl -i -X POST http://localhost:8080/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"currentPassword":"Staff123!","newPassword":"NewStaff123!"}'
```
Reset Staff Password as Owner
Replace `<USER_ID>` with an actual Staff user ID from `GET /users`.
```bash
curl -i -X POST http://localhost:8080/users/<USER_ID>/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"newPassword":"ResetStaff123!"}'
```
Reset Staff Password as Admin
Replace `<USER_ID>` with an actual Staff user ID from `GET /users`.
```bash
curl -i -X POST http://localhost:8080/users/<USER_ID>/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"newPassword":"ResetStaff123!"}'
```
Create Staff User as Admin
```bash
curl -i -X POST http://localhost:8080/users/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"displayName":"Test Staff","email":"test.staff@localcrm.dev","password":"Staff1234!"}'
```
Create Staff User as Owner
```bash
curl -i -X POST http://localhost:8080/users/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"displayName":"Owner Created Staff","email":"owner.created.staff@localcrm.dev","password":"Staff1234!"}'
```
Query Global Audit as Owner
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/audit?action=Login&entityType=User"
```
Query Global Audit by Actor and Date
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/audit?performedBy=owner&from=2026-01-01&to=2026-12-31"
```
Query Global Audit by Entity Type
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/audit?entityType=Customer"
```
Create Quote
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -i -X POST http://localhost:8080/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"customerId":"<CUSTOMER_ID>","title":"Test Quote","description":"Initial quote record","amount":1000.00,"status":"Draft"}'
```
List Quotes
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/quotes?status=All&sortBy=date&sortDirection=desc"
```
Expected:
```text
HTTP/1.1 200 OK
```
Filter Quotes by Status
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/quotes?status=Draft&sortBy=date&sortDirection=desc"
```
Search Quotes
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/quotes?q=test&status=All&sortBy=date&sortDirection=desc"
```
Get Customer Quotes
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/customers/<CUSTOMER_ID>/quotes
```
Update Quote Status
Replace `<QUOTE_ID>` with an actual quote ID.
```bash
curl -i -X POST http://localhost:8080/quotes/<QUOTE_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"Sent"}'
```
Generate Printable Quote Document
Replace `<QUOTE_ID>` with an actual quote ID.
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/quotes/<QUOTE_ID>/document
```
Expected:
```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```
Submit Customer Edit Request as Staff
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -i -X POST http://localhost:8080/customers/<CUSTOMER_ID>/edit-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"name":"Requested Customer Name","type":"Company","email":"requested@example.com","phone":"555-0100","addressLine1":"","addressLine2":"","city":"Oklahoma City","state":"OK","postalCode":"73101","status":"Active"}'
```
List Pending Edit Requests as Owner
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=Pending"
```
List Pending Edit Requests as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=Pending"
```
List Approved Edit Requests as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=Approved"
```
List Rejected Edit Requests as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=Rejected"
```
List All Edit Requests as Admin
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=All"
```
Filter Edit Requests by Requester
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=All&requestedBy=staff"
```
Filter Edit Requests by Date Range
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/customer-edit-requests?status=All&from=2026-01-01&to=2026-12-31"
```
Approve Edit Request as Owner
Replace `<REQUEST_ID>` with an actual edit request ID.
```bash
curl -i -X POST http://localhost:8080/customer-edit-requests/<REQUEST_ID>/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"note":"Approved by Owner"}'
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
Phase 11b
Contracts with DOCX/PDF import/export and physical hard-copy printing
Link contracts to customers, quotes, and scope of work
Mark contracts as `signed` or `completed/billable`
Sort contracts by name, status, and date
Phase 12
Scope-of-work records with linking to customer/quote/contract
DOCX/PDF import/export
Physical hard-copy printing
Phase 13
Document templates for quotes, contracts, and scope-of-work
Server-side DOCX/PDF generation
Document template mapping
Quote attachment/document storage strategy
Later Phases
Phase 14: Email workflow
Phase 15: Calendar/ICS export
Phase 16: Requisition creation with conversion to Purchase Order, DOCX/PDF import/export, and physical hard-copy printing with sorting by requisition creator, requisition number, purchase order number, date, vendor name
Phase 17: Accounts Payable tied to Requisitions/Purchase Orders and Accounts Receivable/Invoicing tied to Contracts, with markable `Paid`, `Due`, and `Unpaid` statuses tied to Calendar/ICS alerts. Accounts Payable sorting and searching by vendor name, requisition creator, requisition number, purchase order number, date. Accounts Receivable/Invoicing sorting and searching by customer name, customer address, customer phone number, invoice number, invoice status, contract number, date
Phase 18: Backup/export tools
Phase 19: Tenant/custom branding support
Phase 20: Layout Clean-up and Streamlining. Tabbed sections for ease of navigation; post-login splash page displays section tabs/buttons, pending requests, and audit log
---
📌 Status
Current milestone:
```text
Phase 11a+ complete — Printable quote documents, browser-based hard-copy printing, browser Save-as-PDF workflow, quote document audit events, and frontend View / Print controls are working.
```
---
👤 Author
Baine S. Hadick  
Independent Researcher & Developer