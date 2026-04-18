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

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");

  const [form, setForm] = useState({
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
  });

  const [noteForm, setNoteForm] = useState({
    content: "",
    isPinned: false
  });

  async function loadCustomers() {
    setLoading(true);
    setStatusMessage("Loading customers...");

    try {
      const response = await fetch("/customers");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Customer[];
      setCustomers(data);
      setStatusMessage(`Loaded ${data.length} customers`);

      if (data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data[0]);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to load customers");
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
      setStatusMessage("Failed to load notes");
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
    setStatusMessage("Failed to load audit log");
  }
}

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerNotes(selectedCustomer.id);
      loadAuditLogs(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      setStatusMessage("Customer name is required");
      return;
    }

    setStatusMessage("Creating customer...");

    try {
      const response = await fetch("/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const createdCustomer = (await response.json()) as Customer;

      setForm({
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
      });

      setSelectedCustomer(createdCustomer);
      setStatusMessage("Customer created successfully");
      await loadCustomers();
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to create customer");
    }
  }

  async function handleNoteSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedCustomer) {
      setStatusMessage("Select a customer first");
      return;
    }

    if (!noteForm.content.trim()) {
      setStatusMessage("Note content is required");
      return;
    }

    setStatusMessage("Creating note...");

    try {
      const response = await fetch(`/customers/${selectedCustomer.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(noteForm)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNoteForm({
        content: "",
        isPinned: false
      });

      setStatusMessage("Note created successfully");
      await loadCustomerNotes(selectedCustomer.id);
      await loadAuditLogs(selectedCustomer.id);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to create note");
    }
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>LocalCRM</h1>
        <p>Phase 2: customer detail, notes, and audit activity</p>
      </header>

      <div className="status-banner">{statusMessage}</div>

      <main className="layout-grid">
        <section className="card">
          <div className="section-header">
            <h2>Customers</h2>
            <button type="button" onClick={loadCustomers} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

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
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No customers found</td>
                  </tr>
                ) : (
                  customers.map((customer) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Add Customer</h2>

          <form className="customer-form" onSubmit={handleSubmit}>
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

            <button type="submit">Create Customer</button>
          </form>
        </section>
      </main>

      {selectedCustomer && (
        <section className="detail-grid">
          <section className="card">
            <h2>Customer Detail</h2>
            <div className="detail-list">
              <div><strong>Name:</strong> {selectedCustomer.name}</div>
              <div><strong>Type:</strong> {selectedCustomer.type}</div>
              <div><strong>Email:</strong> {selectedCustomer.email || "—"}</div>
              <div><strong>Phone:</strong> {selectedCustomer.phone || "—"}</div>
              <div><strong>Status:</strong> {selectedCustomer.status}</div>
              <div><strong>City:</strong> {selectedCustomer.city || "—"}</div>
              <div><strong>State:</strong> {selectedCustomer.state || "—"}</div>
            </div>
          </section>

          <section className="card">
            <h2>Notes</h2>

            <form className="customer-form" onSubmit={handleNoteSubmit}>
              <label>
                Note Content
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Enter note..."
                  rows={4}
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={noteForm.isPinned}
                  onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                />
                Pinned
              </label>

              <button type="submit">Add Note</button>
            </form>

            <div className="stack-list">
              {notes.length === 0 ? (
                <p>No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="stack-item">
                    <div className="stack-item-header">
                      <strong>{note.isPinned ? "📌 Pinned" : "Note"}</strong>
                      <span>{new Date(note.createdAtUtc).toLocaleString()}</span>
                    </div>
                    <div>{note.content}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <h2>Audit Activity</h2>

            <div className="stack-list">
              {auditLogs.length === 0 ? (
                <p>No audit activity yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="stack-item">
                    <div className="stack-item-header">
                      <strong>{log.action}</strong>
                      <span>{new Date(log.createdAtUtc).toLocaleString()}</span>
                    </div>
                    <div>{log.details}</div>
                    <div className="muted-text">
                      {log.entityType} · {log.performedBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

export default App;