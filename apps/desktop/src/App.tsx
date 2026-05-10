import { FormEvent, useEffect, useState } from "react";
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
};

type StaffUserForm = {
  displayName: string;
  email: string;
  password: string;
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

const AUTH_STORAGE_KEY = "localcrm.currentUser";

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: "admin@localcrm.dev",
    password: "Admin123!"
  });
  const [loginLoading, setLoginLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(false);
  const [customerLoadError, setCustomerLoadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [totalCustomerCount, setTotalCustomerCount] = useState(0);

  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);
  const [editForm, setEditForm] = useState<CustomerForm>(emptyCustomerForm);

  const [noteForm, setNoteForm] = useState({
    content: "",
    isPinned: false
  });

  const [staffUserForm, setStaffUserForm] = useState<StaffUserForm>(emptyStaffUserForm);

  const isAdmin = currentUser?.role === "Admin";

  function setStatus(message: string, type: "info" | "success" | "error" = "info") {
    setStatusMessage(message);
    setStatusType(type);
  }

  function getUserHeaders() {
    return {
      "Content-Type": "application/json",
      "X-LocalCRM-User": currentUser?.email ?? "system"
    };
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

  function saveCurrentUser(user: AuthUser) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser;

      if (parsedUser?.id && parsedUser?.email && parsedUser?.role && parsedUser?.isActive) {
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
    setSearchTerm("");
    setStatusFilter("All");
    setStaffUserForm(emptyStaffUserForm);
    setStatus("Signed out.", "info");
  }

  async function loadCustomers() {
    if (!currentUser) {
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

      const response = await fetch(url);
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
      setCustomerLoadError("Failed to load customers. Check that the backend API is running.");
      setStatus("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerNotes(customerId: string) {
    try {
      const response = await fetch(`/customers/${customerId}/notes`);
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
    try {
      const response = await fetch(`/customers/${customerId}/audit`);
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

  useEffect(() => {
    if (currentUser) {
      loadCustomers();
    }
  }, [currentUser, searchTerm, statusFilter]);

  useEffect(() => {
    if (selectedCustomer) {
      setEditForm(customerToForm(selectedCustomer));
      loadCustomerNotes(selectedCustomer.id);
      loadAuditLogs(selectedCustomer.id);
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
        headers: getUserHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const createdCustomer = (await response.json()) as Customer;

      setForm(emptyCustomerForm);
      setSelectedCustomer(createdCustomer);
      setStatus(`Customer "${createdCustomer.name}" created successfully.`, "success");
      await loadCustomers();
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

    if (!isAdmin) {
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
        headers: getUserHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const updatedCustomer = (await response.json()) as Customer;

      setSelectedCustomer(updatedCustomer);
      setStatus(`Customer "${updatedCustomer.name}" updated successfully.`, "success");
      await loadCustomers();
      await loadAuditLogs(updatedCustomer.id);
    } catch (error) {
      console.error(error);
      setStatus("Failed to update customer. Check the API and try again.", "error");
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
        headers: getUserHeaders(),
        body: JSON.stringify({
          content,
          isPinned: noteForm.isPinned
        })
      });

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

  async function handleStaffUserSubmit(event: FormEvent) {
    event.preventDefault();

    if (!currentUser || !isAdmin) {
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
        headers: getUserHeaders(),
        body: JSON.stringify({
          displayName: staffUserForm.displayName.trim(),
          email: staffUserForm.email.trim(),
          password: staffUserForm.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const createdUser = (await response.json()) as AuthUser;

      setStaffUserForm(emptyStaffUserForm);
      setStatus(`Staff user "${createdUser.displayName}" created successfully.`, "success");
    } catch (error) {
      console.error(error);
      setStatus("Failed to create staff user. Backend route may not be wired yet.", "error");
    }
  }

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "All";

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
  });

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
                  placeholder="admin@localcrm.dev"
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
              Dev users: admin@localcrm.dev / Admin123! or staff@localcrm.dev / Staff123!
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
                      <td>{customer.name}</td>
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

      {isAdmin && (
        <section className="card">
          <div className="section-header compact-header">
            <h2>Create Staff User</h2>
            <span className="status-chip status-chip-active">Admin Only</span>
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

            {isAdmin ? (
              <form className="customer-form" onSubmit={handleCustomerUpdate}>
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

                <button type="submit">Save Customer</button>
              </form>
            ) : (
              <div className="inline-state">
                Staff users can create customers and view customer records. Customer edits require Admin access.
              </div>
            )}
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
          <p>Select a customer from the list to view details, notes, and audit activity.</p>
        </section>
      )}
    </div>
  );
}

export default App;