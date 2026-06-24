"use client";

import React, { useState, useMemo } from "react";
import { Inbox, Mail, Trash2, Calendar, LayoutGrid, List } from "lucide-react";
import { Toaster } from "sonner";
import { Inquiry } from "@/types";

import { useInquiries, useUpdateInquiryStatus, useDeleteInquiry } from "@/hooks/useInquiries";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import { formatDate } from "@/lib/utils";

export default function AdminInquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("timeline");

  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "name",
    "email",
    "subject",
    "createdAt",
    "status",
    "actions",
  ]);

  // Hook integrations
  const { data: inquiries = [], loading, error, refetch } = useInquiries();
  const updateStatusMutation = useUpdateInquiryStatus(() => refetch());
  const deleteMutation = useDeleteInquiry(() => refetch());

  const handleStatusChange = async (id: string, newStatus: "PENDING" | "CONTACTED" | "RESOLVED") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (inq: Inquiry) => {
    if (confirm(`Are you sure you want to delete inquiry from ${inq.name}?`)) {
      deleteMutation.mutate(inq._id);
    }
  };

  // Filter local data
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.name.toLowerCase().includes(search.toLowerCase()) ||
        inq.email.toLowerCase().includes(search.toLowerCase()) ||
        (inq.subject && inq.subject.toLowerCase().includes(search.toLowerCase())) ||
        inq.message.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || inq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, search, statusFilter]);

  const columns = useMemo<DataGridColumn<Inquiry>[]>(
    () => [
      {
        key: "name",
        label: "Client Name",
        render: (row) => <span className="font-bold text-zinc-900 dark:text-white">{row.name}</span>,
      },
      {
        key: "email",
        label: "Email Address",
        render: (row) => (
          <a
            href={`mailto:${row.email}`}
            className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-bold"
          >
            <Mail className="w-3 h-3 text-zinc-400" />
            <span>{row.email}</span>
          </a>
        ),
      },
      {
        key: "subject",
        label: "Subject Title",
        render: (row) => (
          <div className="flex flex-col leading-tight max-w-[240px]">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{row.subject || "No Subject"}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-semibold truncate mt-0.5">
              {row.message}
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Received",
        render: (row) => (
          <span className="text-zinc-450 text-[11px] font-bold">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "status",
        label: "Lead Status",
        render: (row) => (
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row._id, e.target.value as "PENDING" | "CONTACTED" | "RESOLVED")}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold focus:outline-none cursor-pointer ${
              row.status === "PENDING"
                ? "bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400"
                : row.status === "CONTACTED"
                ? "bg-blue-50 border-blue-250 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400"
                : "bg-green-50 border-green-250 text-green-700 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400"
            }`}
          >
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        className: "text-right",
        render: (row) => <DataGridRowActions onDelete={() => handleDelete(row)} />,
      },
    ],
    [handleDelete, handleStatusChange]
  );

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="text-brand-primary w-7 h-7" />
            <span>Inbound Client Leads</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Review freelance requests, subject topics, status logs, and messages.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850">
          <button
            onClick={() => setViewMode("timeline")}
            className={`p-2 rounded-lg transition flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
              viewMode === "timeline"
                ? "bg-white dark:bg-zinc-900 text-brand-primary shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-350"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-900 text-brand-primary shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-350"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Table</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <DataGridToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search inbox message logs..."
        columns={columns}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        data={filteredInquiries}
        exportFilename="inquiries_export"
      >
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-350 shadow-sm">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Leads</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </DataGridToolbar>

      {/* Main Inbox View Toggle */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></span>
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Syncing lead registry...</span>
        </div>
      ) : error ? (
        <div className="p-12 text-center text-red-500 font-bold">{error}</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 text-zinc-450 text-xs font-semibold">
          No inquiries found matching selected filters.
        </div>
      ) : viewMode === "grid" ? (
        /* Data Grid Table View */
        <DataGrid
          columns={columns}
          data={filteredInquiries}
          loading={loading}
          error={error}
          visibleKeys={visibleKeys}
        />
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq._id}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition duration-200 animate-fadeIn"
            >
              {/* Message Details */}
              <div className="flex-1 space-y-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-zinc-900 dark:text-white text-base">
                    {inq.name}
                  </span>
                  <a
                    href={`mailto:${inq.email}`}
                    className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{inq.email}</span>
                  </a>
                </div>
                
                {inq.subject && (
                  <div className="text-xs font-black text-zinc-800 dark:text-zinc-250 tracking-tight">
                    Subject: {inq.subject}
                  </div>
                )}
                
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap select-text">
                  {inq.message}
                </p>

                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Received {formatDate(inq.createdAt)}</span>
                </div>
              </div>

              {/* Status Select and Actions */}
              <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-850">
                <div className="space-y-1">
                  <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider md:text-right">
                    Lead Status
                  </label>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq._id, e.target.value as "PENDING" | "CONTACTED" | "RESOLVED")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${
                      inq.status === "PENDING"
                        ? "bg-amber-50 border-amber-205 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400"
                        : inq.status === "CONTACTED"
                        ? "bg-blue-50 border-blue-205 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400"
                        : "bg-green-50 border-green-205 text-green-700 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400"
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDelete(inq)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-550 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-650 hover:border-red-500/25 transition mt-auto cursor-pointer"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
