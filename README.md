LocalCRM — Full-Stack CRM System
LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.
This project demonstrates end-to-end system design, including API development, database persistence, frontend interaction, customer workflow modeling, quote workflow modeling, contract workflow modeling, scope-of-work workflow modeling, quote/contract/scope-of-work document generation, document-template management, template-backed document rendering, DOCX template import/export, generated document storage/download, session-only email workflow configuration, backend SMTP email sending, generated-document email attachments, CRM-aware email draft refinement, saved per-user email settings, encrypted SMTP credential storage, saved-config email sending, session override email sending, audit activity, backend-backed search, role-aware workflows, Owner/Admin/Staff permission hardening, JWT authentication, password hashing, approval workflows, dashboard reporting, password management, security-sensitive audit review, UI state handling, and containerized development environments.
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
Contract record workflow
Contract status workflow
Optional quote-to-contract linking
Scope-of-work record workflow
Scope-of-work status workflow
Quote/contract/scope-of-work linking
Printable quote document workflow
Printable contract document workflow
Printable scope-of-work document workflow
Document-template storage and management
DOCX template import/export foundation
Original template file storage and export
Generated document file storage and download
Template-backed printable document rendering
Placeholder token replacement for generated documents
Browser-printable HTML document generation
Server-side generated HTML document file creation
Session-only email workflow configuration
Backend SMTP email sending with session-supplied settings
Backend SMTP email sending with saved per-user settings
Saved per-user email configuration foundation
Encrypted SMTP password/app-password storage
Decrypt-only-during-send saved SMTP workflow
Generated-document email attachment workflow
CRM-aware email draft preparation
Customer/document-context email prefill
Owner/Admin per-user email settings management
Saved-config email send workflow
Session override email send workflow
Current-vs-requested approval review data
Dashboard summary endpoint
Request queue filtering by status, requester, and date range
Global audit filtering by entity, action, actor, and date range
Password hashing with ASP.NET Core Identity password hasher
Authenticated password change workflow
Admin/Owner Staff password reset workflow
Owner-only Admin user creation workflow
Security-sensitive audit events for login, password changes/resets, user creation, quote activity, quote document generation, contract activity, contract document generation, scope-of-work activity, and scope-of-work document generation
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
Contract creation workflow
Contract list/search/filter/sort workflow
Contract status controls
Customer-specific contract history
Contract View / Print workflow
Scope-of-work creation workflow
Scope-of-work list/search/filter/sort workflow
Scope-of-work status controls
Customer-specific scope-of-work history
Scope-of-work View / Print workflow
Admin/Owner document-template management panel
Template seeding, editing, activation/deactivation, default selection, DOCX import, and template export
Generated document file creation/download workflow
Session-only email settings workflow
Backend email send workflow
Generated-document email attachment workflow
CRM-aware email recipient/subject/body prefill workflow
Saved per-user email settings workflow
Encrypted saved SMTP secret workflow
Saved-config email send workflow
Session override email send fallback
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
Session-only email workflow settings panel
Email send panel
Saved/session send mode selector
Saved-config send readiness display
Generated-document attachment selection
CRM-aware email prefill controls
Saved email configuration status panel
Admin/Owner email configuration panel
Local session persistence with browser localStorage
Infrastructure
Docker
PostgreSQL container
Dev Containers
GitHub Codespaces-ready development environment
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
Owner users can create contracts and manage contract statuses
Owner users can view and print contract documents
Owner users can create scopes of work and manage scope-of-work statuses
Owner users can view and print scope-of-work documents
Owner users can manage document templates
Owner users can import and export document templates
Owner users can generate and download stored document files
Owner users can configure session-only email workflow settings and send email through explicit session-supplied SMTP settings
Owner users can configure saved per-user email settings with encrypted SMTP passwords
Owner users can send email through saved per-user email settings by default
Admin users can create customers
Admin users can directly edit customers
Admin users can create Staff users
Admin users can reset Staff passwords
Admin users can review global audit activity
Admin users can create quotes and manage quote statuses
Admin users can view and print quote documents
Admin users can create contracts and manage contract statuses
Admin users can view and print contract documents
Admin users can create scopes of work and manage scope-of-work statuses
Admin users can view and print scope-of-work documents
Admin users can manage document templates
Admin users can import and export document templates
Admin users can generate and download stored document files
Admin users can configure session-only email workflow settings and send email through explicit session-supplied SMTP settings
Admin users can configure saved per-user email settings with encrypted SMTP passwords
Admin users can send email through saved per-user email settings by default
Admin users cannot create Admin or Owner users
Staff users can create customers
Staff users can view/search customers
Staff users can view customer notes and customer-specific audit activity
Staff users can create quotes
Staff users can view quote records
Staff users can view and print quote documents
Staff users can create contracts
Staff users can view contract records
Staff users can view and print contract documents
Staff users can create scopes of work
Staff users can view scope-of-work records
Staff users can view and print scope-of-work documents
Staff users can configure session-only email workflow settings and send email through explicit session-supplied SMTP settings
Staff users can view whether their saved email configuration exists
Staff users can send email through their own saved email settings when configured
Staff users cannot directly edit customer records
Staff users cannot view the global audit review panel
Staff users cannot manage quote, contract, or scope-of-work status transitions
Staff users can submit customer edit requests
Owner/Admin users can approve or reject Staff-submitted edit requests
Backend enforces Owner-only Admin creation
Backend enforces Admin/Owner Staff user creation
Backend enforces Admin/Owner customer edits
Backend enforces Admin/Owner Staff password reset
Backend enforces Admin/Owner edit-request approval/rejection
Backend enforces Admin/Owner-only global audit review
Backend enforces Admin/Owner-only quote status updates
Backend enforces Admin/Owner-only contract status updates
Backend enforces Admin/Owner-only scope-of-work status updates
Backend enforces Admin/Owner-only document-template import/export
Backend stores generated document files from authenticated document-generation workflows
Backend stores saved per-user email settings with encrypted SMTP secrets
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
Template-backed document rendering is available when active/default templates exist; server-side generated HTML file storage is available; DOCX/PDF generation remains planned for a later layer
Contract Management
Create contract records linked to customers
Optionally link contracts to quote records
Link contracts to scope-of-work records through `ScopeOfWorkId`
Store contract number, title, description, amount, status, and dates
Automatically generate contract numbers
View global contract list
View customer-specific contract history under Customer Detail
Search contracts by customer name, contract number, title, description, and quote number
Filter contracts by status
Filter contracts by contract date range
Sort contracts by:
Date
Status
Customer/name
Amount
Supported contract statuses:
Draft
Sent
Signed
Completed/Billable
Cancelled
Admin/Owner users can update contract statuses
Contract creation is audit logged
Contract status changes are audit logged
Contract Documents
Generate printable contract documents from database-backed contract records
View/print contract documents from the global Contracts panel
View/print contract documents from the Customer Contracts section
Printable contract document includes:
Contract number
Contract status
Contract date
Generated date
Customer name
Customer type
Customer email
Customer phone
Customer address
Linked quote number/status when available
Linked scope-of-work ID when available
Contract title
Contract description
Contract amount
Sent/signed/completed-billable/cancelled dates when available
Signature lines
Built-in `Print / Save as PDF` button inside the contract document
Browser print supports physical hard-copy printing
Browser print dialog supports local “Save as PDF”
Contract document generation is audit logged
Printable contract document output uses safe HTML encoding for customer, quote, and contract fields
Template-backed document rendering is available when active/default templates exist; server-side generated HTML file storage is available; DOCX/PDF generation remains planned for a later layer
Scope of Work Management
Create scope-of-work records linked to customers
Optionally link scope-of-work records to quote records
Optionally link scope-of-work records to contract records
Backfill a linked contract’s `ScopeOfWorkId` when creating a linked scope of work
Store scope number, title, description, deliverables, assumptions, exclusions, estimated amount, status, and dates
Automatically generate scope-of-work numbers
View global scope-of-work list
View customer-specific scope-of-work history under Customer Detail
Search scopes of work by customer name, scope number, title, description, deliverables, quote number, and contract number
Filter scopes of work by status
Filter scopes of work by scope-of-work date range
Sort scopes of work by:
Date
Status
Customer/name
Amount
Supported scope-of-work statuses:
Draft
In Review
Approved
Active
Completed
Cancelled
Admin/Owner users can update scope-of-work statuses
Scope-of-work creation is audit logged
Scope-of-work status changes are audit logged
Scope of Work Documents
Generate printable scope-of-work documents from database-backed scope-of-work records
View/print scope-of-work documents from the global Scopes of Work panel
View/print scope-of-work documents from the Customer Scopes of Work section
Printable scope-of-work document includes:
Scope number
Scope status
Scope date
Generated date
Customer name
Customer type
Customer email
Customer phone
Customer address
Linked quote number/status when available
Linked contract number/status when available
Scope title
Scope description
Deliverables
Assumptions
Exclusions
Estimated amount
In-review/approved/active/completed/cancelled dates when available
Built-in `Print / Save as PDF` button inside the scope-of-work document
Browser print supports physical hard-copy printing
Browser print dialog supports local “Save as PDF”
Scope-of-work document generation is audit logged
Printable scope-of-work document output uses safe HTML encoding for customer, quote, contract, and scope-of-work fields
Template-backed scope-of-work document output uses safe placeholder replacement when templates are active
Hardcoded printable scope-of-work document layout remains available as fallback
Generated scope-of-work HTML files can be created and downloaded from stored generated-document records
Document Template Management
Create reusable document templates for Quote, Contract, and ScopeOfWork documents
Store template name, document type, HTML template content, source format, original filename, original content type, original file bytes, imported timestamp, active state, and default state
Seed default document templates for Quote, Contract, and ScopeOfWork
Filter templates by document type
Edit existing document templates
Set active templates as the default for their document type
Activate and deactivate templates
Import DOCX templates created in Word or compatible editors
Store the original imported DOCX file for later export and later server-side rendering work
Export HTML-created templates as `.html`
Export DOCX-imported templates as the original `.docx`
Track template source format as `Html` or `Docx`
Track original imported filename and imported timestamp
Deactivate action clears default state for that template
Admin/Owner-only template management UI
Admin/Owner-only template management API
Audit trail records template creation, update, default selection, activation, deactivation, seeding, import, and export
Current HTML template content remains the Phase 13 internal rendering foundation
DOCX import/export foundation is implemented; full DOCX-to-record rendering remains planned for the later document generation layer
Template-backed Document Rendering
Quote documents use active/default Quote templates when available
Contract documents use active/default Contract templates when available
Scope-of-work documents use active/default ScopeOfWork templates when available
When no active/default template exists, document endpoints fall back to the existing hardcoded printable layouts
Placeholder replacement engine supports reusable document tokens
Supported common placeholder tokens include:
`{{CustomerName}}`
`{{CustomerEmail}}`
`{{CustomerPhone}}`
`{{CustomerAddress}}`
`{{Title}}`
`{{Description}}`
`{{Status}}`
`{{GeneratedDate}}`
Supported quote placeholder tokens include:
`{{QuoteNumber}}`
`{{QuoteDate}}`
`{{Amount}}`
`{{SentDate}}`
`{{AcceptedDate}}`
`{{RejectedDate}}`
`{{ExpiredDate}}`
Supported contract placeholder tokens include:
`{{ContractNumber}}`
`{{ContractDate}}`
`{{QuoteNumber}}`
`{{QuoteStatus}}`
`{{ScopeOfWorkId}}`
`{{Amount}}`
`{{SentDate}}`
`{{SignedDate}}`
`{{CompletedBillableDate}}`
`{{CancelledDate}}`
Supported scope-of-work placeholder tokens include:
`{{ScopeNumber}}`
`{{ScopeDate}}`
`{{QuoteNumber}}`
`{{QuoteStatus}}`
`{{ContractNumber}}`
`{{ContractStatus}}`
`{{Deliverables}}`
`{{Assumptions}}`
`{{Exclusions}}`
`{{EstimatedAmount}}`
`{{ReviewedDate}}`
`{{ApprovedDate}}`
`{{ActivatedDate}}`
`{{CompletedDate}}`
`{{CancelledDate}}`
Generated Document Storage
Create stored generated document files from Quote records
Create stored generated document files from Contract records
Create stored generated document files from ScopeOfWork records
Generated document files currently store rendered HTML output
Generated document records store:
Document type
Source entity type
Source entity ID
Template ID when template-backed
File name
Content type
File bytes
Generated by
Generated date
Created date
Generated documents can be listed globally
Generated documents can be filtered by source entity type
Generated documents can be filtered by source entity ID
Generated documents can be filtered by document type
Generated documents can be downloaded as files
Generated document creation is audit logged
Generated document download is audit logged
Existing browser View / Print workflow remains intact
Session-only Email Workflow Configuration and Sending
Configure SMTP host, port, TLS setting, From email, display name, username, and password in the CRM UI
Session override email settings are stored only in React memory state
Session override email settings are not saved to PostgreSQL
Session override email settings are not saved to browser localStorage
Session override email settings clear on logout
Session override email settings clear on session expiration
Session override email settings clear on page refresh
Session override SMTP password is held only in frontend session state
Session override SMTP settings are sent to the backend only when the user explicitly clicks `Send Email`
Backend email send endpoint can accept SMTP settings in the request body for temporary session override sending
Saved per-user email settings are now the default send path when configured
Backend email send endpoint can use saved per-user email settings without exposing saved SMTP secrets to the frontend
Backend decrypts saved SMTP password/app-password only inside the explicit send request
Backend does not persist recipient fields or message body
Email send workflow supports To, CC, BCC, subject, body, and plain-text/HTML mode
Email send validation checks SMTP config, sender, recipient email format, subject, body, and attachment ID
Generated documents can be attached to outbound email by `GeneratedDocumentId`
Generated document file bytes are loaded from the existing GeneratedDocuments table for attachment
Newly generated quote/contract/scope-of-work files auto-attach to the email draft
Generated document attachment dropdown can be refreshed
Generated document email actions use quote/contract/scope-of-work context where available
Email recipient can be prefilled from the selected/customer-linked customer email when available
Email subject can be prefilled from quote, contract, or scope-of-work context
Email body can be prefilled from quote, contract, or scope-of-work context
Selected email attachment display includes source-document context
Email attachment can be cleared without clearing the full draft
Email send success is audit logged
Email send failure is audit logged
Email validation failure is audit logged
Audit events do not expose SMTP passwords, usernames, full recipient lists, or message bodies
Email send audit entries identify whether saved settings or session override settings were used
Saved Per-User Email Configuration Foundation
`UserEmailSettings` stores persistent per-user SMTP configuration metadata
Saved configuration stores SMTP host, port, TLS setting, From email, display name, and username
Saved SMTP password/app password is encrypted before storage
Saved SMTP password/app password is never returned to the frontend
Current user can see whether saved email settings are configured
Owner/Admin users can create or update saved email settings for each user
Owner/Admin users can clear saved email settings for each user
Owner/Admin UI shows saved-password status without displaying the secret
Owner/Admin users can copy saved non-secret settings to the session override form
Session override workflow remains available for testing
Saved email settings are visually separated from session-only override settings
Saved email configuration save action is audit logged
Saved email configuration clear action is audit logged
Phase 15b updates `/email/send` so saved per-user email settings are the default send path while session override remains available
Saved Email Send Workflow
`/email/send` resolves email settings before sending
When session SMTP settings are supplied, `/email/send` uses the session override path
When session SMTP settings are blank, `/email/send` loads the signed-in user's saved email settings
Saved settings must be configured, active, and password-backed before sending
Saved SMTP password/app-password is decrypted only inside the explicit send request
Saved SMTP password/app-password is never returned to the frontend
Saved SMTP password/app-password is not written to audit logs
Email send response identifies successful send behavior without exposing credentials
Frontend Email Send panel defaults to saved settings when available
Frontend send mode selector supports:
`Use Saved Email Settings`
`Use Session Override`
Frontend send readiness display shows saved/session availability
Frontend sender source display shows saved/session sender path
Generated-document `Email File` action works when saved config is ready or session override is ready
Session override remains available for temporary testing/provider troubleshooting
SMTP provider configuration problems remain outside LocalCRM's credential-storage architecture
Search & Filtering
Backend-backed customer search
Search by name, email, phone, type, city, and state
Filter customers by status
Combine text search with status filtering
Customer result count display
Backend-backed quote search/filter/sort
Backend-backed contract search/filter/sort
Backend-backed scope-of-work search/filter/sort
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
Audit entries for contract creation
Audit entries for contract status changes
Audit entries for printable contract document generation
Audit entries for scope-of-work creation
Audit entries for scope-of-work status changes
Audit entries for printable scope-of-work document generation
Audit entries for document template creation
Audit entries for document template updates
Audit entries for document template default selection
Audit entries for document template activation/deactivation
Audit entries for default document template seeding
Audit entries for document template import
Audit entries for document template export
Audit entries for generated document creation
Audit entries for generated document downloads
Audit entries for email send success
Audit entries for email send failure
Audit entries for email send validation failure
Audit entries identify saved-settings vs session-override send path
Audit entries for saved user email settings creation/update
Audit entries for saved user email settings clearing
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
Contract form state
Contract filter/sort state
Contract status action state
Contract document opening state
Customer contract history state
Scope-of-work form state
Scope-of-work filter/sort state
Scope-of-work status action state
Scope-of-work document opening state
Customer scope-of-work history state
Document template list state
Document template filter state
Document template create/edit form state
Document template seed/default/active-state action state
Document template import form state
Document template export action state
Generated document list state
Generated document selected-source state
Generated document create/download action state
Session-only email configuration state
Email draft/send state
Generated-document email attachment state
CRM-aware email prefill state
Email selected-attachment state
Saved email configuration status state
Admin/Owner saved email settings form state
Saved email settings validation state
Email configuration validation state
Email send validation state
Saved/session email send mode state
Saved-config email send readiness state
Account security form state
Staff password reset form state
Owner-only Admin creation form state
Global audit review filter state
Clear validation messages for customer, quote, contract, scope-of-work, document-template, email configuration, email draft, note, login, Staff user, Admin user, password, audit, and edit request forms
Backend Reliability Features
Backend health check
Database connectivity status
Structured console logging
JSON error response middleware
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
Contracts
`GET /contracts?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&from=&to=`
`GET /customers/{customerId}/contracts`
`POST /contracts`
`GET /contracts/{contractId}/document`
`POST /contracts/{contractId}/status`
Scopes of Work
`GET /scopes-of-work?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&contractId=&from=&to=`
`GET /customers/{customerId}/scopes-of-work`
`POST /scopes-of-work`
`GET /scopes-of-work/{scopeId}/document`
`POST /scopes-of-work/{scopeId}/status`
Generated Documents
`GET /generated-documents?sourceEntityType=&sourceEntityId=&documentType=`
`GET /generated-documents/{generatedDocumentId}/download`
`POST /quotes/{quoteId}/generated-documents`
`POST /contracts/{contractId}/generated-documents`
`POST /scopes-of-work/{scopeId}/generated-documents`
Email
`POST /email/send`
Email Settings
`GET /email-settings/me`
`GET /email-settings/users/{userId}`
`PUT /email-settings/users/{userId}`
`POST /email-settings/users/{userId}/clear`
Document Templates
`GET /document-templates?documentType=&activeOnly=`
`GET /document-templates/{templateId}`
`GET /document-templates/{templateId}/export`
`POST /document-templates/import`
`POST /document-templates`
`PUT /document-templates/{templateId}`
`POST /document-templates/{templateId}/default`
`POST /document-templates/{templateId}/active`
`POST /document-templates/seed-defaults`
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
`GET /contracts?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&from=&to=`
`GET /customers/{customerId}/contracts`
`POST /contracts`
`GET /contracts/{contractId}/document`
`GET /scopes-of-work?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&contractId=&from=&to=`
`GET /customers/{customerId}/scopes-of-work`
`POST /scopes-of-work`
`GET /scopes-of-work/{scopeId}/document`
`GET /generated-documents?sourceEntityType=&sourceEntityId=&documentType=`
`GET /generated-documents/{generatedDocumentId}/download`
`POST /quotes/{quoteId}/generated-documents`
`POST /contracts/{contractId}/generated-documents`
`POST /scopes-of-work/{scopeId}/generated-documents`
`POST /email/send`
`GET /email-settings/me`
`POST /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/edit-requests`
`GET /customers/{customerId}/notes`
`POST /customers/{customerId}/notes`
`GET /customers/{customerId}/audit`
Admin / Owner Routes
Require a valid JWT bearer token with the `Admin` or `Owner` role:
`GET /dashboard/summary`
`GET /users`
`GET /email-settings/users/{userId}`
`PUT /email-settings/users/{userId}`
`POST /email-settings/users/{userId}/clear`
`PUT /customers/{id}`
`POST /users/staff`
`POST /users/{userId}/reset-password`
`POST /quotes/{quoteId}/status`
`POST /contracts/{contractId}/status`
`POST /scopes-of-work/{scopeId}/status`
`GET /document-templates?documentType=&activeOnly=`
`GET /document-templates/{templateId}`
`GET /document-templates/{templateId}/export`
`POST /document-templates/import`
`POST /document-templates`
`PUT /document-templates/{templateId}`
`POST /document-templates/{templateId}/default`
`POST /document-templates/{templateId}/active`
`POST /document-templates/seed-defaults`
`GET /customer-edit-requests?status=&requestedBy=&from=&to=`
`POST /customer-edit-requests/{requestId}/approve`
`POST /customer-edit-requests/{requestId}/reject`
`GET /audit?entityType=&entityId=&action=&performedBy=&from=&to=`
Owner-Only Routes
Require a valid JWT bearer token with the `Owner` role:
`POST /users/admin`
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
Contract workflow modeling
Contract status lifecycle handling
Scope-of-work workflow modeling
Scope-of-work status lifecycle handling
Optional quote-to-contract linking
Quote/contract/scope-of-work linking design
Automatic expiration logic
Printable document generation from database records
Template-backed document rendering
DOCX template import/export foundation
Original file byte storage and file download workflow
Generated file byte storage and generated document download workflow
Placeholder-token document generation
Default template selection and fallback document rendering
Stored generated document artifact workflow
Generated artifact email delivery workflow
Session-only sensitive configuration workflow
Saved per-user sensitive configuration foundation
Encrypted SMTP secret storage workflow
Session-supplied SMTP email sending workflow
Saved-config SMTP email sending workflow
Decrypt-only-during-send secret workflow
Generated-document email attachment workflow
CRM-aware generated-document email preparation workflow
Owner/Admin per-user email configuration workflow
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
✅ Phase 11b — Completed
Phase 11b added database-backed contracts, quote-linked contract records, customer contract history, contract status workflow, and printable contract documents.
Implemented
`Contract` model
`Contracts` database table
EF Core migration for contracts
`DbSet<Contract>` and contract model configuration
Contract number generation
Optional contract-to-quote linking
Future `ScopeOfWorkId` field for Phase 12
Contract creation endpoint:
`POST /contracts`
Global contract list/search/filter/sort endpoint:
`GET /contracts?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&from=&to=`
Customer-specific contract history endpoint:
`GET /customers/{customerId}/contracts`
Contract status update endpoint:
`POST /contracts/{contractId}/status`
Printable contract document endpoint:
`GET /contracts/{contractId}/document`
Supported contract statuses:
`Draft`
`Sent`
`Signed`
`Completed/Billable`
`Cancelled`
Contract creation audit event:
`ContractCreated`
Contract status change audit event:
`ContractStatusChanged`
Contract document generation audit event:
`ContractDocumentGenerated`
Frontend global Contracts panel
Frontend contract creation form
Frontend optional quote linking dropdown
Frontend contract search/filter/sort controls
Frontend contract status action controls
Frontend customer-specific contract history under Customer Detail
Frontend `View / Print` button in the global Contracts panel
Frontend `View / Print` button in the Customer Contracts section
Vite proxy support for `/contracts`
Verified Flow
Sign in as Owner or Admin.
Create a contract linked to a customer.
Optionally link the contract to an existing quote for that customer.
Confirm contract creation appears in Audit Review.
Confirm the contract appears in the global Contracts panel.
Select the linked customer.
Confirm the contract appears under Customer Contracts.
Filter contracts by status.
Search contracts by customer/name/title/contract number/quote number.
Sort contracts by date, status, customer/name, and amount.
Update contract status to Sent.
Update contract status to Signed, Completed/Billable, or Cancelled.
Confirm contract status changes are audit logged.
Click `View / Print` on a contract.
Confirm printable contract document opens in a new tab/window.
Confirm the contract document includes customer, quote link, amount, status dates, and signature lines.
Confirm `GET /contracts` returns `HTTP/1.1 200 OK`.
Confirm customer-specific contract history returns the customer’s contracts.
✅ Phase 12 — Completed
Phase 12 added database-backed scopes of work, quote/contract-linked SOW records, customer SOW history, SOW status workflow, and printable SOW documents.
Implemented
`ScopeOfWork` model
`ScopeOfWorks` database table
EF Core migration for scopes of work
`DbSet<ScopeOfWork>` and scope-of-work model configuration
Scope-of-work number generation
Optional scope-of-work-to-quote linking
Optional scope-of-work-to-contract linking
Contract `ScopeOfWorkId` backfill when a SOW is linked to a contract
Scope-of-work creation endpoint:
`POST /scopes-of-work`
Global scope-of-work list/search/filter/sort endpoint:
`GET /scopes-of-work?q=&status=&sortBy=&sortDirection=&customerId=&quoteId=&contractId=&from=&to=`
Customer-specific scope-of-work history endpoint:
`GET /customers/{customerId}/scopes-of-work`
Scope-of-work status update endpoint:
`POST /scopes-of-work/{scopeId}/status`
Printable scope-of-work document endpoint:
`GET /scopes-of-work/{scopeId}/document`
Supported scope-of-work statuses:
`Draft`
`In Review`
`Approved`
`Active`
`Completed`
`Cancelled`
Scope-of-work creation audit event:
`ScopeOfWorkCreated`
Scope-of-work status change audit event:
`ScopeOfWorkStatusChanged`
Scope-of-work document generation audit event:
`ScopeOfWorkDocumentGenerated`
Frontend global Scopes of Work panel
Frontend scope-of-work creation form
Frontend optional quote linking dropdown
Frontend optional contract linking dropdown
Frontend scope-of-work search/filter/sort controls
Frontend scope-of-work status action controls
Frontend customer-specific scope-of-work history under Customer Detail
Frontend `View / Print` button in the global Scopes of Work panel
Frontend `View / Print` button in the Customer Scopes of Work section
Vite proxy support for `/scopes-of-work`
Verified Flow
Sign in as Owner or Admin.
Create a scope of work linked to a customer.
Optionally link the scope of work to an existing quote for that customer.
Optionally link the scope of work to an existing contract for that customer.
Confirm scope-of-work creation appears in Audit Review.
Confirm the scope of work appears in the global Scopes of Work panel.
Select the linked customer.
Confirm the scope of work appears under Customer Scopes of Work.
Filter scopes of work by status.
Search scopes of work by customer/name/title/scope number/quote number/contract number.
Sort scopes of work by date, status, customer/name, and amount.
Update scope-of-work status to In Review.
Update scope-of-work status to Approved, Active, Completed, or Cancelled.
Confirm scope-of-work status changes are audit logged.
Click `View / Print` on a scope of work.
Confirm printable scope-of-work document opens in a new tab/window.
Confirm the scope-of-work document includes customer, quote link, contract link, deliverables, assumptions, exclusions, estimated amount, and status dates.
Confirm `GET /scopes-of-work` returns `HTTP/1.1 200 OK`.
Confirm customer-specific scope-of-work history returns the customer’s scopes of work.
✅ Phase 13 — Completed
Phase 13 added database-backed document templates, Admin/Owner template management, default/active template workflow, and template-backed rendering for quote, contract, and scope-of-work printable documents.
Implemented
`DocumentTemplate` model
`DocumentTemplates` database table
EF Core migration for document templates
`DbSet<DocumentTemplate>` and document-template model configuration
Document template management endpoints:
`GET /document-templates?documentType=&activeOnly=`
`GET /document-templates/{templateId}`
`GET /document-templates/{templateId}/export`
`POST /document-templates/import`
`POST /document-templates`
`PUT /document-templates/{templateId}`
`POST /document-templates/{templateId}/default`
`POST /document-templates/{templateId}/active`
`POST /document-templates/seed-defaults`
Supported document types:
`Quote`
`Contract`
`ScopeOfWork`
Default document template seeding for:
Quote templates
Contract templates
Scope-of-work templates
Admin/Owner frontend Document Templates panel
Template type filtering
Template create/edit form
Template HTML storage field
Seed Defaults action
Set Default action
Activate/deactivate action
Document template audit events:
`DocumentTemplateCreated`
`DocumentTemplateUpdated`
`DocumentTemplateDefaultSet`
`DocumentTemplateActivated`
`DocumentTemplateDeactivated`
`DocumentTemplateSeeded`
Template lookup helper
Active/default template selection
Placeholder replacement engine
Template-backed printable document wrapper
Quote placeholder map
Contract placeholder map
Scope-of-work placeholder map
Quote document endpoint uses active/default Quote template when available:
`GET /quotes/{quoteId}/document`
Contract document endpoint uses active/default Contract template when available:
`GET /contracts/{contractId}/document`
Scope-of-work document endpoint uses active/default ScopeOfWork template when available:
`GET /scopes-of-work/{scopeId}/document`
Existing hardcoded printable document layouts remain fallback when no active template is available
Browser View / Print workflow remains intact
DOCX template import/export remains planned for Phase 13c
Server-side generated DOCX/PDF output files remain planned for Phase 13d
Supported Placeholder Tokens
Common:
`{{CustomerName}}`
`{{CustomerType}}`
`{{CustomerEmail}}`
`{{CustomerPhone}}`
`{{CustomerAddress}}`
`{{Title}}`
`{{Description}}`
`{{Status}}`
`{{GeneratedDate}}`
Quote:
`{{QuoteId}}`
`{{QuoteNumber}}`
`{{QuoteDate}}`
`{{Amount}}`
`{{SentDate}}`
`{{AcceptedDate}}`
`{{RejectedDate}}`
`{{ExpiredDate}}`
Contract:
`{{ContractId}}`
`{{ContractNumber}}`
`{{ContractDate}}`
`{{QuoteId}}`
`{{QuoteNumber}}`
`{{QuoteStatus}}`
`{{ScopeOfWorkId}}`
`{{Amount}}`
`{{SentDate}}`
`{{SignedDate}}`
`{{CompletedBillableDate}}`
`{{CancelledDate}}`
Scope of Work:
`{{ScopeOfWorkId}}`
`{{ScopeNumber}}`
`{{ScopeDate}}`
`{{QuoteId}}`
`{{QuoteNumber}}`
`{{QuoteStatus}}`
`{{ContractId}}`
`{{ContractNumber}}`
`{{ContractStatus}}`
`{{Deliverables}}`
`{{Assumptions}}`
`{{Exclusions}}`
`{{EstimatedAmount}}`
`{{ReviewedDate}}`
`{{ApprovedDate}}`
`{{ActivatedDate}}`
`{{CompletedDate}}`
`{{CancelledDate}}`
Verified Flow
Sign in as Owner or Admin.
Confirm the Document Templates panel appears.
Seed default templates.
Confirm Quote, Contract, and ScopeOfWork templates are created.
Create a custom Quote template.
Edit the custom template.
Set the custom Quote template as default.
Open a quote with `View / Print`.
Confirm the quote document uses the selected template body.
Create or select a Contract template.
Open a contract with `View / Print`.
Confirm the contract document uses the selected template body.
Create or select a ScopeOfWork template.
Open a scope of work with `View / Print`.
Confirm the scope-of-work document uses the selected template body.
Deactivate a default template.
Confirm the generated document falls back cleanly when no active template is available.
Confirm Audit Review shows template events.
Confirm existing quote, contract, and scope-of-work document workflows still work.
✅ Phase 13c — Completed
Phase 13c added the DOCX template import/export foundation while preserving the existing HTML-backed rendering workflow.
Implemented
Extended `DocumentTemplate` model with import/export metadata:
`SourceFormat`
`OriginalFileName`
`OriginalContentType`
`OriginalFileBytes`
`ImportedAtUtc`
EF Core migration for document-template import/export fields
Updated document-template database configuration
Document template source-format tracking:
`Html`
`Docx`
DOCX original-file byte storage
Original imported filename storage
Original imported content-type storage
Imported timestamp storage
Template export endpoint:
`GET /document-templates/{templateId}/export`
DOCX template import endpoint:
`POST /document-templates/import`
HTML-created templates export as `.html`
DOCX-imported templates export as the original `.docx`
DOCX import validation:
Requires multipart form upload
Requires `.docx` file extension
Rejects empty files
Rejects files over 10 MB
Requires valid document type:
`Quote`
`Contract`
`ScopeOfWork`
Imported DOCX templates can be set as default
Imported DOCX templates can include optional fallback HTML
Imported DOCX templates receive placeholder fallback HTML when no fallback HTML is supplied
Existing template-backed quote/contract/scope-of-work rendering remains intact
Frontend DOCX Import Template panel
Frontend template source-format display
Frontend original filename display
Frontend imported date display
Frontend Export button per template
Frontend imported DOCX export workflow
Frontend HTML template export workflow
Document template import audit event:
`DocumentTemplateImported`
Document template export audit event:
`DocumentTemplateExported`
Verified Flow
Sign in as Owner or Admin.
Open the Document Templates panel.
Import a `.docx` template.
Confirm the imported template appears in the template list.
Confirm the imported template shows `Docx` source format.
Confirm the imported template shows the original filename.
Export the imported DOCX template.
Confirm the downloaded file is the original `.docx`.
Create or select an HTML-created template.
Export the HTML-created template.
Confirm the downloaded file is `.html`.
Set an imported DOCX template as default.
Confirm existing template-backed document rendering remains stable.
Confirm Audit Review shows `DocumentTemplateImported`.
Confirm Audit Review shows `DocumentTemplateExported`.
Important Phase 13c Boundary
Phase 13c stores and exports original DOCX templates. It does not yet render finished quote/contract/scope-of-work documents directly from DOCX files. Full DOCX-to-record rendering and generated output files are planned for the next document generation phase.
✅ Phase 13d — Completed
Phase 13d added stored generated document files for quote, contract, and scope-of-work records while preserving the existing browser View / Print workflow.
Implemented
`GeneratedDocument` model
`GeneratedDocuments` database table
EF Core migration for generated documents
`DbSet<GeneratedDocument>` and generated-document model configuration
Generated document metadata storage:
`DocumentType`
`SourceEntityType`
`SourceEntityId`
`TemplateId`
`FileName`
`ContentType`
`FileBytes`
`GeneratedBy`
`GeneratedAtUtc`
`CreatedAtUtc`
Generated document list endpoint:
`GET /generated-documents?sourceEntityType=&sourceEntityId=&documentType=`
Generated document download endpoint:
`GET /generated-documents/{generatedDocumentId}/download`
Quote generated-document endpoint:
`POST /quotes/{quoteId}/generated-documents`
Contract generated-document endpoint:
`POST /contracts/{contractId}/generated-documents`
Scope-of-work generated-document endpoint:
`POST /scopes-of-work/{scopeId}/generated-documents`
Server-side generated HTML file creation
Database-backed generated file byte storage
Template ID tracking when generated from an active/default template
Fallback layout tracking when no active/default template is used
Generated document global listing
Generated document download workflow
Frontend `Generate File` buttons for quotes
Frontend `Generate File` buttons for contracts
Frontend `Generate File` buttons for scopes of work
Frontend global Generated Documents panel
Frontend generated document download buttons
Generated document creation audit event:
`GeneratedDocumentCreated`
Generated document download audit event:
`GeneratedDocumentDownloaded`
Existing quote/contract/scope-of-work `View / Print` workflow remains intact
Existing document-template workflow remains intact
Existing DOCX template import/export workflow remains intact
Verified Flow
Sign in as Owner, Admin, or Staff.
Create or select a quote.
Click `Generate File`.
Confirm a stored generated HTML document is created.
Confirm the generated quote file appears in the Generated Documents panel.
Download the generated quote file.
Confirm the downloaded file opens as HTML.
Create or select a contract.
Click `Generate File`.
Confirm a stored generated HTML document is created.
Download the generated contract file.
Create or select a scope of work.
Click `Generate File`.
Confirm a stored generated HTML document is created.
Download the generated scope-of-work file.
Confirm Audit Review shows `GeneratedDocumentCreated`.
Confirm Audit Review shows `GeneratedDocumentDownloaded`.
Confirm `View / Print` still opens browser-printable documents.
Confirm template-backed rendering still works when active/default templates exist.
Confirm fallback layouts still work when no active/default template exists.
Important Phase 13d Boundary
Phase 13d stores generated HTML output files. It establishes the generated-document artifact pipeline. Full DOCX/PDF generation from CRM records and imported DOCX templates remains planned for the next document generation layer.
✅ Phase 14a — Completed
Phase 14a added a session-only email workflow configuration UI and local-only email draft preparation while intentionally avoiding credential persistence.
Implemented
`EmailConfigForm` frontend type
`EmailDraftForm` frontend type
Session-only email configuration state
Local-only email draft state
Session-ready email configuration flag
Email Workflow Settings panel
Email Draft Prep panel
SMTP host field
SMTP port field
Use TLS selector
From email field
From display name field
SMTP username field
SMTP password/app password field
Password status display
Email To field
Email CC field
Email BCC field
Email subject field
Email body field
Email configuration validation
Email draft validation
Save Email Settings for Session action
Clear Session Email Settings action
Prepare Draft action
Clear Draft action
Email settings clear on logout
Email settings clear on session expiration
Email settings clear on page refresh
Email drafts clear on logout/session reset
No backend email send endpoint added yet
No PostgreSQL persistence for email credentials
No localStorage persistence for SMTP credentials
No migration required
No Vite proxy update required
Security Boundary
Phase 14a intentionally keeps SMTP settings and passwords in frontend memory only.
Email settings are not persisted to PostgreSQL.
Email settings are not persisted to browser localStorage.
Email settings are not sent to the backend unless a later explicit send action is added.
The current design supports safe development testing without storing email credentials.
Production persistent email linking is planned for a later shippable-product layer where Owner/Admin users can configure per-user email workflow settings with proper secure storage.
Verified Flow
Sign in as Owner, Admin, or Staff.
Open the Email Workflow Settings panel.
Enter SMTP host, SMTP port, TLS option, From email, display name, username, and password.
Click `Save Email Settings for Session`.
Confirm the status changes to `Session Ready`.
Open the Email Draft Prep panel.
Enter To, optional CC/BCC, subject, and body.
Click `Prepare Draft`.
Confirm the draft validates successfully.
Sign out.
Sign back in.
Confirm email settings are cleared.
Confirm email draft data is cleared.
Refresh the browser.
Confirm session-only email settings do not persist.
Important Phase 14a Boundary
Phase 14a created the session-only configuration foundation. Phase 14b now sends email through backend SMTP using session-supplied settings. Phase 14c will refine the email send workflow around selected customers and document context.
Phase 14 Roadmap
Phase 14a:
Session-only email workflow configuration UI
Local-only email draft preparation
No backend sending
No credential persistence
Phase 14b:
Backend email send endpoint
Session-supplied SMTP settings only
Generated-document attachment support
Email send audit events without secret exposure
No SMTP credential persistence
Completed
Phase 14c:
Frontend email workflow refinement
Completed
Pre-fill recipient from selected customer/customer-linked email when available
Pre-fill subject/body from selected quote, contract, scope-of-work, or generated document context
Improve selected-document send flow
Add clearer attachment display
Add clear-attachment workflow
Keep session-only SMTP security boundary intact
Completed
✅ Phase 14b — Completed
Phase 14b added backend session-only SMTP email sending and wired the frontend email workflow to send generated document artifacts without persisting credentials.
Implemented
MailKit package added to the API project
MimeKit email message construction
Backend email send endpoint:
`POST /email/send`
Vite proxy support for:
`/email`
Session-supplied SMTP settings only
No PostgreSQL persistence for SMTP host
No PostgreSQL persistence for SMTP username
No PostgreSQL persistence for SMTP password
No PostgreSQL persistence for sender configuration
No PostgreSQL persistence for recipient fields
No PostgreSQL persistence for message body
SMTP settings accepted only inside explicit email send requests
Plain-text email body support
HTML email body support
To recipient support
CC recipient support
BCC recipient support
From email support
From display name support
SMTP username/password authentication support
TLS/StartTLS send configuration support
Generated-document attachment support through:
`GeneratedDocumentId`
Generated document file bytes loaded from the existing `GeneratedDocuments` table
Generated document filename/content type preserved for attachments
Backend validation for:
SMTP host
SMTP port
From email
To recipients
CC recipients
BCC recipients
Subject
Body
Total recipient count
Generated document attachment ID
Frontend email send workflow wired to:
`POST /email/send`
Frontend plain-text/HTML body selector
Frontend generated-document attachment selector
Frontend selected attachment display
Frontend `Email File` action on generated documents
Frontend `Refresh Attachments` action
Newly generated quote files auto-attach to the email draft
Newly generated contract files auto-attach to the email draft
Newly generated scope-of-work files auto-attach to the email draft
Email send success status handling
Email send failure status handling
Audit refresh after send attempts for Admin/Owner users
Email send success audit event:
`EmailSent`
Email send failure audit event:
`EmailSendFailed`
Email validation failure audit event:
`EmailSendValidationFailed`
Security Boundary
Phase 14b does not persist SMTP credentials.
Phase 14b does not persist SMTP host, sender, username, password, recipients, or message body.
SMTP settings remain session-only frontend state.
SMTP settings are sent to the backend only when the user explicitly clicks `Send Email`.
Audit entries avoid SMTP passwords, usernames, full recipient lists, and message bodies.
Production persistent email linking remains planned for a later shippable-product layer with secure per-user configuration storage.
Verified Flow
Install the MailKit package in the API project.
Build and run the backend.
Sign in as Owner, Admin, or Staff.
Open Email Workflow Settings.
Enter SMTP host, SMTP port, TLS option, From email, optional display name, username, and password/app password.
Click `Save Email Settings for Session`.
Generate a quote, contract, or scope-of-work file.
Confirm the generated file auto-attaches to the email draft.
Alternatively, click `Attach to Email` from the Generated Documents panel.
Confirm the generated document appears in the attachment selector.
Fill To, optional CC/BCC, subject, and body.
Choose plain-text or HTML body mode.
Click `Send Email`.
Confirm success or provider-specific failure feedback appears.
Confirm Audit Review shows `EmailSent` on success.
Confirm Audit Review shows `EmailSendFailed` on provider/send failure.
Confirm Audit Review shows `EmailSendValidationFailed` on validation failure.
Confirm logout/session expiration/page refresh clears email settings and draft state.
Important Phase 14b Boundary
Phase 14b sends email but still uses session-only SMTP settings. It does not implement persistent per-user email account linking. Persistent Owner/Admin-managed email configuration remains a later production-hardening layer.
✅ Phase 14c — Completed
Phase 14c refined the frontend email workflow so generated document email actions behave more like native CRM document delivery actions.
Implemented
CRM-aware generated-document context lookup
Customer lookup for generated quote documents
Customer lookup for generated contract documents
Customer lookup for generated scope-of-work documents
Recipient prefill from selected customer email when available
Recipient prefill from quote-linked customer email when available
Recipient prefill from contract-linked customer email when available
Recipient prefill from scope-of-work-linked customer email when available
Subject prefill for generated quote files
Subject prefill for generated contract files
Subject prefill for generated scope-of-work files
Body prefill for generated quote files
Body prefill for generated contract files
Body prefill for generated scope-of-work files
Improved selected attachment display with source-document context
Generated document action label changed from `Attach to Email` to `Email File`
`Use Selected Customer Email` action added
`Clear Attachment` action added
`Refresh Attachments` retained
Newly generated files still auto-select as email attachments
Generated quote files prepare CRM-aware email drafts
Generated contract files prepare CRM-aware email drafts
Generated scope-of-work files prepare CRM-aware email drafts
Backend `/email/send` endpoint remains unchanged
No backend migration required
No Vite proxy update required
No credential persistence added
Session-only SMTP security boundary retained
Security Boundary
Phase 14c does not change the credential model.
SMTP settings remain frontend session-only state.
SMTP settings are sent to the backend only when the user explicitly clicks `Send Email`.
SMTP settings are not stored in PostgreSQL.
SMTP settings are not stored in localStorage.
Email attachment selection and draft prefill are convenience UI behavior only.
Production persistent email linking remains planned for a later production-hardening layer.
Verified Flow
Sign in as Owner, Admin, or Staff.
Save email settings for the session.
Select a customer with an email address.
Generate a quote file.
Confirm the generated quote file auto-selects as the email attachment.
Confirm the recipient pre-fills when customer email context is available.
Confirm the subject/body prefill from quote context.
Generate or select a contract file.
Confirm the subject/body prefill from contract context.
Generate or select a scope-of-work file.
Confirm the subject/body prefill from scope-of-work context.
Click `Email File` from a generated document.
Confirm the email draft prepares with document context.
Click `Use Selected Customer Email`.
Confirm the selected customer email fills the To field when available.
Click `Clear Attachment`.
Confirm the attachment is removed without clearing the entire draft.
Click `Refresh Attachments`.
Confirm available generated documents remain selectable.
Send an email.
Confirm Phase 14b send/audit behavior still works.
Confirm logout/session expiration/page refresh clears email settings and draft state.
Important Phase 14c Boundary
Phase 14c improves the frontend email workflow only. It does not add persistent email account linking, encrypted credential storage, or new backend send behavior.
✅ Phase 15a — Completed
Phase 15a added the saved per-user email configuration foundation while preserving the existing session-only email send workflow.
Implemented
`UserEmailSettings` model
`UserEmailSettings` database table
EF Core migration path for saved user email settings
`DbSet<UserEmailSettings>` and model configuration
ASP.NET Core Data Protection service registration
Encrypted SMTP password/app-password storage
Saved per-user SMTP configuration metadata:
`UserId`
`SmtpHost`
`SmtpPort`
`UseTls`
`FromEmail`
`FromDisplayName`
`Username`
`EncryptedPassword`
`IsConfigured`
`IsActive`
`CreatedByEmail`
`UpdatedByEmail`
`CreatedAtUtc`
`UpdatedAtUtc`
`LastTestedAtUtc`
`LastTestSucceeded`
`LastTestMessage`
Current-user email settings status endpoint:
`GET /email-settings/me`
Admin/Owner selected-user email settings status endpoint:
`GET /email-settings/users/{userId}`
Admin/Owner save/update user email settings endpoint:
`PUT /email-settings/users/{userId}`
Admin/Owner clear user email settings endpoint:
`POST /email-settings/users/{userId}/clear`
Vite proxy support for:
`/email-settings`
Frontend `UserEmailSettings` type
Frontend `SavedEmailSettingsForm` type
Current-user saved email configuration status panel
Admin/Owner saved email configuration management panel
User selector for per-user email settings
Saved SMTP host/port/TLS/from/display-name/username form
Saved SMTP password/app-password field
Saved password status display
Save User Email Settings action
Clear Saved Settings action
Copy Non-Secret Settings to Session action
Saved email settings validation
Current-user email settings loader
Selected-user email settings loader
Saved email settings save workflow
Saved email settings clear workflow
Saved non-secret settings copy-to-session workflow
Session-only override workflow remains intact
Existing Phase 14 email send workflow remains intact
Security Boundary
SMTP password/app-password is encrypted on the backend before storage.
Saved SMTP password/app-password is never returned to the frontend.
The frontend can see only whether a saved password exists.
Admin/Owner users can save or clear per-user settings, but cannot retrieve saved secrets.
Audit logs record configuration save/clear actions without exposing secret values.
Session-only override remains available for testing and development.
`/email/send` still uses session-supplied SMTP settings in Phase 15a. Saved config sending is planned for Phase 15b.
Verified Flow
Create `UserEmailSettings.cs`.
Update `LocalCrmDbContext`.
Create and apply the Phase 15a migration.
Build and run the backend.
Sign in as Owner or Admin.
Confirm the Saved Email Configuration panel shows the current user's saved config status.
Open Admin Email Configuration.
Select a user.
Enter SMTP host, port, TLS option, From email, display name, username, and password/app password.
Click `Save User Email Settings`.
Confirm the saved password field shows only backend-saved status.
Refresh the page.
Confirm saved configuration status persists.
Confirm the password itself is not displayed.
Click `Copy Non-Secret Settings to Session`.
Confirm non-secret values copy into the session override form and password remains blank.
Click `Clear Saved Settings`.
Confirm saved settings are cleared.
Confirm Audit Review shows `UserEmailSettingsSaved`.
Confirm Audit Review shows `UserEmailSettingsCleared`.
Important Phase 15a Boundary
Phase 15a creates saved per-user email settings and encrypted credential storage. It does not yet make `/email/send` use saved credentials automatically. Phase 15b will update the send workflow to use saved config by default while keeping session override available.
✅ Phase 15b — Completed
Phase 15b updated the email send workflow so saved per-user email settings can be used directly for outbound email while preserving session override behavior for testing.
Implemented
Backend `/email/send` saved-settings resolution
Backend `/email/send` session-override resolution
Saved settings are used when session SMTP settings are not supplied
Session override is used when session SMTP values are supplied
Signed-in user lookup before saved-config sending
Saved `UserEmailSettings` lookup for the signed-in user
Saved settings validation:
configured
active
password-backed
Saved SMTP password/app-password decrypts only inside the explicit send request
Data Protection unprotect flow for saved SMTP password/app-password
Safe error response when saved SMTP password/app-password cannot be decrypted
Safe error response when saved email settings are missing
Safe error response when saved email settings are inactive
Safe error response when saved email settings do not include an encrypted password
Updated send validation to use resolved SMTP settings
Updated send message construction to use resolved sender settings
Updated SMTP connection/authentication to use resolved SMTP settings
Updated audit entries to identify saved vs session override send source
Updated send success response to identify saved vs session override send source
Updated frontend `EmailDraftForm` with send-mode state
Frontend send mode selector:
`Use Saved Email Settings`
`Use Session Override`
Frontend saved-config send readiness state
Frontend saved-config sender source display
Frontend session-override sender source display
Frontend send button label changes based on selected mode
Frontend saved-config send payload sends blank SMTP override fields and `useSavedEmailSettings: true`
Frontend session-override send payload sends session SMTP values and `useSavedEmailSettings: false`
Generated-document `Email File` action enabled when saved config is ready or session override is ready
Existing session-only override workflow remains intact
Existing generated-document attachment workflow remains intact
Existing CRM-aware recipient/subject/body prefill workflow remains intact
Security Boundary
Saved SMTP password/app-password is never returned to the frontend.
Saved SMTP password/app-password is decrypted only server-side during an explicit `/email/send` request.
Saved SMTP password/app-password is not logged.
SMTP username/password, full recipient lists, and message body are not exposed in audit logs.
Session override remains in memory only and still clears on logout/session expiration/page refresh.
Saved settings are now the default send path when configured, active, and password-backed.
Verified Flow
Build and run the backend.
Build and run the frontend.
Sign in as Owner, Admin, or Staff.
Confirm current user's saved email status loads.
Confirm Email Send defaults to `Use Saved Email Settings`.
Confirm saved-config readiness appears when saved settings are configured, active, and password-backed.
Fill To, Subject, and Body.
Click `Send Email with Saved Settings`.
Confirm backend attempts send using saved settings.
Confirm provider-specific SMTP failures are returned safely without exposing secrets.
Confirm Audit Review records the attempt and identifies saved settings as the send source.
Switch send mode to `Use Session Override`.
Confirm session override requires saved session SMTP settings before sending.
Save session SMTP override settings.
Send again through session override.
Confirm Audit Review identifies session override as the send source.
Confirm generated-document email attachment behavior still works.
Confirm logout/session expiration/page refresh still clears session override values.
Important Phase 15b Boundary
Phase 15b completes saved-config sending behavior. It does not guarantee external SMTP provider credentials are correct. Provider-specific SMTP host, port, app-password, TLS, and account security requirements remain a configuration issue outside LocalCRM's internal architecture.
---
⚙️ Running the Project
Start PostgreSQL
From the repository root:
```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres
```
Start the Backend API
```bash
cd apps/host-api/src/LocalCRM.Api
dotnet restore
dotnet run --urls=http://0.0.0.0:8080
```
Expected backend port:
```text
8080
```
Start the Frontend
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
Manual Phase 15b Saved Email Send Check
```text
1. Sign in through the frontend as Owner or Admin.
2. Confirm Saved Email Configuration shows current-user saved config status.
3. Save email settings for the signed-in user if not already configured.
4. Confirm saved config is active and password-backed.
5. Open Email Send.
6. Confirm Send Mode defaults to Use Saved Email Settings.
7. Fill To, Subject, and Body.
8. Click Send Email with Saved Settings.
9. Confirm success or safe provider-specific SMTP failure feedback.
10. Confirm Audit Review identifies the saved-settings send path.
11. Switch Send Mode to Use Session Override.
12. Confirm sending is disabled until session settings are saved.
13. Save temporary session SMTP override settings.
14. Send through session override.
15. Confirm Audit Review identifies the session-override send path.
16. Confirm saved SMTP password is never displayed in the UI.
```
Validate Email Send Endpoint Without Real SMTP
Expected result is `400 Bad Request` unless the signed-in user has valid saved SMTP settings.
Saved-settings send shape:
```bash
curl -i -X POST http://localhost:8080/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"smtpHost":"","smtpPort":0,"useTls":true,"fromEmail":"","fromDisplayName":"","username":"","password":"","to":"recipient@example.com","cc":"","bcc":"","subject":"Saved settings test","body":"Testing saved email settings.","isHtml":false,"generatedDocumentId":null,"useSavedEmailSettings":true}'
```
Session-override send shape:
```bash
curl -i -X POST http://localhost:8080/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"smtpHost":"smtp.example.com","smtpPort":587,"useTls":true,"fromEmail":"sender@example.com","fromDisplayName":"LocalCRM","username":"sender@example.com","password":"example-app-password","to":"recipient@example.com","cc":"","bcc":"","subject":"Session override test","body":"Testing session override email settings.","isHtml":false,"generatedDocumentId":null,"useSavedEmailSettings":false}'
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
Seed Default Document Templates
```bash
curl -i -X POST http://localhost:8080/document-templates/seed-defaults \
  -H "Authorization: Bearer $OWNER_TOKEN"
```
List Document Templates
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/document-templates?documentType=All"
```
List Active Quote Templates
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/document-templates?documentType=Quote&activeOnly=true"
```
Create Custom Quote Template
```bash
curl -i -X POST http://localhost:8080/document-templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Custom Quote Template","documentType":"Quote","contentHtml":"<section><h1>Quote {{QuoteNumber}}</h1><p>{{CustomerName}}</p><p>{{Amount}}</p></section>","isDefault":true}'
```
Set Document Template as Default
Replace `<TEMPLATE_ID>` with an actual template ID.
```bash
curl -i -X POST http://localhost:8080/document-templates/<TEMPLATE_ID>/default \
  -H "Authorization: Bearer $OWNER_TOKEN"
```
Deactivate Document Template
Replace `<TEMPLATE_ID>` with an actual template ID.
```bash
curl -i -X POST http://localhost:8080/document-templates/<TEMPLATE_ID>/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"isActive":false}'
```
Reactivate Document Template
Replace `<TEMPLATE_ID>` with an actual template ID.
```bash
curl -i -X POST http://localhost:8080/document-templates/<TEMPLATE_ID>/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"isActive":true}'
```
Export Document Template
Replace `<TEMPLATE_ID>` with an actual template ID.
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/document-templates/<TEMPLATE_ID>/export \
  --output exported-template.html
```
Import DOCX Document Template
Replace `/path/to/template.docx` with a real local `.docx` file path.
```bash
curl -i -X POST http://localhost:8080/document-templates/import \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -F "name=Imported Quote Template" \
  -F "documentType=Quote" \
  -F "isDefault=false" \
  -F "file=@/path/to/template.docx"
```
Import DOCX Document Template with Optional Fallback HTML
Replace `/path/to/template.docx` with a real local `.docx` file path.
```bash
curl -i -X POST http://localhost:8080/document-templates/import \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -F "name=Imported Contract Template" \
  -F "documentType=Contract" \
  -F "isDefault=false" \
  -F "contentHtml=<section><h1>{{ContractNumber}}</h1><p>{{CustomerName}}</p></section>" \
  -F "file=@/path/to/template.docx"
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
Generate Stored Quote Document File
Replace `<QUOTE_ID>` with an actual quote ID.
```bash
curl -i -X POST http://localhost:8080/quotes/<QUOTE_ID>/generated-documents \
  -H "Authorization: Bearer $OWNER_TOKEN"
```
List Stored Generated Documents for Quote
Replace `<QUOTE_ID>` with an actual quote ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/generated-documents?sourceEntityType=Quote&sourceEntityId=<QUOTE_ID>"
```
Download Stored Generated Document
Replace `<GENERATED_DOCUMENT_ID>` with an actual generated document ID.
```bash
curl -L -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/generated-documents/<GENERATED_DOCUMENT_ID>/download \
  --output generated-document.html
```
Create Contract
Replace `<CUSTOMER_ID>` with an actual customer ID. Replace `<QUOTE_ID>` with an actual quote ID or use `null`.
```bash
curl -i -X POST http://localhost:8080/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"customerId":"<CUSTOMER_ID>","quoteId":null,"scopeOfWorkId":null,"title":"Test Contract","description":"Initial contract record","amount":1500.00,"status":"Draft"}'
```
Create Contract Linked to Quote
Replace `<CUSTOMER_ID>` and `<QUOTE_ID>` with matching customer/quote IDs.
```bash
curl -i -X POST http://localhost:8080/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"customerId":"<CUSTOMER_ID>","quoteId":"<QUOTE_ID>","scopeOfWorkId":null,"title":"Quote-Linked Contract","description":"Contract created from quote","amount":1500.00,"status":"Draft"}'
```
List Contracts
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/contracts?status=All&sortBy=date&sortDirection=desc"
```
Expected:
```text
HTTP/1.1 200 OK
```
Filter Contracts by Status
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/contracts?status=Signed&sortBy=date&sortDirection=desc"
```
Search Contracts
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/contracts?q=test&status=All&sortBy=date&sortDirection=desc"
```
Get Customer Contracts
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/customers/<CUSTOMER_ID>/contracts
```
Update Contract Status
Replace `<CONTRACT_ID>` with an actual contract ID.
```bash
curl -i -X POST http://localhost:8080/contracts/<CONTRACT_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"Signed"}'
```
Generate Printable Contract Document
Replace `<CONTRACT_ID>` with an actual contract ID.
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/contracts/<CONTRACT_ID>/document
```
Expected:
```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```
Generate Stored Contract Document File
Replace `<CONTRACT_ID>` with an actual contract ID.
```bash
curl -i -X POST http://localhost:8080/contracts/<CONTRACT_ID>/generated-documents \
  -H "Authorization: Bearer $OWNER_TOKEN"
```
List Stored Generated Documents for Contract
Replace `<CONTRACT_ID>` with an actual contract ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/generated-documents?sourceEntityType=Contract&sourceEntityId=<CONTRACT_ID>"
```
Create Scope of Work
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -i -X POST http://localhost:8080/scopes-of-work \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"customerId":"<CUSTOMER_ID>","quoteId":null,"contractId":null,"title":"Test Scope of Work","description":"Initial scope record","deliverables":"Deliverable 1","assumptions":"Standard assumptions","exclusions":"Out-of-scope work","estimatedAmount":2000.00,"status":"Draft"}'
```
Create Scope of Work Linked to Quote and Contract
Replace `<CUSTOMER_ID>`, `<QUOTE_ID>`, and `<CONTRACT_ID>` with matching IDs.
```bash
curl -i -X POST http://localhost:8080/scopes-of-work \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"customerId":"<CUSTOMER_ID>","quoteId":"<QUOTE_ID>","contractId":"<CONTRACT_ID>","title":"Linked Scope of Work","description":"SOW linked to quote and contract","deliverables":"Deliverables list","assumptions":"Assumptions list","exclusions":"Exclusions list","estimatedAmount":2000.00,"status":"Draft"}'
```
List Scopes of Work
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/scopes-of-work?status=All&sortBy=date&sortDirection=desc"
```
Expected:
```text
HTTP/1.1 200 OK
```
Filter Scopes of Work by Status
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/scopes-of-work?status=Approved&sortBy=date&sortDirection=desc"
```
Search Scopes of Work
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/scopes-of-work?q=test&status=All&sortBy=date&sortDirection=desc"
```
Get Customer Scopes of Work
Replace `<CUSTOMER_ID>` with an actual customer ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/customers/<CUSTOMER_ID>/scopes-of-work
```
Update Scope of Work Status
Replace `<SCOPE_ID>` with an actual scope-of-work ID.
```bash
curl -i -X POST http://localhost:8080/scopes-of-work/<SCOPE_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"Approved"}'
```
Generate Printable Scope of Work Document
Replace `<SCOPE_ID>` with an actual scope-of-work ID.
```bash
curl -i -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/scopes-of-work/<SCOPE_ID>/document
```
Expected:
```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```
Generate Stored Scope of Work Document File
Replace `<SCOPE_ID>` with an actual scope-of-work ID.
```bash
curl -i -X POST http://localhost:8080/scopes-of-work/<SCOPE_ID>/generated-documents \
  -H "Authorization: Bearer $OWNER_TOKEN"
```
List Stored Generated Documents for Scope of Work
Replace `<SCOPE_ID>` with an actual scope-of-work ID.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/generated-documents?sourceEntityType=ScopeOfWork&sourceEntityId=<SCOPE_ID>"
```
List All Stored Generated Documents
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:8080/generated-documents"
```
Get Current User Email Settings Status
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/email-settings/me
```
Send Email Using Saved User Settings
Requires the signed-in user to have valid saved email settings.
```bash
curl -i -X POST http://localhost:8080/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"smtpHost":"","smtpPort":0,"useTls":true,"fromEmail":"","fromDisplayName":"","username":"","password":"","to":"recipient@example.com","cc":"","bcc":"","subject":"Saved settings send","body":"This send uses saved per-user email settings.","isHtml":false,"generatedDocumentId":null,"useSavedEmailSettings":true}'
```
Save Email Settings for a User
Replace `<USER_ID>` with an actual user ID from `GET /users`.
```bash
curl -i -X PUT http://localhost:8080/email-settings/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"smtpHost":"smtp.example.com","smtpPort":587,"useTls":true,"fromEmail":"sender@example.com","fromDisplayName":"LocalCRM","username":"sender@example.com","password":"example-app-password","isActive":true}'
```
Get Email Settings for a User
Replace `<USER_ID>` with an actual user ID from `GET /users`.
```bash
curl -H "Authorization: Bearer $OWNER_TOKEN" \
  http://localhost:8080/email-settings/users/<USER_ID>
```
Clear Email Settings for a User
Replace `<USER_ID>` with an actual user ID from `GET /users`.
```bash
curl -i -X POST http://localhost:8080/email-settings/users/<USER_ID>/clear \
  -H "Authorization: Bearer $OWNER_TOKEN"
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
Phase 15c:
Email provider troubleshooting/support hardening
Optional SMTP test endpoint that validates saved settings without sending customer documents
Provider-specific notes for Gmail, Outlook, Microsoft 365, and custom SMTP
Better provider failure display without exposing credentials
Optional saved-config last-tested timestamp/message update
Phase 16:
Calendar/ICS export
Create calendar events from quotes, contracts, scopes of work, and future invoice/payment due dates
Download `.ics` files
Optional email attachment support for calendar invites
Preserve local-first/no-external-calendar-account requirement
Later Phase:
DOCX/PDF generated output expansion
Later Phases
Phase 17: Requisition creation with conversion to Purchase Order, DOCX/PDF import/export, and physical hard-copy printing with sorting by requisition creator, requisition number, purchase order number, date, vendor name
Phase 18: Accounts Payable tied to Requisitions/Purchase Orders and Accounts Receivable/Invoicing tied to Contracts, with markable `Paid`, `Due`, and `Unpaid` statuses tied to Calendar/ICS alerts. Accounts Payable sorting and searching by vendor name, requisition creator, requisition number, purchase order number, date. Accounts Receivable/Invoicing sorting and searching by customer name, customer address, customer phone number, invoice number, invoice status, contract number, date
Phase 19: Backup/export tools
Phase 20: Tenant/custom branding support
Phase 21: Layout Clean-up and Streamlining. Tabbed sections for ease of navigation; post-login splash page displays section tabs/buttons, pending requests, and audit log
📌 Status
Current milestone:
```text
Phase 15b complete — `/email/send` can now use saved per-user email settings by default, decrypt saved SMTP secrets only during explicit send, preserve session override sending, and audit saved-vs-session send source without exposing credentials.
```
---
👤 Author
Baine S. Hadick  
Independent Researcher & Developer