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

  const [noteForm, setNoteForm] = useState({
    content: "",
    isPinned: false
  });

  const [quoteForm, setQuoteForm] = useState<QuoteForm>(emptyQuoteForm);

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
      loadGlobalAuditLogs()
    ]);
  }

  useEffect(() => {
    if (currentUser) {
      loadCustomers();
      loadQuotes();
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
    quoteFilters.to
  ]);

  useEffect(() => {
    if (currentUser && isAdminOrOwner) {
      refreshAdminWorkflow();
    } else {
      setRequestQueue([]);
      setPendingRequestCustomerIds([]);
      setDashboardSummary(emptyDashboardSummary);
      setUsers([]);
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
    auditFilters.to
  ]);

  useEffect(() => {
    if (selectedCustomer) {
      setEditForm(customerToForm(selectedCustomer));
      loadCustomerNotes(selectedCustomer.id);
      loadAuditLogs(selectedCustomer.id);
      loadCustomerEditRequests(selectedCustomer.id);
      loadCustomerQuotes(selectedCustomer.id);
      setQuoteForm((current) => ({
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
                  </div>
                ))
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
