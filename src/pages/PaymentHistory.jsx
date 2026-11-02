import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { RefreshCw, Search } from "lucide-react";

export default function PaymentHistory() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/admin/all", {
        params: { limit: 100 },
      });

      setBookings(response.data.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = bookings.filter((b) =>
    `${b.pnr} ${b.razorpayPaymentId || ""} ${b.razorpayOrderId || ""} ${b.refundId || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const badge = (status) => {
    const styles = {
      paid: "text-green-400 bg-green-500/10",
      pending: "text-yellow-400 bg-yellow-500/10",
      refunded: "text-purple-400 bg-purple-500/10",
      failed: "text-red-400 bg-red-500/10",
      processed: "text-green-400 bg-green-500/10",
    };

    return `rounded-full px-3 py-1 text-xs ${styles[status] || "bg-slate-700 text-slate-300"}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Payment History</h1>
            <p className="mt-2 text-slate-400">
              Track payments, Razorpay orders and refunds.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-500"
          >
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PNR, payment ID, order ID or refund ID..."
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {error && (
          <p className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4">PNR</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Refund ID</th>
                <th className="p-4">Refund Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    Loading payment history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-semibold text-white">{b.pnr}</td>
                    <td className="p-4">
                      ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {b.razorpayOrderId || "—"}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {b.razorpayPaymentId || "—"}
                    </td>
                    <td className="p-4">
                      <span className={badge(b.paymentStatus)}>
                        {b.paymentStatus || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {b.refundId || "—"}
                    </td>
                    <td className="p-4">
                      <span className={badge(b.refundStatus)}>
                        {b.refundStatus || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {filtered.length} records from the latest 100 bookings.
        </p>
      </main>
    </div>
  );
}