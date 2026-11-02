export default function BookingDetails({ booking, onClose }) {
  if (!booking) return null;

  const Section = ({ title, children }) => (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 font-semibold text-blue-400">{title}</h3>
      {children}
    </section>
  );

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm text-white">
        {value ?? "N/A"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <p className="mt-1 text-sm text-slate-400">
              PNR: {booking.pnr}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Close ✕
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Section title="Booking Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="PNR" value={booking.pnr} />
              <Field label="Booking ID" value={booking._id} />
              <Field label="Booking Status" value={booking.bookingStatus} />
              <Field label="Payment Status" value={booking.paymentStatus} />
              <Field label="Total Amount" value={`₹${booking.totalAmount ?? 0}`} />
              <Field
                label="Created At"
                value={booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}
              />
            </div>
          </Section>

          <Section title="Flight Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Airline" value={booking.flightId?.airline} />
              <Field label="Flight Number" value={booking.flightId?.flightNumber} />
              <Field label="Origin" value={`${booking.flightId?.from || ""} (${booking.flightId?.fromCode || ""})`} />
              <Field label="Destination" value={`${booking.flightId?.to || ""} (${booking.flightId?.toCode || ""})`} />
              <Field
                label="Departure"
                value={booking.flightId?.departureTime ? new Date(booking.flightId.departureTime).toLocaleString() : "N/A"}
              />
              <Field
                label="Arrival"
                value={booking.flightId?.arrivalTime ? new Date(booking.flightId.arrivalTime).toLocaleString() : "N/A"}
              />
            </div>
          </Section>

          <Section title="Payment Information">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Razorpay Order ID" value={booking.razorpayOrderId} />
              <Field label="Razorpay Payment ID" value={booking.razorpayPaymentId} />
              <Field label="Payment Status" value={booking.paymentStatus} />
              <Field label="Reconciliation Required" value={String(booking.paymentReconciliationRequired ?? false)} />
            </div>
          </Section>

          <Section title="Refund Information">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Refund ID" value={booking.refundId} />
              <Field label="Refund Status" value={booking.refundStatus} />
              <Field label="Refund Amount" value={booking.refundAmount != null ? `₹${booking.refundAmount}` : "N/A"} />
            </div>
          </Section>
        </div>

        <div className="mt-5">
          <Section title="Passenger Information">
            {Array.isArray(booking.passengers) && booking.passengers.length > 0 ? (
              <div className="space-y-4">
                {booking.passengers.map((passenger, index) => (
                  <div key={passenger._id || index} className="rounded-lg bg-slate-800 p-4">
                    <p className="mb-2 font-semibold text-white">
                      Passenger {index + 1}
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                      {JSON.stringify(passenger, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No passenger information available.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}