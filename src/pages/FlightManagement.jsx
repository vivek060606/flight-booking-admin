
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { Search, RefreshCw, Plus, Pencil, Ban, X } from "lucide-react";

const emptyForm = {
  flightNumber: "",
  airline: "",
  from: "",
  to: "",
  fromCode: "",
  toCode: "",
  departureTime: "",
  arrivalTime: "",
  duration: 60,
  stops: 0,
  price: 0,
  businessPrice: "",
  firstClassPrice: "",
  gate: "",
  terminalFrom: "",
  terminalTo: "",
  aircraft: "",
  totalSeats: 180,
  economySeats: 0,
businessSeats: 0,
firstClassSeats: 0,
};

const fields = [
  ["flightNumber", "Flight Number", "text"],
  ["airline", "Airline", "text"],
  ["from", "Departure City", "text"],
  ["to", "Arrival City", "text"],
  ["fromCode", "Departure Airport Code", "text"],
  ["toCode", "Arrival Airport Code", "text"],
  ["departureTime", "Departure Time", "datetime-local"],
  ["arrivalTime", "Arrival Time", "datetime-local"],
  ["duration", "Duration (minutes)", "number"],
  ["stops", "Number of Stops", "number"],
  ["price", "Economy Price (₹)", "number"],
  ["businessPrice", "Business Price (₹)", "number"],
  ["firstClassPrice", "First Class Price (₹)", "number"],
  ["totalSeats", "Total Seats", "number"],
  ["gate", "Gate", "text"],
  ["terminalFrom", "Departure Terminal", "text"],
  ["terminalTo", "Arrival Terminal", "text"],
  ["aircraft", "Aircraft", "text"],
];

const cabinFields = [
  ["economySeats", "Economy Seats"],
  ["businessSeats", "Business Seats"],
  ["firstClassSeats", "First Class Seats"],
];

const statusStyle = {
  scheduled: "text-blue-400 bg-blue-500/10",
  delayed: "text-yellow-400 bg-yellow-500/10",
  boarding: "text-purple-400 bg-purple-500/10",
  departed: "text-green-400 bg-green-500/10",
  arrived: "text-emerald-400 bg-emerald-500/10",
  cancelled: "text-red-400 bg-red-500/10",
};

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
};

export default function FlightManagement() {
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/flights/admin/all", {
        params: { page, limit: 10, search, status },
      });

      const data = response.data.data;
      setFlights(data.flights || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load flights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [page, search, status]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const openEditForm = (flight) => {
    setEditingId(flight._id);

    const values = { ...emptyForm, ...flight };
    values.departureTime = toLocalDateTime(flight.departureTime);
    values.arrivalTime = toLocalDateTime(flight.arrivalTime);

    setForm(values);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...form,
        flightNumber: form.flightNumber.trim().toUpperCase(),
        fromCode: form.fromCode.trim().toUpperCase(),
        toCode: form.toCode.trim().toUpperCase(),
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString(),
        duration: Number(form.duration),
        stops: Number(form.stops || 0),
        price: Number(form.price),
        businessPrice:
          form.businessPrice === "" ? undefined : Number(form.businessPrice),
        firstClassPrice:
          form.firstClassPrice === "" ? undefined : Number(form.firstClassPrice),
        totalSeats: Number(form.totalSeats),
      };

      if (editingId) {
        await api.patch(`/flights/${editingId}`, payload);
        setMessage("Flight updated successfully");
      } else {
        await api.post("/flights", payload);
        setMessage("Flight created successfully");
      }

      setShowForm(false);
      setEditingId(null);
      setPage(1);
      await fetchFlights();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save flight");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (flight) => {
    if (!window.confirm(`Cancel flight ${flight.flightNumber}?`)) return;

    try {
      setError("");
      setMessage("");
      await api.patch(`/flights/${flight._id}/cancel`);
      setMessage(`${flight.flightNumber} cancelled successfully`);
      await fetchFlights();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel flight");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Flight Management</h1>
            <p className="mt-2 text-sm text-slate-400">
              Create, update, search and manage flights.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchFlights}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-white hover:bg-slate-700"
            >
              <RefreshCw size={17} /> Refresh
            </button>

            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-500"
            >
              <Plus size={18} /> Add Flight
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-lg bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search flight, airline or airport..."
              className="w-full bg-transparent text-white outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="delayed">Delayed</option>
            <option value="boarding">Boarding</option>
            <option value="departed">Departed</option>
            <option value="arrived">Arrived</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4">Flight</th>
                <th className="p-4">Airline</th>
                <th className="p-4">Route</th>
                <th className="p-4">Departure</th>
                <th className="p-4">Arrival</th>
                <th className="p-4">Economy Fare</th>
                <th className="p-4">Seats</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    Loading flights...
                  </td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    No flights found.
                  </td>
                </tr>
              ) : (
                flights.map((flight) => (
                  <tr key={flight._id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-semibold text-white">
                      {flight.flightNumber}
                    </td>
                    <td className="p-4">{flight.airline}</td>
                    <td className="p-4">
                      {flight.fromCode} → {flight.toCode}
                    </td>
                    <td className="p-4">
                      {new Date(flight.departureTime).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {new Date(flight.arrivalTime).toLocaleString()}
                    </td>
                    <td className="p-4">
                      ₹{Number(flight.price).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">{flight.totalSeats}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusStyle[flight.status] || "bg-slate-700"}`}>
                        {flight.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(flight)}
                          className="rounded-md bg-blue-600/20 p-2 text-blue-400 hover:bg-blue-600/40"
                          title="Edit flight"
                        >
                          <Pencil size={16} />
                        </button>

                        {flight.status !== "cancelled" &&
                          !["departed", "arrived"].includes(flight.status) && (
                            <button
                              onClick={() => handleCancel(flight)}
                              className="rounded-md bg-red-600/20 p-2 text-red-400 hover:bg-red-600/40"
                              title="Cancel flight"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form
              onSubmit={handleSubmit}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? "Edit Flight" : "Add New Flight"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Enter flight information below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-slate-800 p-2 text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map(([name, label, type]) => (
                  <label key={name} className="text-sm text-slate-400">
                    {label}
                    <input
                      name={name}
                      type={type}
                      value={form[name] ?? ""}
                      onChange={handleChange}
                      required={[
                        "flightNumber", "airline", "from", "to",
                        "fromCode", "toCode", "departureTime",
                        "arrivalTime", "duration", "price", "totalSeats"
                      ].includes(name)}
                      min={type === "number" ? 0 : undefined}
                      step={type === "number" ? "any" : undefined}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-500"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-slate-800 px-5 py-3 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Flight"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
