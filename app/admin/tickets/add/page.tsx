"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Poppins, Ubuntu } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { addLoader, removeLoader } from "../../../global_components/loader";
import { getPaymentMethods } from "../../../payment-methods";
import { TicketType, getTicketTypeName, isGroup } from "../../../ticket-types";
import { customAlert } from "../../custom-alert";
import styles from "../../dashboard.module.css"; // Reuse dashboard styles where applicable or create new

const title = Poppins({ weight: "700", subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

const GROUP_SIZE = 4;

export default function AddTicketPage() {
  const router = useRouter();
  const paymentMethods = getPaymentMethods();

  const [loading, setLoading] = useState(false);
  const [ticketType, setTicketType] = useState<TicketType>(
    TicketType.INDIVIDUAL,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods[0].identifier,
  );
  const [paymentIdentifier, setPaymentIdentifier] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Group Logic state
  const [sameDetails, setSameDetails] = useState(false);

  // Attendees State
  const [attendees, setAttendees] = useState([
    { name: "", email: "", phone: "" },
    { name: "", email: "", phone: "" },
    { name: "", email: "", phone: "" },
    { name: "", email: "", phone: "" },
  ]);

  const currentPaymentMethod = paymentMethods.find(
    (m) => m.identifier === selectedPaymentMethod,
  );
  const isGroupTicket = isGroup(ticketType);
  const attendeeCount = isGroupTicket ? GROUP_SIZE : 1;

  const handleAttendeeChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLoader();

    // Prepare payload
    let finalAttendees = [];
    if (isGroupTicket) {
      if (sameDetails) {
        // Replicate first attendee 4 times
        const base = attendees[0];
        finalAttendees = Array(4).fill(base);
      } else {
        finalAttendees = attendees;
      }
    } else {
      finalAttendees = [attendees[0]];
    }

    try {
      const response = await fetch("/api/admin/tickets/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: ticketType,
          paymentMethod: selectedPaymentMethod,
          paymentIdentifier: currentPaymentMethod?.field
            ? paymentIdentifier
            : undefined,
          isPaid,
          attendees: finalAttendees,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        customAlert("Tickets created successfully!");
        router.push("/admin");
      } else {
        customAlert(data.message || "Failed to create tickets.");
      }
    } catch (err) {
      console.error(err);
      customAlert("An unexpected error occurred.");
    } finally {
      setLoading(false);
      removeLoader();
    }
  };

  return (
    <section className={styles.dashboard} style={ubuntu.style}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Go Back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ ...title.style, fontWeight: 700, marginBottom: 0 }}>
          Add Custom Ticket
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mx-auto"
      >
        {/* Ticket Type */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Ticket Type</label>
          <select
            value={ticketType}
            onChange={(e) => {
              setTicketType(e.target.value as TicketType);
              // Reset same details toggle if switching types
              if (!isGroup(e.target.value as TicketType)) {
                setSameDetails(false);
              }
            }}
            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {Object.values(TicketType).map((type) => (
              <option key={type} value={type}>
                {getTicketTypeName(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Same Details Toggle for Groups */}
        {isGroupTicket && (
          <div className="mb-6 flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="sameDetails"
              checked={sameDetails}
              onChange={(e) => setSameDetails(e.target.checked)}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <label
              htmlFor="sameDetails"
              className="cursor-pointer select-none font-medium text-sm"
            >
              Use same name and email for all 4 group members?
            </label>
          </div>
        )}

        {/* Attendees Form */}
        <div className="space-y-6 mb-8">
          {Array.from({
            length: isGroupTicket && !sameDetails ? GROUP_SIZE : 1,
          }).map((_, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={index}
              className="p-4 border border-gray-200 rounded-xl relative"
            >
              {isGroupTicket && !sameDetails && (
                <span className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-gray-500">
                  Attendee #{index + 1}
                </span>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={attendees[index].name}
                    onChange={(e) =>
                      handleAttendeeChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={attendees[index].email}
                    onChange={(e) =>
                      handleAttendeeChange(index, "email", e.target.value)
                    }
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={attendees[index].phone}
                    onChange={(e) =>
                      handleAttendeeChange(index, "phone", e.target.value)
                    }
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Payment Section */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Payment Method</label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value as any);
              setPaymentIdentifier(""); // Reset identifier on change
            }}
            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black mb-4"
          >
            {paymentMethods.map((method) => (
              <option key={method.identifier} value={method.identifier}>
                {method.displayName}
              </option>
            ))}
          </select>

          {/* Dynamic Payment Field */}
          {currentPaymentMethod?.field && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <label className="block text-xs font-bold text-gray-500 mb-1">
                {currentPaymentMethod.field.label}
                {currentPaymentMethod.field.required && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="flex items-center">
                {currentPaymentMethod.field.prefix && (
                  <span className="bg-gray-200 px-3 py-2 rounded-l border border-r-0 border-gray-300 text-gray-600 text-sm">
                    {currentPaymentMethod.field.prefix}
                  </span>
                )}
                <input
                  type={
                    currentPaymentMethod.field.type === "alphanumeric"
                      ? "text"
                      : currentPaymentMethod.field.type
                  }
                  placeholder={currentPaymentMethod.field.placeholder}
                  required={currentPaymentMethod.field.required}
                  value={paymentIdentifier}
                  onChange={(e) => setPaymentIdentifier(e.target.value)}
                  className={`w-full p-2 border border-gray-300 focus:outline-none focus:border-black transition-colors ${currentPaymentMethod.field.prefix ? "rounded-r" : "rounded"}`}
                />
                {currentPaymentMethod.field.suffix && (
                  <span className="bg-gray-200 px-3 py-2 rounded-r border border-l-0 border-gray-300 text-gray-600 text-sm">
                    {currentPaymentMethod.field.suffix}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
            <div>
              <label
                htmlFor="isPaid"
                className="cursor-pointer select-none font-bold text-green-800"
              >
                Mark as Paid & Send Email
              </label>
              <p className="text-xs text-green-600 mt-1">
                This will generate UUIDs, send e-tickets immediately, and record
                the payment in analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" />}
          Create Ticket
        </button>
      </form>
    </section>
  );
}
