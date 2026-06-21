"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { FaTrash, FaCheck, FaPhone, FaRegEnvelope, FaClock } from "react-icons/fa";
import { formatDate } from "@/lib/utils";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "PENDING" | "CONTACTED" | "RESOLVED";
  createdAt: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries(data.data);
      } else {
        toast.error("Failed to load inquiries: " + data.message);
      }
    } catch (err) {
      console.error("Fetch inquiries error:", err);
      toast.error("Network error loading inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update status
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Inquiry status updated to ${newStatus}`);
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus as any } : inq))
        );
      } else {
        toast.error("Failed to update status: " + data.message);
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Network error updating status.");
    }
  };

  // Delete inquiry
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Inquiry deleted successfully.");
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      } else {
        toast.error("Failed to delete inquiry: " + data.message);
      }
    } catch (err) {
      console.error("Delete inquiry error:", err);
      toast.error("Network error deleting inquiry.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Client Inquiries Box
          </h1>
          <p className="text-sm text-zinc-500">
            Review inbound freelance leads and client messages.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></span>
          <span className="text-xs text-zinc-400">Syncing inbox records...</span>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 text-zinc-450 text-sm">
          No inquiries registered in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq._id}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 flex flex-col md:flex-row justify-between gap-6 hover:shadow-sm transition"
            >
              {/* Message Details */}
              <div className="flex-1 space-y-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-zinc-900 dark:text-white text-base">
                    {inq.name}
                  </span>
                  <a
                    href={`mailto:${inq.email}`}
                    className="text-xs text-purple-650 hover:underline flex items-center gap-1 font-medium"
                  >
                    <FaRegEnvelope size={11} />
                    <span>{inq.email}</span>
                  </a>
                </div>
                
                {inq.subject && (
                  <div className="text-xs font-bold text-zinc-850 dark:text-zinc-200 tracking-tight">
                    Subject: {inq.subject}
                  </div>
                )}
                
                <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                  {inq.message}
                </p>

                <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 pt-1">
                  <FaClock />
                  <span>Received {formatDate(inq.createdAt)}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-850">
                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider md:text-right">
                    Lead Status
                  </label>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                      inq.status === "PENDING"
                        ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400"
                        : inq.status === "CONTACTED"
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400"
                        : "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400"
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(inq._id)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-550 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-650 hover:border-red-500/25 transition mt-auto"
                  title="Delete Inquiry"
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
