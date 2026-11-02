import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CreditCard, LogOut, Plane } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { ReceiptText } from "lucide-react";
import { PlaneTakeoff } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-5">
      <div className="mb-10 flex items-center gap-3">
        <Plane className="text-blue-500" size={28} />
        <div>
          <h1 className="text-lg font-bold text-white">SkyAdmin</h1>
          <p className="text-xs text-slate-500">Flight Management</p>
        </div>
      </div>

      <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Main Menu
      </p>

      <nav className="space-y-2">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/reconciliation" className={linkClass}>
          <CreditCard size={19} />
          Reconciliation
        </NavLink>
        <NavLink to="/bookings" className={linkClass}>

  <ClipboardList size={19} />
  All Bookings
</NavLink>
<NavLink to="/payments" className={linkClass}>
  <ReceiptText size={19} />
  Payment History
</NavLink>
<NavLink to="/flights" className={linkClass}>
  <PlaneTakeoff size={19} />
  Flight Management
</NavLink>
      </nav>NavLink

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}