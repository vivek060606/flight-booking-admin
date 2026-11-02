import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reconciliation from "./pages/Reconciliation";
import Login from "./pages/Login";
import AllBookings from "./pages/AllBookings";
import PaymentHistory from "./pages/PaymentHistory";
import FlightManagement from "./pages/FlightManagement";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reconciliation"
          element={
            <ProtectedRoute>
              <Reconciliation />
            </ProtectedRoute>
          }
        />

        <Route
  path="/bookings"
  element={
    <ProtectedRoute>
      <AllBookings />
    </ProtectedRoute>
  }
/>
<Route
  path="/payments"
  element={
    <ProtectedRoute>
      <PaymentHistory />
    </ProtectedRoute>
  }
/>
<Route
  path="/flights"
  element={
    <ProtectedRoute>
      <FlightManagement />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;