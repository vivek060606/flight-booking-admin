import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { Search, RefreshCw } from "lucide-react";
import BookingDetails from "../components/BookingDetails";

export default function AllBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/admin/all", {
        params: { page, limit: 10, search },
      });

      const data = response.data.data;

      setBookings(data.bookings || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search]);

  const statusClass = (status) => {
    const colors = {
      confirmed: "text-green-400",
      pending: "text-yellow-400",
      cancelled: "text-red-400",
      expired: "text-red-400",
      paid: "text-green-400",
      refunded: "text-purple-400",
    };

    return colors[status] || "text-slate-300";
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">All Bookings</h1>
            <p className="mt-2 text-slate-400">
              View and search all customer bookings.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-500"
          >
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search booking by PNR..."
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {error && (
          <p className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4">PNR</th>
                <th className="p-4">Flight</th>
                <th className="p-4">Route</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Booking Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                 <tr
  key={booking._id}
 onClick={() => {
  alert("Booking clicked: " + booking.pnr);
  setSelectedBooking(booking);
}}
  className="cursor-pointer hover:bg-slate-800/70"
  title="Click to view booking details"
>
                    <td className="p-4 font-semibold text-white">
                      {booking.pnr}
                    </td>
                    <td className="p-4">
                      {booking.flightId?.airline || "N/A"}{" "}
                      {booking.flightId?.flightNumber || ""}
                    </td>
                    <td className="p-4">
                      {booking.flightId?.fromCode || "N/A"} →{" "}
                      {booking.flightId?.toCode || "N/A"}
                    </td>
                    <td className="p-4">
                      ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className={`p-4 ${statusClass(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </td>
                    <td className={`p-4 ${statusClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </td>
                    <td className="p-4">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between text-slate-400">
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
           {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      </main>
    </div>
  );
}