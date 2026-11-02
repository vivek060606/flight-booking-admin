import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { RefreshCw, RotateCcw, Search } from "lucide-react";

export default function Reconciliation() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments/reconciliation");
      const data = response.data.data;

      setBookings(
        Array.isArray(data) ? data : data?.bookings || []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const performAction = async (booking, action) => {
    const actionKey = `${booking._id}-${action}`;

    try {
      setProcessing(actionKey);
      setError("");
      setMessage("");

      let response;

      if (action === "reconcile") {
        response = await api.post(
          `/payments/${booking._id}/reconcile-captured`
        );
      } else if (action === "refund") {
        if (
          !window.confirm(
            `Initiate a refund for booking ${booking.pnr}?`
          )
        ) return;

        response = await api.post(
          `/payments/${booking._id}/refund-captured`
        );
      } else if (action === "checkRefund") {
        response = await api.post(
          `/payments/${booking._id}/reconcile-refund`
        );
      }

      setMessage(response?.data?.message || "Action completed successfully");
      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Action failed. Please try again."
      );
    } finally {
      setProcessing("");
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    `${booking.pnr || ""} ${booking._id || ""} ${
      booking.razorpayPaymentId || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const statusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-400",
      paid: "bg-green-500/10 text-green-400",
      refunded: "bg-purple-500/10 text-purple-400",
      expired: "bg-red-500/10 text-red-400",
      cancelled: "bg-red-500/10 text-red-400",
      processed: "bg-green-500/10 text-green-400",
      failed: "bg-red-500/10 text-red-400",
    };

    return colors[status] || "bg-slate-700 text-slate-300";
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Payment Reconciliation
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage captured payments and refund reconciliation.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PNR, booking ID or payment ID..."
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4">PNR</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Booking</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Refund</th>
                <th className="p-4">Reconciliation</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No reconciliation records found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-semibold text-white">
                      {booking.pnr || "N/A"}
                    </td>

                    <td className="p-4">
                      ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus || "N/A"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus || "N/A"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusColor(booking.refundStatus)}`}>
                        {booking.refundStatus || "N/A"}
                      </span>
                    </td>

                    <td className="p-4">
                      {booking.paymentReconciliationRequired ? (
                        <span className="text-yellow-400">Required</span>
                      ) : (
                        <span className="text-green-400">Clear</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.paymentStatus === "paid" &&
                          booking.paymentReconciliationRequired && (
                            <button
                              disabled={!!processing}
                              onClick={() => performAction(booking, "reconcile")}
                              className="rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
                            >
                              {processing === `${booking._id}-reconcile`
                                ? "Processing..."
                                : "Reconcile"}
                            </button>
                          )}

                        {booking.paymentStatus === "paid" &&
                          ["expired", "cancelled"].includes(booking.bookingStatus) && (
                            <button
                              disabled={!!processing}
                              onClick={() => performAction(booking, "refund")}
                              className="rounded-md bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-500 disabled:opacity-50"
                            >
                              {processing === `${booking._id}-refund`
                                ? "Processing..."
                                : "Refund"}
                            </button>
                          )}

                        {booking.refundId &&
                          booking.refundStatus !== "processed" && (
                            <button
                              disabled={!!processing}
                              onClick={() => performAction(booking, "checkRefund")}
                              className="flex items-center gap-1 rounded-md bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600 disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              Check Refund
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
      </main>
    </div>
  );
}