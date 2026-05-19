import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

type Customer = {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type CustomerNote = {
  id: string;
  customerId: string;
  content: string;
  isPinned: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details: string;
  performedBy: string;
  createdAtUtc: string;
};

type CustomerEditRequest = {
  id: string;
  customerId: string;
  requestedByUserId: string;
  requestedByEmail: string;
  status: string;
  requestedName: string;
  requestedType: string;
  requestedEmail: string;
  requestedPhone: string;
  requestedAddressLine1: string;
  requestedAddressLine2: string;
  requestedCity: string;
  requestedState: string;
  requestedPostalCode: string;
  requestedStatus: string;
  adminDecisionByEmail: string;
  adminDecisionNote: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  decidedAtUtc: string | null;
};

type CustomerSnapshot = {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  updatedAtUtc: string;
};

type CustomerEditRequestReview = CustomerEditRequest & {
  currentCustomer: CustomerSnapshot | null;
};

type DashboardSummary = {
  totalCustomers: number;
  activeCustomers: number;
  leadCustomers: number;
  inactiveCustomers: number;
  pendingEditRequests: number;
  approvedEditRequests: number;
  rejectedEditRequests: number;
  editRequestsLast7Days: number;
  pendingEditRequestsToday: number;
  recentAuditEventsLast7Days: number;
};

type CustomerForm = {
  name: string;
  type: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
};

type AuthUser = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  token: string;
  expiresAtUtc: string;
};

type StaffUserForm = {
  displayName: string;
  email: string;
  password: string;
};

type AdminUserForm = {
  displayName: string;
  email: string;
  password: string;
};

type UserAccount = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ResetPasswordForm = {
  userId: string;
  newPassword: string;
  confirmPassword: string;
};

type AuditFilters = {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  from: string;
  to: string;
};

type Quote = {
  id: string;
  customerId: string;
  customerName: string;
  quoteNumber: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  quoteDateUtc: string;
  sentAtUtc: string | null;
  acceptedAtUtc: string | null;
  rejectedAtUtc: string | null;
  expiredAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type QuoteForm = {
  customerId: string;
  title: string;
  description: string;
  amount: string;
  status: string;
};

type QuoteFilters = {
  q: string;
  status: string;
  sortBy: string;
  sortDirection: string;
  from: string;
  to: string;
};

type Contract = {
  id: string;
  customerId: string;
  customerName: string;
  quoteId: string | null;
  quoteNumber: string;
  scopeOfWorkId: string | null;
  contractNumber: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  contractDateUtc: string;
  sentAtUtc: string | null;
  signedAtUtc: string | null;
  completedBillableAtUtc: string | null;
  cancelledAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type ContractForm = {
  customerId: string;
  quoteId: string;
  scopeOfWorkId: string;
  title: string;
  description: string;
  amount: string;
  status: string;
};

type ContractFilters = {
  q: string;
  status: string;
  sortBy: string;
  sortDirection: string;
  from: string;
  to: string;
};

type ScopeOfWork = {
  id: string;
  customerId: string;
  customerName: string;
  quoteId: string | null;
  quoteNumber: string;
  contractId: string | null;
  contractNumber: string;
  scopeNumber: string;
  title: string;
  description: string;
  deliverables: string;
  assumptions: string;
  exclusions: string;
  estimatedAmount: number;
  status: string;
  scopeDateUtc: string;
  reviewedAtUtc: string | null;
  approvedAtUtc: string | null;
  activatedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type ScopeOfWorkForm = {
  customerId: string;
  quoteId: string;
  contractId: string;
  title: string;
  description: string;
  deliverables: string;
  assumptions: string;
  exclusions: string;
  estimatedAmount: string;
  status: string;
};

type ScopeOfWorkFilters = {
  q: string;
  status: string;
  sortBy: string;
  sortDirection: string;
  from: string;
  to: string;
};

type DocumentTemplate = {
  id: string;
  name: string;
  documentType: string;
  contentHtml: string;
  sourceFormat: string;
  originalFileName: string;
  originalContentType: string;
  importedAtUtc: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type DocumentTemplateForm = {
  id: string;
  name: string;
  documentType: string;
  contentHtml: string;
  isDefault: boolean;
  isActive: boolean;
};

type DocumentTemplateImportForm = {
  name: string;
  documentType: string;
  isDefault: boolean;
  contentHtml: string;
  file: File | null;
};

type GeneratedDocument = {
  id: string;
  documentType: string;
  sourceEntityType: string;
  sourceEntityId: string;
  templateId: string | null;
  fileName: string;
  contentType: string;
  generatedBy: string;
  generatedAtUtc: string;
  createdAtUtc: string;
};

type EmailConfigForm = {
  smtpHost: string;
  smtpPort: string;
  useTls: boolean;
  fromEmail: string;
  fromDisplayName: string;
  username: string;
  password: string;
};

type EmailDraftForm = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  isHtml: boolean;
  generatedDocumentId: string;
};

type SendEmailResponse = {
  sent: boolean;
  message: string;
  generatedDocumentId: string | null;
  attachedFileName: string;
};

const emptyCustomerForm: CustomerForm = {
  name: "",
  type: "Company",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  status: "Active"
};

const emptyStaffUserForm: StaffUserForm = {
  displayName: "",
  email: "",
  password: ""
};

const emptyAdminUserForm: AdminUserForm = {
  displayName: "",
  email: "",
  password: ""
};

const emptyChangePasswordForm: ChangePasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

const emptyResetPasswordForm: ResetPasswordForm = {
  userId: "",
  newPassword: "",
  confirmPassword: ""
};

const emptyAuditFilters: AuditFilters = {
  entityType: "All",
  entityId: "",
  action: "",
  performedBy: "",
  from: "",
  to: ""
};

const emptyQuoteForm: QuoteForm = {
  customerId: "",
  title: "",
  description: "",
  amount: "",
  status: "Draft"
};

const emptyQuoteFilters: QuoteFilters = {
  q: "",
  status: "All",
  sortBy: "date",
  sortDirection: "desc",
  from: "",
  to: ""
};

const emptyContractForm: ContractForm = {
  customerId: "",
  quoteId: "",
  scopeOfWorkId: "",
  title: "",
  description: "",
  amount: "",
  status: "Draft"
};

const emptyContractFilters: ContractFilters = {
  q: "",
  status: "All",
  sortBy: "date",
  sortDirection: "desc",
  from: "",
  to: ""
};

const emptyScopeOfWorkForm: ScopeOfWorkForm = {
  customerId: "",
  quoteId: "",
  contractId: "",
  title: "",
  description: "",
  deliverables: "",
  assumptions: "",
  exclusions: "",
  estimatedAmount: "",
  status: "Draft"
};

const emptyScopeOfWorkFilters: ScopeOfWorkFilters = {
  q: "",
  status: "All",
  sortBy: "date",
  sortDirection: "desc",
  from: "",
  to: ""
};

const emptyDocumentTemplateForm: DocumentTemplateForm = {
  id: "",
  name: "",
  documentType: "Quote",
  contentHtml: "",
  isDefault: false,
  isActive: true
};

const emptyDocumentTemplateImportForm: DocumentTemplateImportForm = {
  name: "",
  documentType: "Quote",
  isDefault: false,
  contentHtml: "",
  file: null
};

const emptyEmailConfigForm: EmailConfigForm = {
  smtpHost: "",
  smtpPort: "587",
  useTls: true,
  fromEmail: "",
  fromDisplayName: "",
  username: "",
  password: ""
};

const emptyEmailDraftForm: EmailDraftForm = {
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
  isHtml: false,
  generatedDocumentId: ""
};

const emptyDashboardSummary: DashboardSummary = {
  totalCustomers: 0,
  activeCustomers: 0,
  leadCustomers: 0,
  inactiveCustomers: 0,
  pendingEditRequests: 0,
  approvedEditRequests: 0,
  rejectedEditRequests: 0,
  editRequestsLast7Days: 0,
  pendingEditRequestsToday: 0,
  recentAuditEventsLast7Days: 0
};

const AUTH_STORAGE_KEY = "localcrm.currentUser";

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: "owner@localcrm.dev",
    password: "Owner123!"
  });
  const [loginLoading, setLoginLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [customerEditRequests, setCustomerEditRequests] = useState<CustomerEditRequest[]>([]);
  const [requestQueue, setRequestQueue] = useState<CustomerEditRequestReview[]>([]);
  const [pendingRequestCustomerIds, setPendingRequestCustomerIds] = useState<string[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(emptyDashboardSummary);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [globalAuditLogs, setGlobalAuditLogs] = useState<AuditLog[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customerQuotes, setCustomerQuotes] = useState<Quote[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customerContracts, setCustomerContracts] = useState<Contract[]>([]);
  const [scopesOfWork, setScopesOfWork] = useState<ScopeOfWork[]>([]);
  const [customerScopesOfWork, setCustomerScopesOfWork] = useState<ScopeOfWork[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedSourceGeneratedDocuments, setSelectedSourceGeneratedDocuments] = useState<GeneratedDocument[]>([]);

  const [loading, setLoading] = useState(false);
  const [customerLoadError, setCustomerLoadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [totalCustomerCount, setTotalCustomerCount] = useState(0);

  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);
  const [editForm, setEditForm] = useState<CustomerForm>(emptyCustomerForm);
  const [decisionNote, setDecisionNote] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("Pending");
  const [requestRequesterFilter, setRequestRequesterFilter] = useState("");
  const [requestFromDate, setRequestFromDate] = useState("");
  const [requestToDate, setRequestToDate] = useState("");
  const [auditFilters, setAuditFilters] = useState<AuditFilters>(emptyAuditFilters);
  const [quoteFilters, setQuoteFilters] = useState<QuoteFilters>(emptyQuoteFilters);
  const [contractFilters, setContractFilters] = useState<ContractFilters>(emptyContractFilters);
  const [scopeOfWorkFilters, setScopeOfWorkFilters] = useState<ScopeOfWorkFilters>(emptyScopeOfWorkFilters);
  const [documentTemplateTypeFilter, setDocumentTemplateTypeFilter] = useState("All");

  const [noteForm, setNoteForm] = useState({
    content: "",
    isPinned: false
  });

  const [quoteForm, setQuoteForm] = useState<QuoteForm>(emptyQuoteForm);
  const [contractForm, setContractForm] = useState<ContractForm>(emptyContractForm);
  const [scopeOfWorkForm, setScopeOfWorkForm] = useState<ScopeOfWorkForm>(emptyScopeOfWorkForm);
  const [documentTemplateForm, setDocumentTemplateForm] = useState<DocumentTemplateForm>(emptyDocumentTemplateForm);
  const [documentTemplateImportForm, setDocumentTemplateImportForm] =
    useState<DocumentTemplateImportForm>(emptyDocumentTemplateImportForm);
  const [emailConfigForm, setEmailConfigForm] = useState<EmailConfigForm>(emptyEmailConfigForm);
  const [emailDraftForm, setEmailDraftForm] = useState<EmailDraftForm>(emptyEmailDraftForm);
  const [emailConfigSavedForSession, setEmailConfigSavedForSession] = useState(false);

  const [staffUserForm, setStaffUserForm] = useState<StaffUserForm>(emptyStaffUserForm);
  const [adminUserForm, setAdminUserForm] = useState<AdminUserForm>(emptyAdminUserForm);
  const [changePasswordForm, setChangePasswordForm] = useState<ChangePasswordForm>(emptyChangePasswordForm);
  const [resetPasswordForm, setResetPasswordForm] = useState<ResetPasswordForm>(emptyResetPasswordForm);

  const isOwner = currentUser?.role === "Owner";
  const isAdmin = currentUser?.role === "Admin";
  const isAdminOrOwner = isAdmin || isOwner;

  const pendingRequestCustomerIdSet = useMemo(
    () => new Set(pendingRequestCustomerIds),
    [pendingRequestCustomerIds]
  );

  const maskedEmailPassword = emailConfigForm.password
    ? "Password set for this session"
    : "No password set";

  const emailAttachableDocuments = useMemo(() => {
    const byId = new Map<string, GeneratedDocument>();

    for (const document of generatedDocuments) {
      byId.set(document.id, document);
    }

    for (const document of selectedSourceGeneratedDocuments) {
      byId.set(document.id, document);
    }

    return Array.from(byId.values()).sort(
      (left, right) => new Date(right.generatedAtUtc).getTime() - new Date(left.generatedAtUtc).getTime()
    );
  }, [generatedDocuments, selectedSourceGeneratedDocuments]);

  function setStatus(message: string, type: "info" | "success" | "error" = "info") {
    setStatusMessage(message);
    setStatusType(type);
  }

  function getAuthHeaders() {
    return {
      Authorization: `Bearer ${currentUser?.token ?? ""}`
    };
  }

  function getJsonAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token ?? ""}`
    };
  }

  function isExpired(user: AuthUser) {
    return new Date(user.expiresAtUtc).getTime() <= Date.now();
  }

  function isValidEmail(email: string) {
    if (!email.trim()) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function normalizeCustomerForm(input: CustomerForm): CustomerForm {
    return {
      name: input.name.trim(),
      type: input.type,
      email: input.email.trim(),
      phone: input.phone.trim(),
      addressLine1: input.addressLine1.trim(),
      addressLine2: input.addressLine2.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      status: input.status
    };
  }

  function validateCustomerForm(input: CustomerForm) {
    const normalized = normalizeCustomerForm(input);

    if (!normalized.name) {
      return "Customer name is required.";
    }

    if (normalized.name.length < 2) {
      return "Customer name must be at least 2 characters.";
    }

    if (!["Company", "Person"].includes(normalized.type)) {
      return "Customer type must be Company or Person.";
    }

    if (!["Active", "Lead", "Inactive"].includes(normalized.status)) {
      return "Customer status must be Active, Lead, or Inactive.";
    }

    if (!isValidEmail(normalized.email)) {
      return "Enter a valid email address or leave email blank.";
    }

    return "";
  }

  function validateStaffUserForm(input: StaffUserForm) {
    const displayName = input.displayName.trim();
    const email = input.email.trim();
    const password = input.password;

    if (!displayName) {
      return "Staff display name is required.";
    }

    if (displayName.length < 2) {
      return "Staff display name must be at least 2 characters.";
    }

    if (!email) {
      return "Staff email is required.";
    }

    if (!isValidEmail(email)) {
      return "Enter a valid staff email address.";
    }

    if (!password) {
      return "Temporary staff password is required.";
    }

    if (password.length < 8) {
      return "Temporary staff password must be at least 8 characters.";
    }

    return "";
  }

  function validateAdminUserForm(input: AdminUserForm) {
    const displayName = input.displayName.trim();
    const email = input.email.trim();
    const password = input.password;

    if (!displayName) {
      return "Admin display name is required.";
    }

    if (displayName.length < 2) {
      return "Admin display name must be at least 2 characters.";
    }

    if (!email) {
      return "Admin email is required.";
    }

    if (!isValidEmail(email)) {
      return "Enter a valid Admin email address.";
    }

    return validatePasswordValue(password);
  }

  function validatePasswordValue(password: string) {
    if (!password) {
      return "Password is required.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must include at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must include at least one number.";
    }

    return "";
  }

  function validateChangePasswordForm(input: ChangePasswordForm) {
    if (!input.currentPassword) {
      return "Current password is required.";
    }

    const passwordError = validatePasswordValue(input.newPassword);
    if (passwordError) {
      return passwordError;
    }

    if (input.currentPassword === input.newPassword) {
      return "New password must be different from current password.";
    }

    if (input.newPassword !== input.confirmPassword) {
      return "New password and confirmation do not match.";
    }

    return "";
  }

  function validateResetPasswordForm(input: ResetPasswordForm) {
    if (!input.userId) {
      return "Select a Staff user before resetting a password.";
    }

    const passwordError = validatePasswordValue(input.newPassword);
    if (passwordError) {
      return passwordError;
    }

    if (input.newPassword !== input.confirmPassword) {
      return "Temporary password and confirmation do not match.";
    }

    return "";
  }

  function validateEmailConfigForm(input: EmailConfigForm) {
    const smtpHost = input.smtpHost.trim();
    const smtpPort = Number(input.smtpPort);
    const fromEmail = input.fromEmail.trim();

    if (!smtpHost) {
      return "SMTP host is required.";
    }

    if (!input.smtpPort.trim()) {
      return "SMTP port is required.";
    }

    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      return "SMTP port must be a whole number between 1 and 65535.";
    }

    if (!fromEmail) {
      return "From email is required.";
    }

    if (!isValidEmail(fromEmail)) {
      return "Enter a valid From email address.";
    }

    if (input.username.trim() && !input.password) {
      return "SMTP password is required when a username is provided.";
    }

    return "";
  }

  function validateEmailDraftForm(input: EmailDraftForm) {
    if (!input.to.trim()) {
      return "Email recipient is required.";
    }

    const recipients = [
      ...input.to.split(","),
      ...input.cc.split(","),
      ...input.bcc.split(",")
    ]
      .map((value) => value.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      return "At least one recipient is required.";
    }

    const invalidRecipient = recipients.find((recipient) => !isValidEmail(recipient));
    if (invalidRecipient) {
      return `Invalid email recipient: ${invalidRecipient}`;
    }

    if (!input.subject.trim()) {
      return "Email subject is required.";
    }

    if (!input.body.trim()) {
      return "Email body is required.";
    }

    if (input.generatedDocumentId) {
      const documentExists = emailAttachableDocuments.some((document) => document.id === input.generatedDocumentId);

      if (!documentExists) {
        return "Selected generated document attachment is not available in the current generated-document lists.";
      }
    }

    return "";
  }

  function validateDocumentTemplateForm(input: DocumentTemplateForm) {
    const name = input.name.trim();
    const contentHtml = input.contentHtml.trim();

    if (!name) {
      return "Template name is required.";
    }

    if (name.length < 2) {
      return "Template name must be at least 2 characters.";
    }

    if (!["Quote", "Contract", "ScopeOfWork"].includes(input.documentType)) {
      return "Document type must be Quote, Contract, or ScopeOfWork.";
    }

    if (!contentHtml) {
      return "Template HTML content is required.";
    }

    if (contentHtml.length > 20000) {
      return "Template HTML content cannot exceed 20000 characters.";
    }

    return "";
  }

  function validateDocumentTemplateImportForm(input: DocumentTemplateImportForm) {
    const name = input.name.trim();

    if (!name) {
      return "Imported template name is required.";
    }

    if (name.length < 2) {
      return "Imported template name must be at least 2 characters.";
    }

    if (!["Quote", "Contract", "ScopeOfWork"].includes(input.documentType)) {
      return "Document type must be Quote, Contract, or ScopeOfWork.";
    }

    if (!input.file) {
      return "Select a DOCX file to import.";
    }

    if (!input.file.name.toLowerCase().endsWith(".docx")) {
      return "Only .docx files can be imported.";
    }

    if (input.file.size > 10 * 1024 * 1024) {
      return "Imported template file cannot exceed 10 MB.";
    }

    if (input.contentHtml.length > 20000) {
      return "Fallback HTML content cannot exceed 20000 characters.";
    }

    return "";
  }

  function validateScopeOfWorkForm(input: ScopeOfWorkForm) {
    if (!input.customerId) {
      return "Select a customer before creating a scope of work.";
    }

    if (!input.title.trim()) {
      return "Scope of work title is required.";
    }

    if (input.title.trim().length < 2) {
      return "Scope of work title must be at least 2 characters.";
    }

    const estimatedAmount = Number(input.estimatedAmount);

    if (Number.isNaN(estimatedAmount)) {
      return "Estimated amount must be a valid number.";
    }

    if (estimatedAmount < 0) {
      return "Estimated amount cannot be negative.";
    }

    if (!["Draft", "In Review", "Approved", "Active", "Completed", "Cancelled"].includes(input.status)) {
      return "Scope of work status must be Draft, In Review, Approved, Active, Completed, or Cancelled.";
    }

    return "";
  }

  function validateContractForm(input: ContractForm) {
    if (!input.customerId) {
      return "Select a customer before creating a contract.";
    }

    if (!input.title.trim()) {
      return "Contract title is required.";
    }

    if (input.title.trim().length < 2) {
      return "Contract title must be at least 2 characters.";
    }

    const amount = Number(input.amount);

    if (Number.isNaN(amount)) {
      return "Contract amount must be a valid number.";
    }

    if (amount < 0) {
      return "Contract amount cannot be negative.";
    }

    if (!["Draft", "Sent", "Signed", "Completed/Billable", "Cancelled"].includes(input.status)) {
      return "Contract status must be Draft, Sent, Signed, Completed/Billable, or Cancelled.";
    }

    return "";
  }

  function validateQuoteForm(input: QuoteForm) {
    if (!input.customerId) {
      return "Select a customer before creating a quote.";
    }

    if (!input.title.trim()) {
      return "Quote title is required.";
    }

    if (input.title.trim().length < 2) {
      return "Quote title must be at least 2 characters.";
    }

    const amount = Number(input.amount);

    if (Number.isNaN(amount)) {
      return "Quote amount must be a valid number.";
    }

    if (amount < 0) {
      return "Quote amount cannot be negative.";
    }

    if (!["Draft", "Sent", "Accepted", "Rejected", "Expired"].includes(input.status)) {
      return "Quote status must be Draft, Sent, Accepted, Rejected, or Expired.";
    }

    return "";
  }

  function customerToForm(customer: Customer): CustomerForm {
    return {
      name: customer.name || "",
      type: customer.type || "Company",
      email: customer.email || "",
      phone: customer.phone || "",
      addressLine1: customer.addressLine1 || "",
      addressLine2: customer.addressLine2 || "",
      city: customer.city || "",
      state: customer.state || "",
      postalCode: customer.postalCode || "",
      status: customer.status || "Active"
    };
  }

  function formatBlank(value: string | null | undefined) {
    const normalized = value?.trim();

    return normalized ? normalized : "—";
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  }

  function formatDate(value: string | null | undefined) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString();
  }

  function getStatusClassName(status: string) {
    return status
      .toLowerCase()
      .replace("/", "-")
      .replace(/\s+/g, "-");
  }

  function valuesAreDifferent(currentValue: string | null | undefined, requestedValue: string | null | undefined) {
    return formatBlank(currentValue) !== formatBlank(requestedValue);
  }

  function getRequestComparisonRows(request: CustomerEditRequestReview) {
    const current = request.currentCustomer;

    return [
      { label: "Name", currentValue: current?.name, requestedValue: request.requestedName },
      { label: "Type", currentValue: current?.type, requestedValue: request.requestedType },
      { label: "Email", currentValue: current?.email, requestedValue: request.requestedEmail },
      { label: "Phone", currentValue: current?.phone, requestedValue: request.requestedPhone },
      { label: "Address Line 1", currentValue: current?.addressLine1, requestedValue: request.requestedAddressLine1 },
      { label: "Address Line 2", currentValue: current?.addressLine2, requestedValue: request.requestedAddressLine2 },
      { label: "City", currentValue: current?.city, requestedValue: request.requestedCity },
      { label: "State", currentValue: current?.state, requestedValue: request.requestedState },
      { label: "Postal Code", currentValue: current?.postalCode, requestedValue: request.requestedPostalCode },
      { label: "Status", currentValue: current?.status, requestedValue: request.requestedStatus }
    ].map((row) => ({
      ...row,
      changed: valuesAreDifferent(row.currentValue, row.requestedValue)
    }));
  }

  function saveCurrentUser(user: AuthUser) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function clearSession(message = "Session ended. Please sign in again.") {
    clearCurrentUser();
    setCurrentUser(null);
    setCustomers([]);
    setSelectedCustomer(null);
    setNotes([]);
    setAuditLogs([]);
    setGlobalAuditLogs([]);
    setQuotes([]);
    setCustomerQuotes([]);
    setContracts([]);
    setCustomerContracts([]);
    setScopesOfWork([]);
    setCustomerScopesOfWork([]);
    setDocumentTemplates([]);
    setGeneratedDocuments([]);
    setSelectedSourceGeneratedDocuments([]);
    setCustomerEditRequests([]);
    setRequestQueue([]);
    setPendingRequestCustomerIds([]);
    setGlobalAuditLogs([]);
    setDashboardSummary(emptyDashboardSummary);
    setUsers([]);
    setChangePasswordForm(emptyChangePasswordForm);
    setResetPasswordForm(emptyResetPasswordForm);
    setSearchTerm("");
    setStatusFilter("All");
    setStaffUserForm(emptyStaffUserForm);
    setAdminUserForm(emptyAdminUserForm);
    setDocumentTemplateForm(emptyDocumentTemplateForm);
    setDocumentTemplateImportForm(emptyDocumentTemplateImportForm);
    setDocumentTemplateTypeFilter("All");
    setEmailConfigForm(emptyEmailConfigForm);
    setEmailDraftForm(emptyEmailDraftForm);
    setEmailConfigSavedForSession(false);
    setStatus(message, "error");
  }

  function handleUnauthorizedResponse(response: Response) {
    if (response.status === 401 || response.status === 403) {
      clearSession("Session expired or access denied. Please sign in again.");
      return true;
    }

    return false;
  }

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser;

      if (
        parsedUser?.id &&
        parsedUser?.email &&
        parsedUser?.role &&
        parsedUser?.isActive &&
        parsedUser?.token &&
        parsedUser?.expiresAtUtc &&
        !isExpired(parsedUser)
      ) {
        setCurrentUser(parsedUser);
        setStatus(`Signed in as ${parsedUser.displayName}.`, "success");
      } else {
        clearCurrentUser();
      }
    } catch (error) {
      console.error(error);
      clearCurrentUser();
    }
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    const email = loginForm.email.trim();
    const password = loginForm.password;

    if (!email || !password) {
      setStatus("Email and password are required.", "error");
      return;
    }

    setLoginLoading(true);
    setStatus("Signing in...", "info");

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const user = (await response.json()) as AuthUser;

      setCurrentUser(user);
      saveCurrentUser(user);
      setStatus(`Signed in as ${user.displayName}.`, "success");
    } catch (error) {
      console.error(error);
      setCurrentUser(null);
      clearCurrentUser();
      setStatus("Login failed. Check your email and password.", "error");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearCurrentUser();
    setCurrentUser(null);
    setCustomers([]);
    setSelectedCustomer(null);
    setNotes([]);
    setAuditLogs([]);
    setGlobalAuditLogs([]);
    setQuotes([]);
    setCustomerQuotes([]);
    setContracts([]);
    setCustomerContracts([]);
    setScopesOfWork([]);
    setCustomerScopesOfWork([]);
    setDocumentTemplates([]);
    setGeneratedDocuments([]);
    setSelectedSourceGeneratedDocuments([]);
    setCustomerEditRequests([]);
    setRequestQueue([]);
    setPendingRequestCustomerIds([]);
    setDashboardSummary(emptyDashboardSummary);
    setUsers([]);
    setChangePasswordForm(emptyChangePasswordForm);
    setResetPasswordForm(emptyResetPasswordForm);
    setSearchTerm("");
    setStatusFilter("All");
    setStaffUserForm(emptyStaffUserForm);
    setAdminUserForm(emptyAdminUserForm);
    setDocumentTemplateForm(emptyDocumentTemplateForm);
    setDocumentTemplateImportForm(emptyDocumentTemplateImportForm);
    setDocumentTemplateTypeFilter("All");
    setEmailConfigForm(emptyEmailConfigForm);
    setEmailDraftForm(emptyEmailDraftForm);
    setEmailConfigSavedForSession(false);
    setStatus("Signed out.", "info");
  }

  async function loadCustomers() {
    if (!currentUser) {
      return;
    }

    if (isExpired(currentUser)) {
      clearSession("Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    setCustomerLoadError("");
    setStatus("Loading customers...", "info");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }

      if (statusFilter !== "All") {
        params.set("status", statusFilter);
      }

      const queryString = params.toString();
      const url = queryString ? `/customers/search?${queryString}` : "/customers";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Customer[];
      setCustomers(data);

      if (!searchTerm.trim() && statusFilter === "All") {
        setTotalCustomerCount(data.length);
      }

      if (data.length === 0) {
        setSelectedCustomer(null);
        setNotes([]);
        setAuditLogs([]);
        setCustomerEditRequests([]);

        if (searchTerm.trim() || statusFilter !== "All") {
          setStatus("No customers match the current search/filter.", "info");
        } else {
          setStatus("No customers found. Create one to get started.", "info");
        }

        return;
      }

      if (selectedCustomer) {
        const refreshedSelected = data.find((customer) => customer.id === selectedCustomer.id);

        if (refreshedSelected) {
          setSelectedCustomer(refreshedSelected);
        } else {
          setSelectedCustomer(data[0]);
          setStatus("Selected customer is not in the current results. Showing first match.", "info");
          return;
        }
      } else {
        setSelectedCustomer(data[0]);
      }

      setStatus(`Loaded ${data.length} customers`, "success");
    } catch (error) {
      console.error(error);
      setCustomers([]);
      setSelectedCustomer(null);
      setNotes([]);
      setAuditLogs([]);
      setCustomerEditRequests([]);
      setCustomerLoadError("Failed to load customers. Check that the backend API is running.");
      setStatus("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboardSummary() {
    if (!currentUser || !isAdminOrOwner) {
      setDashboardSummary(emptyDashboardSummary);
      return;
    }

    try {
      const response = await fetch("/dashboard/summary", {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as DashboardSummary;
      setDashboardSummary(data);
    } catch (error) {
      console.error(error);
      setDashboardSummary(emptyDashboardSummary);
      setStatus("Failed to load dashboard summary", "error");
    }
  }

  async function loadUsers() {
    if (!currentUser || !isAdminOrOwner) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch("/users", {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as UserAccount[];
      setUsers(data);
    } catch (error) {
      console.error(error);
      setUsers([]);
      setStatus("Failed to load users", "error");
    }
  }

  async function loadGlobalAuditLogs() {
    if (!currentUser || !isAdminOrOwner) {
      setGlobalAuditLogs([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (auditFilters.entityType !== "All") {
        params.set("entityType", auditFilters.entityType);
      }

      if (auditFilters.entityId.trim()) {
        params.set("entityId", auditFilters.entityId.trim());
      }

      if (auditFilters.action.trim()) {
        params.set("action", auditFilters.action.trim());
      }

      if (auditFilters.performedBy.trim()) {
        params.set("performedBy", auditFilters.performedBy.trim());
      }

      if (auditFilters.from) {
        params.set("from", auditFilters.from);
      }

      if (auditFilters.to) {
        params.set("to", auditFilters.to);
      }

      const queryString = params.toString();
      const url = queryString ? `/audit?${queryString}` : "/audit";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditLog[];
      setGlobalAuditLogs(data);
    } catch (error) {
      console.error(error);
      setGlobalAuditLogs([]);
      setStatus("Failed to load global audit log", "error");
    }
  }

  async function loadGeneratedDocuments(sourceEntityType?: string, sourceEntityId?: string) {
    if (!currentUser) {
      setGeneratedDocuments([]);
      setSelectedSourceGeneratedDocuments([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (sourceEntityType) {
        params.set("sourceEntityType", sourceEntityType);
      }

      if (sourceEntityId) {
        params.set("sourceEntityId", sourceEntityId);
      }

      const queryString = params.toString();
      const url = queryString ? `/generated-documents?${queryString}` : "/generated-documents";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as GeneratedDocument[];

      if (sourceEntityType && sourceEntityId) {
        setSelectedSourceGeneratedDocuments(data);
      } else {
        setGeneratedDocuments(data);
      }
    } catch (error) {
      console.error(error);

      if (sourceEntityType && sourceEntityId) {
        setSelectedSourceGeneratedDocuments([]);
      } else {
        setGeneratedDocuments([]);
      }

      setStatus("Failed to load generated documents", "error");
    }
  }

  async function loadDocumentTemplates() {
    if (!currentUser || !isAdminOrOwner) {
      setDocumentTemplates([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (documentTemplateTypeFilter !== "All") {
        params.set("documentType", documentTemplateTypeFilter);
      }

      const queryString = params.toString();
      const url = queryString ? `/document-templates?${queryString}` : "/document-templates";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as DocumentTemplate[];
      setDocumentTemplates(data);
    } catch (error) {
      console.error(error);
      setDocumentTemplates([]);
      setStatus("Failed to load document templates", "error");
    }
  }

  async function loadQuotes() {
    if (!currentUser) {
      setQuotes([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (quoteFilters.q.trim()) {
        params.set("q", quoteFilters.q.trim());
      }

      if (quoteFilters.status !== "All") {
        params.set("status", quoteFilters.status);
      }

      if (quoteFilters.sortBy) {
        params.set("sortBy", quoteFilters.sortBy);
      }

      if (quoteFilters.sortDirection) {
        params.set("sortDirection", quoteFilters.sortDirection);
      }

      if (quoteFilters.from) {
        params.set("from", quoteFilters.from);
      }

      if (quoteFilters.to) {
        params.set("to", quoteFilters.to);
      }

      const queryString = params.toString();
      const url = queryString ? `/quotes?${queryString}` : "/quotes";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Quote[];
      setQuotes(data);
    } catch (error) {
      console.error(error);
      setQuotes([]);
      setStatus("Failed to load quotes", "error");
    }
  }

  async function loadCustomerQuotes(customerId: string) {
    if (!currentUser) {
      setCustomerQuotes([]);
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/quotes`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Quote[];
      setCustomerQuotes(data);
    } catch (error) {
      console.error(error);
      setCustomerQuotes([]);
      setStatus("Failed to load customer quotes", "error");
    }
  }

  async function loadContracts() {
    if (!currentUser) {
      setContracts([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (contractFilters.q.trim()) {
        params.set("q", contractFilters.q.trim());
      }

      if (contractFilters.status !== "All") {
        params.set("status", contractFilters.status);
      }

      if (contractFilters.sortBy) {
        params.set("sortBy", contractFilters.sortBy);
      }

      if (contractFilters.sortDirection) {
        params.set("sortDirection", contractFilters.sortDirection);
      }

      if (contractFilters.from) {
        params.set("from", contractFilters.from);
      }

      if (contractFilters.to) {
        params.set("to", contractFilters.to);
      }

      const queryString = params.toString();
      const url = queryString ? `/contracts?${queryString}` : "/contracts";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Contract[];
      setContracts(data);
    } catch (error) {
      console.error(error);
      setContracts([]);
      setStatus("Failed to load contracts", "error");
    }
  }

  async function loadCustomerContracts(customerId: string) {
    if (!currentUser) {
      setCustomerContracts([]);
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/contracts`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Contract[];
      setCustomerContracts(data);
    } catch (error) {
      console.error(error);
      setCustomerContracts([]);
      setStatus("Failed to load customer contracts", "error");
    }
  }

  async function loadScopesOfWork() {
    if (!currentUser) {
      setScopesOfWork([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (scopeOfWorkFilters.q.trim()) {
        params.set("q", scopeOfWorkFilters.q.trim());
      }

      if (scopeOfWorkFilters.status !== "All") {
        params.set("status", scopeOfWorkFilters.status);
      }

      if (scopeOfWorkFilters.sortBy) {
        params.set("sortBy", scopeOfWorkFilters.sortBy);
      }

      if (scopeOfWorkFilters.sortDirection) {
        params.set("sortDirection", scopeOfWorkFilters.sortDirection);
      }

      if (scopeOfWorkFilters.from) {
        params.set("from", scopeOfWorkFilters.from);
      }

      if (scopeOfWorkFilters.to) {
        params.set("to", scopeOfWorkFilters.to);
      }

      const queryString = params.toString();
      const url = queryString ? `/scopes-of-work?${queryString}` : "/scopes-of-work";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ScopeOfWork[];
      setScopesOfWork(data);
    } catch (error) {
      console.error(error);
      setScopesOfWork([]);
      setStatus("Failed to load scopes of work", "error");
    }
  }

  async function loadCustomerScopesOfWork(customerId: string) {
    if (!currentUser) {
      setCustomerScopesOfWork([]);
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/scopes-of-work`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ScopeOfWork[];
      setCustomerScopesOfWork(data);
    } catch (error) {
      console.error(error);
      setCustomerScopesOfWork([]);
      setStatus("Failed to load customer scopes of work", "error");
    }
  }

  async function loadCustomerNotes(customerId: string) {
    if (!currentUser) {
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/notes`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as CustomerNote[];
      setNotes(data);
    } catch (error) {
      console.error(error);
      setNotes([]);
      setStatus("Failed to load notes", "error");
    }
  }

  async function loadAuditLogs(customerId: string) {
    if (!currentUser) {
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/audit`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditLog[];
      setAuditLogs(data);
    } catch (error) {
      console.error(error);
      setAuditLogs([]);
      setStatus("Failed to load audit log", "error");
    }
  }

  async function loadCustomerEditRequests(customerId: string) {
    if (!currentUser) {
      return;
    }

    try {
      const response = await fetch(`/customers/${customerId}/edit-requests`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as CustomerEditRequest[];
      setCustomerEditRequests(data);

      if (isAdminOrOwner) {
        await loadRequestQueue();
        await loadPendingCustomerIds();
      }
    } catch (error) {
      console.error(error);
      setCustomerEditRequests([]);
      setStatus("Failed to load edit requests", "error");
    }
  }

  async function loadRequestQueue() {
    if (!currentUser || !isAdminOrOwner) {
      setRequestQueue([]);
      return;
    }

    try {
      const params = new URLSearchParams();

      if (requestStatusFilter !== "All") {
        params.set("status", requestStatusFilter);
      }

      if (requestRequesterFilter.trim()) {
        params.set("requestedBy", requestRequesterFilter.trim());
      }

      if (requestFromDate) {
        params.set("from", requestFromDate);
      }

      if (requestToDate) {
        params.set("to", requestToDate);
      }

      const queryString = params.toString();
      const url = queryString ? `/customer-edit-requests?${queryString}` : "/customer-edit-requests";

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as CustomerEditRequestReview[];
      setRequestQueue(data);
    } catch (error) {
      console.error(error);
      setRequestQueue([]);
      setStatus("Failed to load edit requests", "error");
    }
  }

  async function loadPendingCustomerIds() {
    if (!currentUser || !isAdminOrOwner) {
      setPendingRequestCustomerIds([]);
      return;
    }

    try {
      const response = await fetch("/customer-edit-requests?status=Pending", {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as CustomerEditRequestReview[];
      const ids = Array.from(new Set(data.map((request) => request.customerId)));
      setPendingRequestCustomerIds(ids);
    } catch (error) {
      console.error(error);
      setPendingRequestCustomerIds([]);
      setStatus("Failed to load pending customer indicators", "error");
    }
  }

  async function refreshAdminWorkflow() {
    if (!currentUser || !isAdminOrOwner) {
      return;
    }

    await Promise.all([
      loadDashboardSummary(),
      loadRequestQueue(),
      loadPendingCustomerIds(),
      loadUsers(),
      loadGlobalAuditLogs(),
      loadDocumentTemplates()
    ]);
  }

  useEffect(() => {
    if (currentUser) {
      loadCustomers();
      loadQuotes();
      loadContracts();
      loadScopesOfWork();
      loadGeneratedDocuments();
    }
  }, [
    currentUser,
    searchTerm,
    statusFilter,
    quoteFilters.q,
    quoteFilters.status,
    quoteFilters.sortBy,
    quoteFilters.sortDirection,
    quoteFilters.from,
    quoteFilters.to,
    contractFilters.q,
    contractFilters.status,
    contractFilters.sortBy,
    contractFilters.sortDirection,
    contractFilters.from,
    contractFilters.to,
    scopeOfWorkFilters.q,
    scopeOfWorkFilters.status,
    scopeOfWorkFilters.sortBy,
    scopeOfWorkFilters.sortDirection,
    scopeOfWorkFilters.from,
    scopeOfWorkFilters.to
  ]);

  useEffect(() => {
    if (currentUser && isAdminOrOwner) {
      refreshAdminWorkflow();
    } else {
      setRequestQueue([]);
      setPendingRequestCustomerIds([]);
      setDashboardSummary(emptyDashboardSummary);
      setUsers([]);
      setDocumentTemplates([]);
    }
  }, [
    currentUser?.id,
    currentUser?.role,
    requestStatusFilter,
    requestRequesterFilter,
    requestFromDate,
    requestToDate,
    auditFilters.entityType,
    auditFilters.entityId,
    auditFilters.action,
    auditFilters.performedBy,
    auditFilters.from,
    auditFilters.to,
    documentTemplateTypeFilter
  ]);

  useEffect(() => {
    if (selectedCustomer) {
      setEditForm(customerToForm(selectedCustomer));
      loadCustomerNotes(selectedCustomer.id);
      loadAuditLogs(selectedCustomer.id);
      loadCustomerEditRequests(selectedCustomer.id);
      loadCustomerQuotes(selectedCustomer.id);
      loadCustomerContracts(selectedCustomer.id);
      loadCustomerScopesOfWork(selectedCustomer.id);
      setSelectedSourceGeneratedDocuments([]);
      setQuoteForm((current) => ({
        ...current,
        customerId: selectedCustomer.id
      }));
      setContractForm((current) => ({
        ...current,
        customerId: selectedCustomer.id
      }));
      setScopeOfWorkForm((current) => ({
        ...current,
        customerId: selectedCustomer.id
      }));
    }
  }, [selectedCustomer]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before creating customers.", "error");
      return;
    }

    const validationError = validateCustomerForm(form);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    const payload = normalizeCustomerForm(form);

    setStatus("Creating customer...", "info");

    try {
      const response = await fetch("/customers", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const createdCustomer = (await response.json()) as Customer;

      setForm(emptyCustomerForm);
      setSelectedCustomer(createdCustomer);
      setStatus(`Customer "${createdCustomer.name}" created successfully.`, "success");
      await loadCustomers();

      if (isAdminOrOwner) {
        await refreshAdminWorkflow();
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to create customer. Check the API and try again.", "error");
    }
  }

  async function handleCustomerUpdate(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before updating customers.", "error");
      return;
    }

    if (!isAdminOrOwner) {
      setStatus("Only Admin users can edit customer records.", "error");
      return;
    }

    if (!selectedCustomer) {
      setStatus("Select a customer before saving changes.", "error");
      return;
    }

    const validationError = validateCustomerForm(editForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    const payload = {
      ...selectedCustomer,
      ...normalizeCustomerForm(editForm)
    };

    setStatus("Saving customer changes...", "info");

    try {
      const response = await fetch(`/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const updatedCustomer = (await response.json()) as Customer;

      setSelectedCustomer(updatedCustomer);
      setStatus(`Customer "${updatedCustomer.name}" updated successfully.`, "success");
      await loadCustomers();
      await loadAuditLogs(updatedCustomer.id);
      await loadCustomerEditRequests(updatedCustomer.id);
      await refreshAdminWorkflow();
    } catch (error) {
      console.error(error);
      setStatus("Failed to update customer. Check the API and try again.", "error");
    }
  }

  async function handleEditRequestSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before requesting customer edits.", "error");
      return;
    }

    if (!selectedCustomer) {
      setStatus("Select a customer before requesting edits.", "error");
      return;
    }

    const validationError = validateCustomerForm(editForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    const payload = normalizeCustomerForm(editForm);

    setStatus("Submitting edit request...", "info");

    try {
      const response = await fetch(`/customers/${selectedCustomer.id}/edit-requests`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus("Customer edit request submitted for Admin review.", "success");
      await loadCustomerEditRequests(selectedCustomer.id);
      await loadAuditLogs(selectedCustomer.id);
    } catch (error) {
      console.error(error);
      setStatus("Failed to submit edit request. Check the API and try again.", "error");
    }
  }

  async function handleEditRequestDecision(requestId: string, decision: "approve" | "reject") {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin users can approve or reject edit requests.", "error");
      return;
    }

    setStatus(`${decision === "approve" ? "Approving" : "Rejecting"} edit request...`, "info");

    try {
      const response = await fetch(`/customer-edit-requests/${requestId}/${decision}`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          note: decisionNote
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setDecisionNote("");
      setStatus(`Edit request ${decision === "approve" ? "approved" : "rejected"}.`, "success");

      await refreshAdminWorkflow();

      if (selectedCustomer) {
        await loadCustomers();
        await loadCustomerEditRequests(selectedCustomer.id);
        await loadAuditLogs(selectedCustomer.id);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Failed to ${decision} edit request. Check the API and try again.`, "error");
    }
  }

  async function handleNoteSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before adding notes.", "error");
      return;
    }

    if (!selectedCustomer) {
      setStatus("Select a customer before adding a note.", "error");
      return;
    }

    const content = noteForm.content.trim();

    if (!content) {
      setStatus("Note content is required.", "error");
      return;
    }

    if (content.length < 3) {
      setStatus("Note content must be at least 3 characters.", "error");
      return;
    }

    setStatus("Creating note...", "info");

    try {
      const response = await fetch(`/customers/${selectedCustomer.id}/notes`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          content,
          isPinned: noteForm.isPinned
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNoteForm({
        content: "",
        isPinned: false
      });

      setStatus("Note created successfully.", "success");
      await loadCustomerNotes(selectedCustomer.id);
      await loadAuditLogs(selectedCustomer.id);
    } catch (error) {
      console.error(error);
      setStatus("Failed to create note. Check the API and try again.", "error");
    }
  }

  async function handleQuoteSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before creating quotes.", "error");
      return;
    }

    const validationError = validateQuoteForm(quoteForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating quote...", "info");

    try {
      const response = await fetch("/quotes", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          customerId: quoteForm.customerId,
          title: quoteForm.title.trim(),
          description: quoteForm.description.trim(),
          amount: Number(quoteForm.amount),
          status: quoteForm.status
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const createdQuote = (await response.json()) as Quote;

      setQuoteForm({
        ...emptyQuoteForm,
        customerId: selectedCustomer?.id ?? ""
      });
      setStatus(`Quote "${createdQuote.quoteNumber}" created successfully.`, "success");
      await loadQuotes();

      if (selectedCustomer) {
        await loadCustomerQuotes(selectedCustomer.id);
        await loadAuditLogs(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to create quote.", "error");
    }
  }

  async function openQuoteDocument(quoteId: string) {
    if (!currentUser) {
      setStatus("Sign in before viewing quote documents.", "error");
      return;
    }

    setStatus("Opening printable quote document...", "info");

    try {
      const response = await fetch(`/quotes/${quoteId}/document`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const documentUrl = URL.createObjectURL(blob);

      window.open(documentUrl, "_blank", "noopener,noreferrer");
      setStatus("Printable quote document opened.", "success");

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to open quote document.", "error");
    }
  }

  function addGeneratedDocumentToLocalState(generatedDocument: GeneratedDocument) {
    setGeneratedDocuments((current) => {
      const withoutDuplicate = current.filter((document) => document.id !== generatedDocument.id);
      return [generatedDocument, ...withoutDuplicate];
    });

    setSelectedSourceGeneratedDocuments((current) => {
      const withoutDuplicate = current.filter((document) => document.id !== generatedDocument.id);
      return [generatedDocument, ...withoutDuplicate];
    });
  }

  function attachNewGeneratedDocumentToDraft(generatedDocument: GeneratedDocument) {
    setEmailDraftForm((current) => ({
      ...current,
      generatedDocumentId: generatedDocument.id,
      subject: current.subject || `${generatedDocument.documentType} document: ${generatedDocument.fileName}`,
      body:
        current.body ||
        `Please see the attached ${generatedDocument.documentType.toLowerCase()} document.`
    }));
  }

  async function generateQuoteDocumentFile(quoteId: string) {
    if (!currentUser) {
      setStatus("Sign in before generating quote files.", "error");
      return;
    }

    setStatus("Generating stored quote document...", "info");

    try {
      const response = await fetch(`/quotes/${quoteId}/generated-documents`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const generatedDocument = (await response.json()) as GeneratedDocument;
      addGeneratedDocumentToLocalState(generatedDocument);
      attachNewGeneratedDocumentToDraft(generatedDocument);
      setStatus(`Generated document "${generatedDocument.fileName}" created and attached to the email draft.`, "success");
      await loadGeneratedDocuments();
      await loadGeneratedDocuments("Quote", quoteId);

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to generate quote document file.", "error");
    }
  }

  async function handleQuoteStatusUpdate(quoteId: string, status: string) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can update quote status.", "error");
      return;
    }

    setStatus("Updating quote status...", "info");

    try {
      const response = await fetch(`/quotes/${quoteId}/status`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setStatus(`Quote marked ${status}.`, "success");
      await loadQuotes();

      if (selectedCustomer) {
        await loadCustomerQuotes(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to update quote status.", "error");
    }
  }

  async function handleContractSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before creating contracts.", "error");
      return;
    }

    const validationError = validateContractForm(contractForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating contract...", "info");

    try {
      const response = await fetch("/contracts", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          customerId: contractForm.customerId,
          quoteId: contractForm.quoteId || null,
          scopeOfWorkId: contractForm.scopeOfWorkId || null,
          title: contractForm.title.trim(),
          description: contractForm.description.trim(),
          amount: Number(contractForm.amount),
          status: contractForm.status
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const createdContract = (await response.json()) as Contract;

      setContractForm({
        ...emptyContractForm,
        customerId: selectedCustomer?.id ?? ""
      });
      setStatus(`Contract "${createdContract.contractNumber}" created successfully.`, "success");
      await loadContracts();

      if (selectedCustomer) {
        await loadCustomerContracts(selectedCustomer.id);
        await loadAuditLogs(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to create contract.", "error");
    }
  }

  async function openContractDocument(contractId: string) {
    if (!currentUser) {
      setStatus("Sign in before viewing contract documents.", "error");
      return;
    }

    setStatus("Opening printable contract document...", "info");

    try {
      const response = await fetch(`/contracts/${contractId}/document`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const documentUrl = URL.createObjectURL(blob);

      window.open(documentUrl, "_blank", "noopener,noreferrer");
      setStatus("Printable contract document opened.", "success");

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to open contract document.", "error");
    }
  }

  async function generateContractDocumentFile(contractId: string) {
    if (!currentUser) {
      setStatus("Sign in before generating contract files.", "error");
      return;
    }

    setStatus("Generating stored contract document...", "info");

    try {
      const response = await fetch(`/contracts/${contractId}/generated-documents`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const generatedDocument = (await response.json()) as GeneratedDocument;
      addGeneratedDocumentToLocalState(generatedDocument);
      attachNewGeneratedDocumentToDraft(generatedDocument);
      setStatus(`Generated document "${generatedDocument.fileName}" created and attached to the email draft.`, "success");
      await loadGeneratedDocuments();
      await loadGeneratedDocuments("Contract", contractId);

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to generate contract document file.", "error");
    }
  }

  async function handleContractStatusUpdate(contractId: string, status: string) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can update contract status.", "error");
      return;
    }

    setStatus("Updating contract status...", "info");

    try {
      const response = await fetch(`/contracts/${contractId}/status`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setStatus(`Contract marked ${status}.`, "success");
      await loadContracts();

      if (selectedCustomer) {
        await loadCustomerContracts(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to update contract status.", "error");
    }
  }

  async function handleScopeOfWorkSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before creating scopes of work.", "error");
      return;
    }

    const validationError = validateScopeOfWorkForm(scopeOfWorkForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating scope of work...", "info");

    try {
      const response = await fetch("/scopes-of-work", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          customerId: scopeOfWorkForm.customerId,
          quoteId: scopeOfWorkForm.quoteId || null,
          contractId: scopeOfWorkForm.contractId || null,
          title: scopeOfWorkForm.title.trim(),
          description: scopeOfWorkForm.description.trim(),
          deliverables: scopeOfWorkForm.deliverables.trim(),
          assumptions: scopeOfWorkForm.assumptions.trim(),
          exclusions: scopeOfWorkForm.exclusions.trim(),
          estimatedAmount: Number(scopeOfWorkForm.estimatedAmount),
          status: scopeOfWorkForm.status
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const createdScope = (await response.json()) as ScopeOfWork;

      setScopeOfWorkForm({
        ...emptyScopeOfWorkForm,
        customerId: selectedCustomer?.id ?? ""
      });
      setStatus(`Scope of work "${createdScope.scopeNumber}" created successfully.`, "success");
      await loadScopesOfWork();
      await loadContracts();

      if (selectedCustomer) {
        await loadCustomerScopesOfWork(selectedCustomer.id);
        await loadCustomerContracts(selectedCustomer.id);
        await loadAuditLogs(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to create scope of work.", "error");
    }
  }

  async function openScopeOfWorkDocument(scopeId: string) {
    if (!currentUser) {
      setStatus("Sign in before viewing scope-of-work documents.", "error");
      return;
    }

    setStatus("Opening printable scope-of-work document...", "info");

    try {
      const response = await fetch(`/scopes-of-work/${scopeId}/document`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const documentUrl = URL.createObjectURL(blob);

      window.open(documentUrl, "_blank", "noopener,noreferrer");
      setStatus("Printable scope-of-work document opened.", "success");

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to open scope-of-work document.", "error");
    }
  }

  async function generateScopeOfWorkDocumentFile(scopeId: string) {
    if (!currentUser) {
      setStatus("Sign in before generating scope-of-work files.", "error");
      return;
    }

    setStatus("Generating stored scope-of-work document...", "info");

    try {
      const response = await fetch(`/scopes-of-work/${scopeId}/generated-documents`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const generatedDocument = (await response.json()) as GeneratedDocument;
      addGeneratedDocumentToLocalState(generatedDocument);
      attachNewGeneratedDocumentToDraft(generatedDocument);
      setStatus(`Generated document "${generatedDocument.fileName}" created and attached to the email draft.`, "success");
      await loadGeneratedDocuments();
      await loadGeneratedDocuments("ScopeOfWork", scopeId);

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to generate scope-of-work document file.", "error");
    }
  }

  async function handleScopeOfWorkStatusUpdate(scopeId: string, status: string) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can update scope-of-work status.", "error");
      return;
    }

    setStatus("Updating scope-of-work status...", "info");

    try {
      const response = await fetch(`/scopes-of-work/${scopeId}/status`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setStatus(`Scope of work marked ${status}.`, "success");
      await loadScopesOfWork();

      if (selectedCustomer) {
        await loadCustomerScopesOfWork(selectedCustomer.id);
      }

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to update scope-of-work status.", "error");
    }
  }

  async function downloadGeneratedDocument(generatedDocument: GeneratedDocument) {
    if (!currentUser) {
      setStatus("Sign in before downloading generated documents.", "error");
      return;
    }

    setStatus(`Downloading "${generatedDocument.fileName}"...`, "info");

    try {
      const response = await fetch(`/generated-documents/${generatedDocument.id}/download`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = generatedDocument.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setStatus(`Downloaded "${generatedDocument.fileName}".`, "success");

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to download generated document.", "error");
    }
  }

  function renderGeneratedDocumentList(documents: GeneratedDocument[], emptyMessage: string) {
    return (
      <div className="stack-list compact-list">
        {documents.length === 0 ? (
          <p className="muted-text">{emptyMessage}</p>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="stack-item">
              <div className="stack-item-header">
                <strong>{document.fileName}</strong>
                <span className="status-chip status-chip-active">{document.documentType}</span>
              </div>

              <div className="compact-content">
                {document.sourceEntityType} · Generated by {document.generatedBy}
              </div>

              <div className="muted-text compact-meta">
                Generated {formatDate(document.generatedAtUtc)}
                {document.templateId ? " · Template-backed" : " · Fallback layout"}
              </div>

              <div className="quote-status-row">
                <button type="button" onClick={() => downloadGeneratedDocument(document)}>
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => attachGeneratedDocumentToEmail(document)}
                  disabled={!emailConfigSavedForSession}
                >
                  Attach to Email
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  function handleEmailConfigSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before configuring email workflow.", "error");
      return;
    }

    const validationError = validateEmailConfigForm(emailConfigForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setEmailConfigForm({
      ...emailConfigForm,
      smtpHost: emailConfigForm.smtpHost.trim(),
      smtpPort: emailConfigForm.smtpPort.trim(),
      fromEmail: emailConfigForm.fromEmail.trim(),
      fromDisplayName: emailConfigForm.fromDisplayName.trim(),
      username: emailConfigForm.username.trim()
    });

    setEmailConfigSavedForSession(true);
    setStatus("Email settings saved for this session only.", "success");
  }

  function clearSessionEmailConfig() {
    setEmailConfigForm(emptyEmailConfigForm);
    setEmailDraftForm(emptyEmailDraftForm);
    setEmailConfigSavedForSession(false);
    setStatus("Session email settings cleared.", "info");
  }

  function attachGeneratedDocumentToEmail(generatedDocument: GeneratedDocument) {
    setEmailDraftForm((current) => ({
      ...current,
      generatedDocumentId: generatedDocument.id,
      subject: current.subject || `${generatedDocument.documentType} document: ${generatedDocument.fileName}`,
      body:
        current.body ||
        `Please see the attached ${generatedDocument.documentType.toLowerCase()} document.`
    }));

    setStatus(`Attached "${generatedDocument.fileName}" to the local email draft.`, "success");
  }

  function getSelectedEmailAttachmentName() {
    if (!emailDraftForm.generatedDocumentId) {
      return "No generated document selected";
    }

    const selectedDocument = emailAttachableDocuments.find((document) => document.id === emailDraftForm.generatedDocumentId);
    return selectedDocument?.fileName ?? "Selected generated document not found";
  }

  async function handleEmailDraftSave(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before sending email.", "error");
      return;
    }

    if (!emailConfigSavedForSession) {
      setStatus("Save session email settings before sending email.", "error");
      return;
    }

    const configValidationError = validateEmailConfigForm(emailConfigForm);
    if (configValidationError) {
      setStatus(configValidationError, "error");
      return;
    }

    const draftValidationError = validateEmailDraftForm(emailDraftForm);
    if (draftValidationError) {
      setStatus(draftValidationError, "error");
      return;
    }

    setStatus("Sending email...", "info");

    try {
      const response = await fetch("/email/send", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          smtpHost: emailConfigForm.smtpHost.trim(),
          smtpPort: Number(emailConfigForm.smtpPort),
          useTls: emailConfigForm.useTls,
          fromEmail: emailConfigForm.fromEmail.trim(),
          fromDisplayName: emailConfigForm.fromDisplayName.trim(),
          username: emailConfigForm.username.trim(),
          password: emailConfigForm.password,
          to: emailDraftForm.to.trim(),
          cc: emailDraftForm.cc.trim(),
          bcc: emailDraftForm.bcc.trim(),
          subject: emailDraftForm.subject.trim(),
          body: emailDraftForm.body,
          isHtml: emailDraftForm.isHtml,
          generatedDocumentId: emailDraftForm.generatedDocumentId || null
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const result = (await response.json()) as SendEmailResponse;

      setEmailDraftForm(emptyEmailDraftForm);
      setStatus(
        result.attachedFileName
          ? `Email sent successfully with attachment "${result.attachedFileName}".`
          : "Email sent successfully.",
        "success"
      );

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to send email.", "error");

      if (isAdminOrOwner) {
        await loadGlobalAuditLogs();
      }
    }
  }

  async function handleDocumentTemplateSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can manage document templates.", "error");
      return;
    }

    const validationError = validateDocumentTemplateForm(documentTemplateForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    const isEditing = Boolean(documentTemplateForm.id);
    const url = isEditing
      ? `/document-templates/${documentTemplateForm.id}`
      : "/document-templates";

    setStatus(isEditing ? "Updating document template..." : "Creating document template...", "info");

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          name: documentTemplateForm.name.trim(),
          documentType: documentTemplateForm.documentType,
          contentHtml: documentTemplateForm.contentHtml.trim(),
          isDefault: documentTemplateForm.isDefault,
          isActive: documentTemplateForm.isActive
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const savedTemplate = (await response.json()) as DocumentTemplate;

      setDocumentTemplateForm(emptyDocumentTemplateForm);
      setStatus(`Document template "${savedTemplate.name}" ${isEditing ? "updated" : "created"} successfully.`, "success");
      await loadDocumentTemplates();
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to save document template.", "error");
    }
  }

  function editDocumentTemplate(template: DocumentTemplate) {
    setDocumentTemplateForm({
      id: template.id,
      name: template.name,
      documentType: template.documentType,
      contentHtml: template.contentHtml,
      isDefault: template.isDefault,
      isActive: template.isActive
    });

    setStatus(`Editing template "${template.name}".`, "info");
  }

  async function seedDefaultDocumentTemplates() {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can seed document templates.", "error");
      return;
    }

    setStatus("Seeding default document templates...", "info");

    try {
      const response = await fetch("/document-templates/seed-defaults", {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const seededTemplates = (await response.json()) as DocumentTemplate[];

      setStatus(`Seeded ${seededTemplates.length} default document templates.`, "success");
      await loadDocumentTemplates();
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to seed default templates.", "error");
    }
  }

  async function setDefaultDocumentTemplate(templateId: string) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can set default templates.", "error");
      return;
    }

    setStatus("Setting default document template...", "info");

    try {
      const response = await fetch(`/document-templates/${templateId}/default`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setStatus("Default document template updated.", "success");
      await loadDocumentTemplates();
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to set default template.", "error");
    }
  }

  async function setDocumentTemplateActiveState(templateId: string, isActive: boolean) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can update template active state.", "error");
      return;
    }

    setStatus(isActive ? "Activating document template..." : "Deactivating document template...", "info");

    try {
      const response = await fetch(`/document-templates/${templateId}/active`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setStatus(isActive ? "Document template activated." : "Document template deactivated.", "success");
      await loadDocumentTemplates();
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to update template active state.", "error");
    }
  }

  async function exportDocumentTemplate(template: DocumentTemplate) {
    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can export document templates.", "error");
      return;
    }

    setStatus(`Exporting template "${template.name}"...`, "info");

    try {
      const response = await fetch(`/document-templates/${template.id}/export`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      const fallbackExtension = template.sourceFormat === "Docx" ? "docx" : "html";
      const fallbackFileName =
        template.originalFileName || `${template.name.replace(/[^a-z0-9-_]+/gi, "-")}.${fallbackExtension}`;
      const fileName = filenameMatch
        ? decodeURIComponent(filenameMatch[1].replace(/"/g, ""))
        : fallbackFileName;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setStatus(`Template "${template.name}" exported.`, "success");
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to export document template.", "error");
    }
  }

  async function handleDocumentTemplateImportSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin or Owner users can import document templates.", "error");
      return;
    }

    const validationError = validateDocumentTemplateImportForm(documentTemplateImportForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Importing DOCX document template...", "info");

    try {
      const formData = new FormData();
      formData.append("name", documentTemplateImportForm.name.trim());
      formData.append("documentType", documentTemplateImportForm.documentType);
      formData.append("isDefault", String(documentTemplateImportForm.isDefault));
      formData.append("contentHtml", documentTemplateImportForm.contentHtml.trim());

      if (documentTemplateImportForm.file) {
        formData.append("file", documentTemplateImportForm.file);
      }

      const response = await fetch("/document-templates/import", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const importedTemplate = (await response.json()) as DocumentTemplate;

      setDocumentTemplateImportForm(emptyDocumentTemplateImportForm);
      setStatus(`DOCX template "${importedTemplate.name}" imported successfully.`, "success");
      await loadDocumentTemplates();
      await loadGlobalAuditLogs();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to import DOCX template.", "error");
    }
  }

  async function handleAdminUserSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isOwner) {
      setStatus("Only Owner users can create Admin users.", "error");
      return;
    }

    const validationError = validateAdminUserForm(adminUserForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating admin user...", "info");

    try {
      const response = await fetch("/users/admin", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          displayName: adminUserForm.displayName.trim(),
          email: adminUserForm.email.trim(),
          password: adminUserForm.password
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      const createdUser = (await response.json()) as AuthUser;

      setAdminUserForm(emptyAdminUserForm);
      setStatus(`Admin user "${createdUser.displayName}" created successfully.`, "success");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to create admin user.", "error");
    }
  }

  async function handleStaffUserSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin users can create Staff users.", "error");
      return;
    }

    const validationError = validateStaffUserForm(staffUserForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating staff user...", "info");

    try {
      const response = await fetch("/users/staff", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          displayName: staffUserForm.displayName.trim(),
          email: staffUserForm.email.trim(),
          password: staffUserForm.password
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const createdUser = (await response.json()) as AuthUser;

      setStaffUserForm(emptyStaffUserForm);
      setStatus(`Staff user "${createdUser.displayName}" created successfully.`, "success");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setStatus("Failed to create staff user. Check permissions and try again.", "error");
    }
  }

  async function handleChangePasswordSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Sign in before changing your password.", "error");
      return;
    }

    const validationError = validateChangePasswordForm(changePasswordForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Changing password...", "info");

    try {
      const response = await fetch("/auth/change-password", {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          currentPassword: changePasswordForm.currentPassword,
          newPassword: changePasswordForm.newPassword
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setChangePasswordForm(emptyChangePasswordForm);
      setStatus("Password changed successfully.", "success");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to change password.", "error");
    }
  }

  async function handleResetPasswordSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isAdminOrOwner) {
      setStatus("Only Admin users can reset Staff passwords.", "error");
      return;
    }

    const validationError = validateResetPasswordForm(resetPasswordForm);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    const selectedUser = users.find((user) => user.id === resetPasswordForm.userId);

    if (!selectedUser || selectedUser.role !== "Staff") {
      setStatus("Select a valid Staff user before resetting a password.", "error");
      return;
    }

    setStatus("Resetting Staff password...", "info");

    try {
      const response = await fetch(`/users/${resetPasswordForm.userId}/reset-password`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          newPassword: resetPasswordForm.newPassword
        })
      });

      if (handleUnauthorizedResponse(response)) {
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep fallback message.
        }

        throw new Error(errorMessage);
      }

      setResetPasswordForm(emptyResetPasswordForm);
      setStatus(`Password reset for ${selectedUser.email}.`, "success");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Failed to reset password.", "error");
    }
  }

  function clearRequestFilters() {
    setRequestStatusFilter("Pending");
    setRequestRequesterFilter("");
    setRequestFromDate("");
    setRequestToDate("");
  }

  function clearAuditFilters() {
    setAuditFilters(emptyAuditFilters);
  }

  function clearQuoteFilters() {
    setQuoteFilters(emptyQuoteFilters);
  }

  function clearContractFilters() {
    setContractFilters(emptyContractFilters);
  }

  function clearScopeOfWorkFilters() {
    setScopeOfWorkFilters(emptyScopeOfWorkFilters);
  }

  const staffUsers = users.filter((user) => user.role === "Staff" && user.isActive);

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "All";
  const hasRequestFilters =
    requestStatusFilter !== "Pending" ||
    requestRequesterFilter.trim() ||
    requestFromDate ||
    requestToDate;

  const hasAuditFilters =
    auditFilters.entityType !== "All" ||
    auditFilters.entityId.trim() ||
    auditFilters.action.trim() ||
    auditFilters.performedBy.trim() ||
    auditFilters.from ||
    auditFilters.to;

  const hasQuoteFilters =
    quoteFilters.q.trim() ||
    quoteFilters.status !== "All" ||
    quoteFilters.sortBy !== "date" ||
    quoteFilters.sortDirection !== "desc" ||
    quoteFilters.from ||
    quoteFilters.to;

  const hasContractFilters =
    contractFilters.q.trim() ||
    contractFilters.status !== "All" ||
    contractFilters.sortBy !== "date" ||
    contractFilters.sortDirection !== "desc" ||
    contractFilters.from ||
    contractFilters.to;

  const hasScopeOfWorkFilters =
    scopeOfWorkFilters.q.trim() ||
    scopeOfWorkFilters.status !== "All" ||
    scopeOfWorkFilters.sortBy !== "date" ||
    scopeOfWorkFilters.sortDirection !== "desc" ||
    scopeOfWorkFilters.from ||
    scopeOfWorkFilters.to;

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
  });

  const sortedEditRequests = [...customerEditRequests].sort(
    (a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
  );

  if (!currentUser) {
    return (
      <div className="app-shell">
        <header className="page-header">
          <h1>LocalCRM</h1>
        </header>

        <div className={`status-banner status-${statusType}`}>
          {statusMessage}
        </div>

        <main className="auth-layout">
          <section className="card auth-card">
            <h2>Sign in</h2>

            <form className="customer-form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="owner@localcrm.dev"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Password"
                />
              </label>

              <button type="submit" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="auth-hint">
              Dev users: owner@localcrm.dev / Owner123!, admin@localcrm.dev / Admin123!, or staff@localcrm.dev / Staff123!
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="page-header app-header-row">
        <div>
          <h1>LocalCRM</h1>
        </div>

        <div className="user-panel">
          <div>
            <strong>{currentUser.displayName}</strong>
            <span>{currentUser.role}</span>
          </div>
          <button type="button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className={`status-banner status-${statusType}`}>
        {statusMessage}
      </div>

      <section className="layout-grid">
        <section className="card">
          <div className="section-header compact-header">
            <h2>Email Workflow Settings</h2>
            <span className={`status-chip ${emailConfigSavedForSession ? "status-chip-active" : "status-chip-inactive"}`}>
              {emailConfigSavedForSession ? "Session Ready" : "Not Configured"}
            </span>
          </div>

          <form className="customer-form" onSubmit={handleEmailConfigSubmit}>
            <div className="form-grid">
              <label>
                SMTP Host
                <input
                  value={emailConfigForm.smtpHost}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                />
              </label>

              <label>
                SMTP Port
                <input
                  value={emailConfigForm.smtpPort}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, smtpPort: e.target.value })}
                  placeholder="587"
                />
              </label>

              <label>
                Use TLS
                <select
                  value={emailConfigForm.useTls ? "true" : "false"}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, useTls: e.target.value === "true" })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label>
                From Email
                <input
                  value={emailConfigForm.fromEmail}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, fromEmail: e.target.value })}
                  placeholder="sender@example.com"
                />
              </label>

              <label>
                From Display Name
                <input
                  value={emailConfigForm.fromDisplayName}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, fromDisplayName: e.target.value })}
                  placeholder="LocalCRM"
                />
              </label>

              <label>
                SMTP Username
                <input
                  value={emailConfigForm.username}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, username: e.target.value })}
                  placeholder="sender@example.com"
                />
              </label>

              <label>
                SMTP Password / App Password
                <input
                  type="password"
                  value={emailConfigForm.password}
                  onChange={(e) => setEmailConfigForm({ ...emailConfigForm, password: e.target.value })}
                  placeholder="Session-only password"
                />
              </label>

              <label>
                Password Status
                <input value={maskedEmailPassword} readOnly />
              </label>
            </div>

            <div className="auth-hint">
              Phase 14b keeps email settings in memory only. They are not saved to localStorage, not saved to PostgreSQL, and clear on logout/session expiration/page refresh.
            </div>

            <div className="note-actions-row">
              <button type="submit">Save Email Settings for Session</button>

              <button type="button" onClick={clearSessionEmailConfig}>
                Clear Session Email Settings
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="section-header compact-header">
            <h2>Email Send</h2>
            <span className="status-chip status-chip-active">Phase 14a</span>
          </div>

          <form className="customer-form" onSubmit={handleEmailDraftSave}>
            <div className="form-grid">
              <label>
                To
                <input
                  value={emailDraftForm.to}
                  onChange={(e) => setEmailDraftForm({ ...emailDraftForm, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </label>

              <label>
                CC
                <input
                  value={emailDraftForm.cc}
                  onChange={(e) => setEmailDraftForm({ ...emailDraftForm, cc: e.target.value })}
                  placeholder="optional@example.com"
                />
              </label>

              <label>
                BCC
                <input
                  value={emailDraftForm.bcc}
                  onChange={(e) => setEmailDraftForm({ ...emailDraftForm, bcc: e.target.value })}
                  placeholder="optional@example.com"
                />
              </label>

              <label>
                Subject
                <input
                  value={emailDraftForm.subject}
                  onChange={(e) => setEmailDraftForm({ ...emailDraftForm, subject: e.target.value })}
                  placeholder="Quote / Contract / Scope of Work"
                />
              </label>

              <label>
                Body Format
                <select
                  value={emailDraftForm.isHtml ? "html" : "text"}
                  onChange={(e) => setEmailDraftForm({ ...emailDraftForm, isHtml: e.target.value === "html" })}
                >
                  <option value="text">Plain Text</option>
                  <option value="html">HTML</option>
                </select>
              </label>

              <label>
                Generated Document Attachment
                <select
                  value={emailDraftForm.generatedDocumentId}
                  onChange={(e) =>
                    setEmailDraftForm({ ...emailDraftForm, generatedDocumentId: e.target.value })
                  }
                >
                  <option value="">No Attachment</option>
                  {emailAttachableDocuments.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.documentType} · {document.fileName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Selected Attachment
                <input value={getSelectedEmailAttachmentName()} readOnly />
              </label>
            </div>

            <label>
              Body
              <textarea
                value={emailDraftForm.body}
                onChange={(e) => setEmailDraftForm({ ...emailDraftForm, body: e.target.value })}
                placeholder="Email message body"
                rows={6}
              />
            </label>

            <div className="auth-hint">
              Phase 14b sends through the backend using session-only SMTP settings. Settings are sent only with this explicit send request and are not persisted by the CRM.
            </div>

            <div className="note-actions-row">
              <button type="submit" disabled={!emailConfigSavedForSession}>
                Send Email
              </button>

              <button type="button" onClick={() => loadGeneratedDocuments()}>
                Refresh Attachments
              </button>

              <button type="button" onClick={() => setEmailDraftForm(emptyEmailDraftForm)}>
                Clear Draft
              </button>
            </div>
          </form>
        </section>
      </section>

      <section className="card">
        <div className="section-header compact-header">
          <h2>Generated Documents</h2>
          <span className="count-chip">{generatedDocuments.length}</span>
        </div>

        <div className="note-actions-row">
          <button type="button" onClick={() => loadGeneratedDocuments()}>
            Refresh Generated Documents
          </button>
        </div>

        {renderGeneratedDocumentList(generatedDocuments, "No generated documents have been stored yet.")}
      </section>

      {isAdminOrOwner && (
        <section className="layout-grid">
          <section className="card">
            <div className="section-header compact-header">
              <h2>Document Templates</h2>
              <span className="count-chip">{documentTemplates.length}</span>
            </div>

            <div className="note-actions-row">
              <label>
                Type
                <select
                  value={documentTemplateTypeFilter}
                  onChange={(e) => setDocumentTemplateTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Quote">Quote</option>
                  <option value="Contract">Contract</option>
                  <option value="ScopeOfWork">Scope of Work</option>
                </select>
              </label>

              <button type="button" onClick={loadDocumentTemplates}>
                Refresh Templates
              </button>

              <button type="button" onClick={seedDefaultDocumentTemplates}>
                Seed Defaults
              </button>

              <button type="button" onClick={() => setDocumentTemplateForm(emptyDocumentTemplateForm)}>
                New Template
              </button>
            </div>

            <div className="stack-list compact-list">
              {documentTemplates.length === 0 ? (
                <p className="muted-text">No document templates found.</p>
              ) : (
                documentTemplates.map((template) => (
                  <div key={template.id} className="stack-item">
                    <div className="stack-item-header">
                      <strong>{template.name}</strong>
                      <span className={`status-chip ${template.isActive ? "status-chip-active" : "status-chip-inactive"}`}>
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="compact-content">
                      {template.documentType} · {template.sourceFormat || "Html"}
                      {template.isDefault ? " · Default" : ""}
                      {template.originalFileName ? ` · ${template.originalFileName}` : ""}
                    </div>

                    <div className="muted-text compact-meta">
                      Updated {formatDate(template.updatedAtUtc)}
                      {template.importedAtUtc ? ` · Imported ${formatDate(template.importedAtUtc)}` : ""}
                    </div>

                    <div className="quote-status-row">
                      <button type="button" onClick={() => editDocumentTemplate(template)}>
                        Edit
                      </button>

                      <button type="button" onClick={() => exportDocumentTemplate(template)}>
                        Export
                      </button>

                      <button
                        type="button"
                        onClick={() => setDefaultDocumentTemplate(template.id)}
                        disabled={!template.isActive || template.isDefault}
                      >
                        Set Default
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocumentTemplateActiveState(template.id, !template.isActive)}
                      >
                        {template.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <div className="section-header compact-header">
              <h2>Import DOCX Template</h2>
              <span className="status-chip status-chip-active">Phase 13c</span>
            </div>

            <form className="customer-form" onSubmit={handleDocumentTemplateImportSubmit}>
              <div className="form-grid">
                <label>
                  Template Name
                  <input
                    value={documentTemplateImportForm.name}
                    onChange={(e) =>
                      setDocumentTemplateImportForm({ ...documentTemplateImportForm, name: e.target.value })
                    }
                    placeholder="Imported Quote Template"
                  />
                </label>

                <label>
                  Document Type
                  <select
                    value={documentTemplateImportForm.documentType}
                    onChange={(e) =>
                      setDocumentTemplateImportForm({
                        ...documentTemplateImportForm,
                        documentType: e.target.value
                      })
                    }
                  >
                    <option value="Quote">Quote</option>
                    <option value="Contract">Contract</option>
                    <option value="ScopeOfWork">Scope of Work</option>
                  </select>
                </label>

                <label>
                  Set as Default
                  <select
                    value={documentTemplateImportForm.isDefault ? "true" : "false"}
                    onChange={(e) =>
                      setDocumentTemplateImportForm({
                        ...documentTemplateImportForm,
                        isDefault: e.target.value === "true"
                      })
                    }
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>

                <label>
                  DOCX File
                  <input
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) =>
                      setDocumentTemplateImportForm({
                        ...documentTemplateImportForm,
                        file: e.target.files?.[0] ?? null
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Optional Fallback HTML
                <textarea
                  value={documentTemplateImportForm.contentHtml}
                  onChange={(e) =>
                    setDocumentTemplateImportForm({
                      ...documentTemplateImportForm,
                      contentHtml: e.target.value
                    })
                  }
                  placeholder="<section><h1>{{Title}}</h1></section>"
                  rows={5}
                />
              </label>

              <div className="auth-hint">
                The original DOCX file is stored for export. Full DOCX rendering from CRM records is planned for the next document generation layer.
              </div>

              <div className="note-actions-row">
                <button type="submit">Import DOCX Template</button>

                <button type="button" onClick={() => setDocumentTemplateImportForm(emptyDocumentTemplateImportForm)}>
                  Clear Import
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="section-header compact-header">
              <h2>{documentTemplateForm.id ? "Edit Template" : "Create Template"}</h2>
              <span className="status-chip status-chip-active">Phase 13a</span>
            </div>

            <form className="customer-form" onSubmit={handleDocumentTemplateSubmit}>
              <div className="form-grid">
                <label>
                  Template Name
                  <input
                    value={documentTemplateForm.name}
                    onChange={(e) => setDocumentTemplateForm({ ...documentTemplateForm, name: e.target.value })}
                    placeholder="Default Quote Template"
                  />
                </label>

                <label>
                  Document Type
                  <select
                    value={documentTemplateForm.documentType}
                    onChange={(e) => setDocumentTemplateForm({ ...documentTemplateForm, documentType: e.target.value })}
                  >
                    <option value="Quote">Quote</option>
                    <option value="Contract">Contract</option>
                    <option value="ScopeOfWork">Scope of Work</option>
                  </select>
                </label>

                <label>
                  Default Template
                  <select
                    value={documentTemplateForm.isDefault ? "true" : "false"}
                    onChange={(e) =>
                      setDocumentTemplateForm({ ...documentTemplateForm, isDefault: e.target.value === "true" })
                    }
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>

                <label>
                  Active
                  <select
                    value={documentTemplateForm.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setDocumentTemplateForm({ ...documentTemplateForm, isActive: e.target.value === "true" })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
              </div>

              <label>
                Template HTML
                <textarea
                  value={documentTemplateForm.contentHtml}
                  onChange={(e) => setDocumentTemplateForm({ ...documentTemplateForm, contentHtml: e.target.value })}
                  placeholder="<section><h1>{{Title}}</h1></section>"
                  rows={10}
                />
              </label>

              <div className="auth-hint">
                Supported template types: Quote, Contract, ScopeOfWork. Placeholder tokens are stored now and will be wired into generated documents in Phase 13b.
              </div>

              <div className="note-actions-row">
                <button type="submit">
                  {documentTemplateForm.id ? "Update Template" : "Create Template"}
                </button>

                <button type="button" onClick={() => setDocumentTemplateForm(emptyDocumentTemplateForm)}>
                  Clear
                </button>
              </div>
            </form>
          </section>
        </section>
      )}

      <section className="account-grid">
        <section className="card">
          <div className="section-header compact-header">
            <h2>Account Security</h2>
            <span className="status-chip status-chip-active">Signed In</span>
          </div>

          <form className="customer-form" onSubmit={handleChangePasswordSubmit}>
            <div className="form-grid">
              <label>
                Current Password
                <input
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  placeholder="Current password"
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  placeholder="At least 8 characters, uppercase, lowercase, number"
                />
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </label>
            </div>

            <button type="submit">Change My Password</button>
          </form>
        </section>

        {isAdminOrOwner && (
          <section className="card">
            <div className="section-header compact-header">
              <h2>Reset Staff Password</h2>
              <span className="status-chip status-chip-active">Admin / Owner</span>
            </div>

            <form className="customer-form" onSubmit={handleResetPasswordSubmit}>
              <div className="form-grid">
                <label>
                  Staff User
                  <select
                    value={resetPasswordForm.userId}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, userId: e.target.value })}
                  >
                    <option value="">Select Staff user</option>
                    {staffUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName} — {user.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  New Temporary Password
                  <input
                    type="password"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                    placeholder="At least 8 characters, uppercase, lowercase, number"
                  />
                </label>

                <label>
                  Confirm Temporary Password
                  <input
                    type="password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm temporary password"
                  />
                </label>
              </div>

              <button type="submit">Reset Staff Password</button>
            </form>
          </section>
        )}
      </section>

      {isAdminOrOwner && (
        <section className="dashboard-grid">
          <section className="dashboard-card">
            <span>Total Customers</span>
            <strong>{dashboardSummary.totalCustomers}</strong>
          </section>

          <section className="dashboard-card">
            <span>Active</span>
            <strong>{dashboardSummary.activeCustomers}</strong>
          </section>

          <section className="dashboard-card">
            <span>Leads</span>
            <strong>{dashboardSummary.leadCustomers}</strong>
          </section>

          <section className="dashboard-card">
            <span>Pending Edits</span>
            <strong>{dashboardSummary.pendingEditRequests}</strong>
          </section>

          <section className="dashboard-card">
            <span>Pending Today</span>
            <strong>{dashboardSummary.pendingEditRequestsToday}</strong>
          </section>

          <section className="dashboard-card">
            <span>7-Day Requests</span>
            <strong>{dashboardSummary.editRequestsLast7Days}</strong>
          </section>
        </section>
      )}

      <main className="layout-grid">
        <section className="card">
          <div className="section-header">
            <h2>Customers</h2>
            <button type="button" onClick={loadCustomers} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="toolbar">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="result-count">
            Showing {customers.length} of {totalCustomerCount || customers.length} customers
          </div>

          {customerLoadError && (
            <div className="inline-error">
              {customerLoadError}
            </div>
          )}

          {loading && (
            <div className="inline-state">
              Loading customer records...
            </div>
          )}

          {!loading && customers.length === 0 && !customerLoadError && (
            <div className="inline-state">
              {hasActiveFilters
                ? "No customers match the current search/filter."
                : "No customers found. Create one to get started."}
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="table-wrap">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={selectedCustomer?.id === customer.id ? "selected-row" : ""}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td>
                        <div className="customer-name-cell">
                          <span>{customer.name}</span>
                          {pendingRequestCustomerIdSet.has(customer.id) && (
                            <span className="pending-indicator">Pending Edit</span>
                          )}
                        </div>
                      </td>
                      <td>{customer.type}</td>
                      <td>{customer.email || "—"}</td>
                      <td>{customer.phone || "—"}</td>
                      <td>{customer.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Add Customer</h2>

          <form className="customer-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Customer name"
                />
              </label>

              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Company">Company</option>
                  <option value="Person">Person</option>
                </select>
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="555-0100"
                />
              </label>

              <label>
                Address Line 1
                <input
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="Street address"
                />
              </label>

              <label>
                Address Line 2
                <input
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  placeholder="Suite, unit, etc."
                />
              </label>

              <label>
                City
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </label>

              <label>
                State
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                />
              </label>

              <label>
                Postal Code
                <input
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="Postal code"
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Lead">Lead</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <button type="submit">Create Customer</button>
          </form>
        </section>
      </main>

      <section className="layout-grid">
        <section className="card">
          <div className="section-header compact-header">
            <h2>Quotes</h2>
            <span className="count-chip">{quotes.length}</span>
          </div>

          <div className="quote-filter-grid">
            <label>
              Search
              <input
                value={quoteFilters.q}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, q: e.target.value })}
                placeholder="Quote number, customer, title..."
              />
            </label>

            <label>
              Status
              <select
                value={quoteFilters.status}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, status: e.target.value })}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </label>

            <label>
              Sort By
              <select
                value={quoteFilters.sortBy}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, sortBy: e.target.value })}
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="name">Customer/Name</option>
                <option value="amount">Amount</option>
              </select>
            </label>

            <label>
              Direction
              <select
                value={quoteFilters.sortDirection}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, sortDirection: e.target.value })}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>

            <label>
              From
              <input
                type="date"
                value={quoteFilters.from}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, from: e.target.value })}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={quoteFilters.to}
                onChange={(e) => setQuoteFilters({ ...quoteFilters, to: e.target.value })}
              />
            </label>
          </div>

          <div className="note-actions-row">
            <button type="button" onClick={loadQuotes}>
              Refresh Quotes
            </button>

            <button type="button" onClick={clearQuoteFilters} disabled={!hasQuoteFilters}>
              Clear Quote Filters
            </button>
          </div>

          <div className="stack-list compact-list quote-list">
            {quotes.length === 0 ? (
              <p className="muted-text">No quotes match the selected filters.</p>
            ) : (
              quotes.map((quote) => (
                <div key={quote.id} className="stack-item quote-item">
                  <div className="stack-item-header">
                    <strong>{quote.quoteNumber}</strong>
                    <span className={`status-chip status-chip-${quote.status.toLowerCase()}`}>
                      {quote.status}
                    </span>
                  </div>

                  <div className="compact-content">
                    {quote.title} · {quote.customerName}
                  </div>

                  <div className="muted-text compact-meta">
                    {formatCurrency(quote.amount)} · Quote date {formatDate(quote.quoteDateUtc)}
                    {quote.sentAtUtc ? ` · Sent ${formatDate(quote.sentAtUtc)}` : ""}
                  </div>

                  {isAdminOrOwner && (
                    <div className="quote-status-row">
                      <button type="button" onClick={() => openQuoteDocument(quote.id)}>
                        View / Print
                      </button>
                      <button type="button" onClick={() => handleQuoteStatusUpdate(quote.id, "Sent")}>
                        Sent
                      </button>
                      <button type="button" onClick={() => handleQuoteStatusUpdate(quote.id, "Accepted")}>
                        Accept
                      </button>
                      <button type="button" onClick={() => handleQuoteStatusUpdate(quote.id, "Rejected")}>
                        Reject
                      </button>
                      <button type="button" onClick={() => handleQuoteStatusUpdate(quote.id, "Expired")}>
                        Expire
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header compact-header">
            <h2>Create Quote</h2>
            <span className="status-chip status-chip-active">Phase 11a</span>
          </div>

          <form className="customer-form" onSubmit={handleQuoteSubmit}>
            <div className="form-grid">
              <label>
                Customer
                <select
                  value={quoteForm.customerId}
                  onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Title
                <input
                  value={quoteForm.title}
                  onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })}
                  placeholder="Quote title"
                />
              </label>

              <label>
                Description
                <textarea
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                  placeholder="Scope summary or quote notes..."
                  rows={3}
                />
              </label>

              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quoteForm.amount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <label>
                Initial Status
                <select
                  value={quoteForm.status}
                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </label>
            </div>

            <button type="submit">Create Quote</button>
          </form>
        </section>
      </section>

      <section className="layout-grid">
        <section className="card">
          <div className="section-header compact-header">
            <h2>Contracts</h2>
            <span className="count-chip">{contracts.length}</span>
          </div>

          <div className="quote-filter-grid">
            <label>
              Search
              <input
                value={contractFilters.q}
                onChange={(e) => setContractFilters({ ...contractFilters, q: e.target.value })}
                placeholder="Contract number, customer, title..."
              />
            </label>

            <label>
              Status
              <select
                value={contractFilters.status}
                onChange={(e) => setContractFilters({ ...contractFilters, status: e.target.value })}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Signed">Signed</option>
                <option value="Completed/Billable">Completed/Billable</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              Sort By
              <select
                value={contractFilters.sortBy}
                onChange={(e) => setContractFilters({ ...contractFilters, sortBy: e.target.value })}
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="name">Customer/Name</option>
                <option value="amount">Amount</option>
              </select>
            </label>

            <label>
              Direction
              <select
                value={contractFilters.sortDirection}
                onChange={(e) => setContractFilters({ ...contractFilters, sortDirection: e.target.value })}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>

            <label>
              From
              <input
                type="date"
                value={contractFilters.from}
                onChange={(e) => setContractFilters({ ...contractFilters, from: e.target.value })}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={contractFilters.to}
                onChange={(e) => setContractFilters({ ...contractFilters, to: e.target.value })}
              />
            </label>
          </div>

          <div className="note-actions-row">
            <button type="button" onClick={loadContracts}>
              Refresh Contracts
            </button>

            <button type="button" onClick={clearContractFilters} disabled={!hasContractFilters}>
              Clear Contract Filters
            </button>
          </div>

          <div className="stack-list compact-list quote-list">
            {contracts.length === 0 ? (
              <p className="muted-text">No contracts match the selected filters.</p>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="stack-item quote-item">
                  <div className="stack-item-header">
                    <strong>{contract.contractNumber}</strong>
                    <span className={`status-chip status-chip-${contract.status.toLowerCase().replace("/", "-")}`}>
                      {contract.status}
                    </span>
                  </div>

                  <div className="compact-content">
                    {contract.title} · {contract.customerName}
                  </div>

                  <div className="muted-text compact-meta">
                    {formatCurrency(contract.amount)} · Contract date {formatDate(contract.contractDateUtc)}
                    {contract.quoteNumber ? ` · Quote ${contract.quoteNumber}` : ""}
                    {contract.signedAtUtc ? ` · Signed ${formatDate(contract.signedAtUtc)}` : ""}
                  </div>

                  <div className="quote-status-row">
                    <button type="button" onClick={() => openContractDocument(contract.id)}>
                      View / Print
                    </button>

                    {isAdminOrOwner && (
                      <>
                        <button type="button" onClick={() => handleContractStatusUpdate(contract.id, "Sent")}>
                          Sent
                        </button>
                        <button type="button" onClick={() => handleContractStatusUpdate(contract.id, "Signed")}>
                          Sign
                        </button>
                        <button type="button" onClick={() => handleContractStatusUpdate(contract.id, "Completed/Billable")}>
                          Billable
                        </button>
                        <button type="button" onClick={() => handleContractStatusUpdate(contract.id, "Cancelled")}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header compact-header">
            <h2>Create Contract</h2>
            <span className="status-chip status-chip-active">Phase 11b</span>
          </div>

          <form className="customer-form" onSubmit={handleContractSubmit}>
            <div className="form-grid">
              <label>
                Customer
                <select
                  value={contractForm.customerId}
                  onChange={(e) => setContractForm({ ...contractForm, customerId: e.target.value, quoteId: "" })}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Linked Quote
                <select
                  value={contractForm.quoteId}
                  onChange={(e) => setContractForm({ ...contractForm, quoteId: e.target.value })}
                >
                  <option value="">No linked quote</option>
                  {quotes
                    .filter((quote) => !contractForm.customerId || quote.customerId === contractForm.customerId)
                    .map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.quoteNumber} — {quote.title}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Title
                <input
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  placeholder="Contract title"
                />
              </label>

              <label>
                Description
                <textarea
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  placeholder="Contract terms or summary..."
                  rows={3}
                />
              </label>

              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={contractForm.amount}
                  onChange={(e) => setContractForm({ ...contractForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <label>
                Initial Status
                <select
                  value={contractForm.status}
                  onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Signed">Signed</option>
                  <option value="Completed/Billable">Completed/Billable</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <button type="submit">Create Contract</button>
          </form>
        </section>
      </section>

      <section className="layout-grid">
        <section className="card">
          <div className="section-header compact-header">
            <h2>Scopes of Work</h2>
            <span className="count-chip">{scopesOfWork.length}</span>
          </div>

          <div className="quote-filter-grid">
            <label>
              Search
              <input
                value={scopeOfWorkFilters.q}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, q: e.target.value })}
                placeholder="SOW number, customer, title..."
              />
            </label>

            <label>
              Status
              <select
                value={scopeOfWorkFilters.status}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, status: e.target.value })}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              Sort By
              <select
                value={scopeOfWorkFilters.sortBy}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, sortBy: e.target.value })}
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="name">Customer/Name</option>
                <option value="amount">Amount</option>
              </select>
            </label>

            <label>
              Direction
              <select
                value={scopeOfWorkFilters.sortDirection}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, sortDirection: e.target.value })}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>

            <label>
              From
              <input
                type="date"
                value={scopeOfWorkFilters.from}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, from: e.target.value })}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={scopeOfWorkFilters.to}
                onChange={(e) => setScopeOfWorkFilters({ ...scopeOfWorkFilters, to: e.target.value })}
              />
            </label>
          </div>

          <div className="note-actions-row">
            <button type="button" onClick={loadScopesOfWork}>
              Refresh SOW
            </button>

            <button type="button" onClick={clearScopeOfWorkFilters} disabled={!hasScopeOfWorkFilters}>
              Clear SOW Filters
            </button>
          </div>

          <div className="stack-list compact-list quote-list">
            {scopesOfWork.length === 0 ? (
              <p className="muted-text">No scopes of work match the selected filters.</p>
            ) : (
              scopesOfWork.map((scope) => (
                <div key={scope.id} className="stack-item quote-item">
                  <div className="stack-item-header">
                    <strong>{scope.scopeNumber}</strong>
                    <span className={`status-chip status-chip-${getStatusClassName(scope.status)}`}>
                      {scope.status}
                    </span>
                  </div>

                  <div className="compact-content">
                    {scope.title} · {scope.customerName}
                  </div>

                  <div className="muted-text compact-meta">
                    {formatCurrency(scope.estimatedAmount)} · SOW date {formatDate(scope.scopeDateUtc)}
                    {scope.quoteNumber ? ` · Quote ${scope.quoteNumber}` : ""}
                    {scope.contractNumber ? ` · Contract ${scope.contractNumber}` : ""}
                    {scope.completedAtUtc ? ` · Completed ${formatDate(scope.completedAtUtc)}` : ""}
                  </div>

                  <div className="quote-status-row">
                    <button type="button" onClick={() => openScopeOfWorkDocument(scope.id)}>
                      View / Print
                    </button>

                    {isAdminOrOwner && (
                      <>
                        <button type="button" onClick={() => handleScopeOfWorkStatusUpdate(scope.id, "In Review")}>
                          Review
                        </button>
                        <button type="button" onClick={() => handleScopeOfWorkStatusUpdate(scope.id, "Approved")}>
                          Approve
                        </button>
                        <button type="button" onClick={() => handleScopeOfWorkStatusUpdate(scope.id, "Active")}>
                          Active
                        </button>
                        <button type="button" onClick={() => handleScopeOfWorkStatusUpdate(scope.id, "Completed")}>
                          Complete
                        </button>
                        <button type="button" onClick={() => handleScopeOfWorkStatusUpdate(scope.id, "Cancelled")}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header compact-header">
            <h2>Create Scope of Work</h2>
            <span className="status-chip status-chip-active">Phase 12</span>
          </div>

          <form className="customer-form" onSubmit={handleScopeOfWorkSubmit}>
            <div className="form-grid">
              <label>
                Customer
                <select
                  value={scopeOfWorkForm.customerId}
                  onChange={(e) =>
                    setScopeOfWorkForm({
                      ...scopeOfWorkForm,
                      customerId: e.target.value,
                      quoteId: "",
                      contractId: ""
                    })
                  }
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Linked Quote
                <select
                  value={scopeOfWorkForm.quoteId}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, quoteId: e.target.value })}
                >
                  <option value="">No linked quote</option>
                  {quotes
                    .filter((quote) => !scopeOfWorkForm.customerId || quote.customerId === scopeOfWorkForm.customerId)
                    .map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.quoteNumber} — {quote.title}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Linked Contract
                <select
                  value={scopeOfWorkForm.contractId}
                  onChange={(e) => {
                    const selectedContract = contracts.find((contract) => contract.id === e.target.value);
                    setScopeOfWorkForm({
                      ...scopeOfWorkForm,
                      contractId: e.target.value,
                      quoteId: selectedContract?.quoteId ?? scopeOfWorkForm.quoteId
                    });
                  }}
                >
                  <option value="">No linked contract</option>
                  {contracts
                    .filter((contract) => !scopeOfWorkForm.customerId || contract.customerId === scopeOfWorkForm.customerId)
                    .map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractNumber} — {contract.title}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Title
                <input
                  value={scopeOfWorkForm.title}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, title: e.target.value })}
                  placeholder="Scope of work title"
                />
              </label>

              <label>
                Description
                <textarea
                  value={scopeOfWorkForm.description}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, description: e.target.value })}
                  placeholder="Scope overview..."
                  rows={3}
                />
              </label>

              <label>
                Deliverables
                <textarea
                  value={scopeOfWorkForm.deliverables}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, deliverables: e.target.value })}
                  placeholder="Deliverables, outputs, milestones..."
                  rows={3}
                />
              </label>

              <label>
                Assumptions
                <textarea
                  value={scopeOfWorkForm.assumptions}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, assumptions: e.target.value })}
                  placeholder="Assumptions..."
                  rows={3}
                />
              </label>

              <label>
                Exclusions
                <textarea
                  value={scopeOfWorkForm.exclusions}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, exclusions: e.target.value })}
                  placeholder="Exclusions..."
                  rows={3}
                />
              </label>

              <label>
                Estimated Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={scopeOfWorkForm.estimatedAmount}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, estimatedAmount: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <label>
                Initial Status
                <select
                  value={scopeOfWorkForm.status}
                  onChange={(e) => setScopeOfWorkForm({ ...scopeOfWorkForm, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <button type="submit">Create Scope of Work</button>
          </form>
        </section>
      </section>

      {isAdminOrOwner && (
        <section className="layout-grid">
          {isOwner && (
            <section className="card">
              <div className="section-header compact-header">
                <h2>Create Admin User</h2>
                <span className="status-chip status-chip-active">Owner Only</span>
              </div>

              <form className="customer-form" onSubmit={handleAdminUserSubmit}>
                <div className="form-grid">
                  <label>
                    Display Name
                    <input
                      value={adminUserForm.displayName}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, displayName: e.target.value })}
                      placeholder="Admin user name"
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={adminUserForm.email}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </label>

                  <label>
                    Temporary Password
                    <input
                      type="password"
                      value={adminUserForm.password}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, password: e.target.value })}
                      placeholder="At least 8 characters, uppercase, lowercase, number"
                    />
                  </label>
                </div>

                <button type="submit">Create Admin User</button>
              </form>
            </section>
          )}

          <section className="card">
            <div className="section-header compact-header">
              <h2>Create Staff User</h2>
              <span className="status-chip status-chip-active">Admin / Owner</span>
            </div>

            <form className="customer-form" onSubmit={handleStaffUserSubmit}>
              <div className="form-grid">
                <label>
                  Display Name
                  <input
                    value={staffUserForm.displayName}
                    onChange={(e) => setStaffUserForm({ ...staffUserForm, displayName: e.target.value })}
                    placeholder="Staff user name"
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={staffUserForm.email}
                    onChange={(e) => setStaffUserForm({ ...staffUserForm, email: e.target.value })}
                    placeholder="staff@example.com"
                  />
                </label>

                <label>
                  Temporary Password
                  <input
                    type="password"
                    value={staffUserForm.password}
                    onChange={(e) => setStaffUserForm({ ...staffUserForm, password: e.target.value })}
                    placeholder="At least 8 characters"
                  />
                </label>
              </div>

              <button type="submit">Create Staff User</button>
            </form>
          </section>

          <section className="card">
            <div className="section-header compact-header">
              <h2>Edit Requests</h2>
              <span className="count-chip">{requestQueue.length}</span>
            </div>

            <div className="request-filter-grid">
              <label>
                Status
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="All">All Requests</option>
                </select>
              </label>

              <label>
                Requester
                <input
                  value={requestRequesterFilter}
                  onChange={(e) => setRequestRequesterFilter(e.target.value)}
                  placeholder="staff@example.com"
                />
              </label>

              <label>
                From
                <input
                  type="date"
                  value={requestFromDate}
                  onChange={(e) => setRequestFromDate(e.target.value)}
                />
              </label>

              <label>
                To
                <input
                  type="date"
                  value={requestToDate}
                  onChange={(e) => setRequestToDate(e.target.value)}
                />
              </label>
            </div>

            <div className="note-actions-row">
              <button type="button" onClick={refreshAdminWorkflow}>
                Refresh Workflow
              </button>

              <button type="button" onClick={clearRequestFilters} disabled={!hasRequestFilters}>
                Clear Filters
              </button>
            </div>

            <label className="customer-form">
              Decision Note
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Optional approval/rejection note..."
                rows={2}
              />
            </label>

            <div className="stack-list compact-list">
              {requestQueue.length === 0 ? (
                <p className="muted-text">No edit requests match the selected filters.</p>
              ) : (
                requestQueue.map((request) => {
                  const comparisonRows = getRequestComparisonRows(request);
                  const changedCount = comparisonRows.filter((row) => row.changed).length;

                  return (
                    <div key={request.id} className="stack-item request-review-card">
                      <div className="stack-item-header">
                        <strong>{request.requestedName}</strong>
                        <span className={`status-chip status-chip-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="compact-content">
                        Requested by {request.requestedByEmail}
                      </div>

                      <div className="muted-text compact-meta">
                        {new Date(request.createdAtUtc).toLocaleString()} · {changedCount} field{changedCount === 1 ? "" : "s"} changed
                      </div>

                      <div className="comparison-grid comparison-header">
                        <strong>Field</strong>
                        <strong>Current</strong>
                        <strong>Requested</strong>
                      </div>

                      {comparisonRows.map((row) => (
                        <div
                          key={`${request.id}-${row.label}`}
                          className={row.changed ? "comparison-grid changed-field" : "comparison-grid"}
                        >
                          <span>{row.label}</span>
                          <span>{formatBlank(row.currentValue)}</span>
                          <span>{formatBlank(row.requestedValue)}</span>
                        </div>
                      ))}

                      {request.status === "Pending" ? (
                        <div className="note-actions-row">
                          <button type="button" onClick={() => handleEditRequestDecision(request.id, "approve")}>
                            Approve
                          </button>
                          <button type="button" onClick={() => handleEditRequestDecision(request.id, "reject")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="muted-text compact-meta">
                          Decision by {request.adminDecisionByEmail || "—"}
                          {request.adminDecisionNote ? ` · ${request.adminDecisionNote}` : ""}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </section>
      )}

      {isAdminOrOwner && (
        <section className="card">
          <div className="section-header compact-header">
            <h2>Audit Review</h2>
            <span className="count-chip">{globalAuditLogs.length}</span>
          </div>

          <div className="audit-filter-grid">
            <label>
              Entity Type
              <select
                value={auditFilters.entityType}
                onChange={(e) => setAuditFilters({ ...auditFilters, entityType: e.target.value })}
              >
                <option value="All">All Entity Types</option>
                <option value="User">User</option>
                <option value="Customer">Customer</option>
                <option value="Auth">Auth</option>
              </select>
            </label>

            <label>
              Entity ID
              <input
                value={auditFilters.entityId}
                onChange={(e) => setAuditFilters({ ...auditFilters, entityId: e.target.value })}
                placeholder="Entity ID or email"
              />
            </label>

            <label>
              Action
              <input
                value={auditFilters.action}
                onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                placeholder="Login, Password, Created..."
              />
            </label>

            <label>
              Performed By
              <input
                value={auditFilters.performedBy}
                onChange={(e) => setAuditFilters({ ...auditFilters, performedBy: e.target.value })}
                placeholder="owner@localcrm.dev"
              />
            </label>

            <label>
              From
              <input
                type="date"
                value={auditFilters.from}
                onChange={(e) => setAuditFilters({ ...auditFilters, from: e.target.value })}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={auditFilters.to}
                onChange={(e) => setAuditFilters({ ...auditFilters, to: e.target.value })}
              />
            </label>
          </div>

          <div className="note-actions-row">
            <button type="button" onClick={loadGlobalAuditLogs}>
              Refresh Audit
            </button>

            <button type="button" onClick={clearAuditFilters} disabled={!hasAuditFilters}>
              Clear Audit Filters
            </button>
          </div>

          <div className="stack-list compact-list audit-review-list">
            {globalAuditLogs.length === 0 ? (
              <p className="muted-text">No audit entries match the selected filters.</p>
            ) : (
              globalAuditLogs.map((log) => (
                <div key={log.id} className="stack-item audit-item">
                  <div className="stack-item-header">
                    <strong>{log.action}</strong>
                    <span>{new Date(log.createdAtUtc).toLocaleString()}</span>
                  </div>

                  <div className="compact-content">{log.details}</div>

                  <div className="muted-text compact-meta">
                    {log.entityType} · {log.entityId} · {log.performedBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {selectedCustomer ? (
        <section className="detail-grid">
          <section className="card">
            <div className="section-header">
              <h2>Customer Detail</h2>
              <span className={`status-chip status-chip-${selectedCustomer.status.toLowerCase()}`}>
                {selectedCustomer.status}
              </span>
            </div>

            <div className="customer-summary">
              <div>
                <strong>{selectedCustomer.name}</strong>
                <span>{selectedCustomer.type}</span>
              </div>
              <div>{selectedCustomer.email || "No email on file"}</div>
              <div>{selectedCustomer.phone || "No phone on file"}</div>
              <div>
                {[selectedCustomer.addressLine1, selectedCustomer.addressLine2, selectedCustomer.city, selectedCustomer.state, selectedCustomer.postalCode]
                  .filter(Boolean)
                  .join(", ") || "No address on file"}
              </div>
            </div>

            <div className="stack-list compact-list">
              <div className="section-header compact-header">
                <h3>Customer Quotes</h3>
                <span className="count-chip">{customerQuotes.length}</span>
              </div>

              {customerQuotes.length === 0 ? (
                <p className="muted-text">No quotes for this customer yet.</p>
              ) : (
                customerQuotes.map((quote) => (
                  <div key={quote.id} className="stack-item quote-item">
                    <div className="stack-item-header">
                      <strong>{quote.quoteNumber}</strong>
                      <span className={`status-chip status-chip-${quote.status.toLowerCase()}`}>
                        {quote.status}
                      </span>
                    </div>

                    <div className="compact-content">
                      {quote.title} · {formatCurrency(quote.amount)}
                    </div>

                    <div className="muted-text compact-meta">
                      Quote date {formatDate(quote.quoteDateUtc)}
                      {quote.sentAtUtc ? ` · Sent ${formatDate(quote.sentAtUtc)}` : ""}
                    </div>

                    <div className="quote-status-row">
                      <button type="button" onClick={() => openQuoteDocument(quote.id)}>
                        View / Print
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="stack-list compact-list">
              <div className="section-header compact-header">
                <h3>Customer Contracts</h3>
                <span className="count-chip">{customerContracts.length}</span>
              </div>

              {customerContracts.length === 0 ? (
                <p className="muted-text">No contracts for this customer yet.</p>
              ) : (
                customerContracts.map((contract) => (
                  <div key={contract.id} className="stack-item quote-item">
                    <div className="stack-item-header">
                      <strong>{contract.contractNumber}</strong>
                      <span className={`status-chip status-chip-${contract.status.toLowerCase().replace("/", "-")}`}>
                        {contract.status}
                      </span>
                    </div>

                    <div className="compact-content">
                      {contract.title} · {formatCurrency(contract.amount)}
                    </div>

                    <div className="muted-text compact-meta">
                      Contract date {formatDate(contract.contractDateUtc)}
                      {contract.quoteNumber ? ` · Quote ${contract.quoteNumber}` : ""}
                      {contract.signedAtUtc ? ` · Signed ${formatDate(contract.signedAtUtc)}` : ""}
                    </div>

                    <div className="quote-status-row">
                      <button type="button" onClick={() => openContractDocument(contract.id)}>
                        View / Print
                      </button>

                      <button type="button" onClick={() => generateContractDocumentFile(contract.id)}>
                        Generate File
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="stack-list compact-list">
              <div className="section-header compact-header">
                <h3>Customer Scopes of Work</h3>
                <span className="count-chip">{customerScopesOfWork.length}</span>
              </div>

              {customerScopesOfWork.length === 0 ? (
                <p className="muted-text">No scopes of work for this customer yet.</p>
              ) : (
                customerScopesOfWork.map((scope) => (
                  <div key={scope.id} className="stack-item quote-item">
                    <div className="stack-item-header">
                      <strong>{scope.scopeNumber}</strong>
                      <span className={`status-chip status-chip-${getStatusClassName(scope.status)}`}>
                        {scope.status}
                      </span>
                    </div>

                    <div className="compact-content">
                      {scope.title} · {formatCurrency(scope.estimatedAmount)}
                    </div>

                    <div className="muted-text compact-meta">
                      SOW date {formatDate(scope.scopeDateUtc)}
                      {scope.quoteNumber ? ` · Quote ${scope.quoteNumber}` : ""}
                      {scope.contractNumber ? ` · Contract ${scope.contractNumber}` : ""}
                      {scope.completedAtUtc ? ` · Completed ${formatDate(scope.completedAtUtc)}` : ""}
                    </div>

                    <div className="quote-status-row">
                      <button type="button" onClick={() => openScopeOfWorkDocument(scope.id)}>
                        View / Print
                      </button>

                      <button type="button" onClick={() => generateScopeOfWorkDocumentFile(scope.id)}>
                        Generate File
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="stack-list compact-list">
              <div className="section-header compact-header">
                <h3>Selected Document Files</h3>
                <span className="count-chip">{selectedSourceGeneratedDocuments.length}</span>
              </div>

              <div className="note-actions-row">
                <button
                  type="button"
                  onClick={() => selectedCustomer && loadGeneratedDocuments("Quote", customerQuotes[0]?.id ?? "")}
                  disabled={customerQuotes.length === 0}
                >
                  Load First Quote Files
                </button>

                <button
                  type="button"
                  onClick={() => selectedCustomer && loadGeneratedDocuments("Contract", customerContracts[0]?.id ?? "")}
                  disabled={customerContracts.length === 0}
                >
                  Load First Contract Files
                </button>

                <button
                  type="button"
                  onClick={() => selectedCustomer && loadGeneratedDocuments("ScopeOfWork", customerScopesOfWork[0]?.id ?? "")}
                  disabled={customerScopesOfWork.length === 0}
                >
                  Load First SOW Files
                </button>
              </div>

              {renderGeneratedDocumentList(
                selectedSourceGeneratedDocuments,
                "Select a document source using the buttons above to view stored files."
              )}
            </div>

            <form className="customer-form" onSubmit={isAdminOrOwner ? handleCustomerUpdate : handleEditRequestSubmit}>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </label>

                <label>
                  Type
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="Company">Company</option>
                    <option value="Person">Person</option>
                  </select>
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </label>

                <label>
                  Address Line 1
                  <input
                    value={editForm.addressLine1}
                    onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                  />
                </label>

                <label>
                  Address Line 2
                  <input
                    value={editForm.addressLine2}
                    onChange={(e) => setEditForm({ ...editForm, addressLine2: e.target.value })}
                  />
                </label>

                <label>
                  City
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </label>

                <label>
                  State
                  <input
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  />
                </label>

                <label>
                  Postal Code
                  <input
                    value={editForm.postalCode}
                    onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                  />
                </label>

                <label>
                  Status
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <button type="submit">
                {isAdminOrOwner ? "Save Customer" : "Submit Edit Request"}
              </button>
            </form>

            {!isAdminOrOwner && (
              <div className="inline-state">
                Staff edits are submitted for Admin approval before changing the customer record.
              </div>
            )}

            <div className="stack-list compact-list">
              <div className="section-header compact-header">
                <h3>Edit Requests</h3>
                <span className="count-chip">{customerEditRequests.length}</span>
              </div>

              {sortedEditRequests.length === 0 ? (
                <p className="muted-text">No edit requests for this customer.</p>
              ) : (
                sortedEditRequests.map((request) => (
                  <div key={request.id} className="stack-item">
                    <div className="stack-item-header">
                      <strong>{request.status}</strong>
                      <span>{new Date(request.createdAtUtc).toLocaleString()}</span>
                    </div>
                    <div className="compact-content">
                      Requested by {request.requestedByEmail}
                    </div>
                    <div className="muted-text compact-meta">
                      Requested name: {request.requestedName}
                    </div>
                    {request.adminDecisionByEmail && (
                      <div className="muted-text compact-meta">
                        Decision by {request.adminDecisionByEmail}
                        {request.adminDecisionNote ? ` · ${request.adminDecisionNote}` : ""}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <div className="section-header compact-header">
              <h2>Notes</h2>
              <span className="count-chip">{notes.length}</span>
            </div>

            <form className="customer-form compact-form" onSubmit={handleNoteSubmit}>
              <label>
                Note Content
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Enter note..."
                  rows={3}
                />
              </label>

              <div className="note-actions-row">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={noteForm.isPinned}
                    onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                  />
                  Pinned
                </label>

                <button type="submit">Add Note</button>
              </div>
            </form>

            <div className="stack-list compact-list">
              {sortedNotes.length === 0 ? (
                <p className="muted-text">No notes yet.</p>
              ) : (
                sortedNotes.map((note) => (
                  <div key={note.id} className={note.isPinned ? "stack-item pinned-item" : "stack-item"}>
                    <div className="stack-item-header">
                      <strong>{note.isPinned ? "Pinned Note" : "Note"}</strong>
                      <span>{new Date(note.createdAtUtc).toLocaleString()}</span>
                    </div>
                    <div className="compact-content">{note.content}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <div className="section-header compact-header">
              <h2>Audit Activity</h2>
              <span className="count-chip">{auditLogs.length}</span>
            </div>

            <div className="stack-list compact-list">
              {auditLogs.length === 0 ? (
                <p className="muted-text">No audit activity yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="stack-item audit-item">
                    <div className="stack-item-header">
                      <strong>{log.action}</strong>
                      <span>{new Date(log.createdAtUtc).toLocaleString()}</span>
                    </div>
                    <div className="compact-content">{log.details}</div>
                    <div className="muted-text compact-meta">
                      {log.entityType} · {log.performedBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      ) : (
        <section className="card">
          <h2>No Customer Selected</h2>
          <p>Select a customer from the list to view details, notes, audit activity, and edit requests.</p>
        </section>
      )}
    </div>
  );
}

export default App;
