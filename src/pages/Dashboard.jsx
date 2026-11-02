import { useEffect, useState } from "react";
import { CreditCard, Clock, RefreshCcw, ShieldCheck } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/payments/reconciliation");
        const data = response.data.data;
        setPayments(Array.isArray(data) ? data : data?.bookings || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load reconciliation data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const pendingCount = payments.filter(
    (p) => p.paymentStatus === "pending"
  ).length;

  const capturedCount = payments.filter(
    (p) => p.paymentStatus === "paid"
  ).length;

  const refundedCount = payments.filter(
    (p) => p.paymentStatus === "refunded"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <header className="mb-8">
          <p className="text-sm text-blue-400">Overview</p>
          <h1 className="mt-1 text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Monitor payments and booking reconciliation.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Reconciliation Records"
            value={loading ? "..." : payments.length}
            description="Records requiring attention"
            icon={CreditCard}
          />

          <StatCard
            title="Pending Payments"
            value={loading ? "..." : pendingCount}
            description="Payments awaiting confirmation"
            icon={Clock}
          />

          <StatCard
            title="Captured Payments"
            value={loading ? "..." : capturedCount}
            description="Payments successfully captured"
            icon={ShieldCheck}
          />

          <StatCard
            title="Refunded Payments"
            value={loading ? "..." : refundedCount}
            description="Payments marked as refunded"
            icon={RefreshCcw}
          />
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Payment Management
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Review captured payments, reconcile booking records, and manage
            refunds.
          </p>

          <button
            onClick={() => (window.location.href = "/reconciliation")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Open Reconciliation
          </button>
        </section>
      </main>
    </div>
  );
}