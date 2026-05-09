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

function App() {
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

  function setStatus(message: string, type: "info" | "success" | "error" = "info") {
    setStatusMessage(message);
    setStatusType(type);
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

  async function loadCustomers() {
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
    loadCustomers();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (selectedCustomer) {
      setEditForm(customerToForm(selectedCustomer));
      loadCustomerNotes(selectedCustomer.id);
      loadAuditLogs(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

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
        headers: {
          "Content-Type": "application/json"
        },
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
        headers: {
          "Content-Type": "application/json"
        },
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
        headers: {
          "Content-Type": "application/json"
        },
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

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "All";

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>LocalCRM</h1>
        <p>Phase 3: backend-backed search, filtering, customer detail, notes, and audit activity</p>
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