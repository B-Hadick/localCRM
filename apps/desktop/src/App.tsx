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

const API_BASE_URL = "";

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  async function loadCustomers() {
    setLoading(true);
    setStatusMessage("Loading customers...");

    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Customer[];
      setCustomers(data);
      setStatusMessage(`Loaded ${data.length} customers`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      setStatusMessage("Customer name is required");
      return;
    }

    setStatusMessage("Creating customer...");

    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

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

      setStatusMessage("Customer created successfully");
      await loadCustomers();
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to create customer");
    }
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>LocalCRM</h1>
        <p>Phase 1: database-backed customer management</p>
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
                    <tr key={customer.id}>
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
    </div>
  );
}

export default App;