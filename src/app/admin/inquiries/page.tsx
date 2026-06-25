"use client";

import React, { useState, useMemo } from "react";
import { 
  Inbox, 
  Mail, 
  Trash2, 
  Calendar, 
  LayoutGrid, 
  List, 
  Paperclip, 
  Download, 
  Eye, 
  X, 
  ExternalLink, 
  FileText 
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Inquiry } from "@/types";

import { 
  useInquiries, 
  useUpdateInquiryStatus, 
  useDeleteInquiry,
  useDeleteInquiryAttachment
} from "@/hooks/useInquiries";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import { formatDate } from "@/lib/utils";
import Portal from "@/components/ui/Portal";

export default function AdminInquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("timeline");
  
  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "name",
    "email",
    "subject",
    "attachment",
    "createdAt",
    "status",
    "actions",
  ]);

  // Hook integrations
  const { data: inquiries = [], loading, error, refetch } = useInquiries();
  const updateStatusMutation = useUpdateInquiryStatus(() => refetch());
  const deleteMutation = useDeleteInquiry(() => refetch());
  const deleteAttachmentMutation = useDeleteInquiryAttachment(() => {
    refetch();
    // Keep modal in sync
    setSelectedInquiry((prev) => 
      prev 
        ? { 
            ...prev, 
            attachmentUrl: "", 
            attachmentName: "", 
            attachmentSize: 0, 
            attachmentPublicId: "" 
          } 
        : null
    );
    toast.success("Attachment deleted successfully!");
  });

  const handleStatusChange = async (id: string, newStatus: "PENDING" | "CONTACTED" | "RESOLVED") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (inq: Inquiry) => {
    if (confirm(`Are you sure you want to delete inquiry from ${inq.name}?`)) {
      deleteMutation.mutate(inq._id);
      if (selectedInquiry?._id === inq._id) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleDeleteAttachment = (inq: Inquiry) => {
    if (confirm(`Are you sure you want to delete the attachment "${inq.attachmentName}"?`)) {
      deleteAttachmentMutation.mutate(inq._id);
    }
  };

  const handleOpenDetails = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setIsPreviewExpanded(false);
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
        render: (row) => (
          <button 
            onClick={() => handleOpenDetails(row)}
            className="font-bold text-zinc-900 dark:text-white hover:underline text-left cursor-pointer"
          >
            {row.name}
          </button>
        ),
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
        key: "attachment",
        label: "Attachment",
        render: (row) => (
          row.attachmentUrl ? (
            <button
              onClick={() => handleOpenDetails(row)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-750 cursor-pointer"
            >
              <Paperclip className="w-3 h-3 text-purple-550" />
              <span className="truncate max-w-[80px]">{row.attachmentName}</span>
            </button>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-650 text-[10px] font-semibold">None</span>
          )
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
        render: (row) => (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => handleOpenDetails(row)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <DataGridRowActions onDelete={() => handleDelete(row)} />
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const getFilePreviewType = (fileName?: string) => {
    if (!fileName) return "none";
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) return "image";
    if (ext === "pdf") return "pdf";
    return "unsupported";
  };

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
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-855 text-zinc-450 text-xs font-semibold">
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
                  <button
                    onClick={() => handleOpenDetails(inq)}
                    className="font-extrabold text-zinc-900 dark:text-white text-base hover:underline text-left cursor-pointer"
                  >
                    {inq.name}
                  </button>
                  <a
                    href={`mailto:${inq.email}`}
                    className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{inq.email}</span>
                  </a>

                  {inq.attachmentUrl && (
                    <button
                      onClick={() => handleOpenDetails(inq)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-[9px] font-black text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30 hover:scale-[1.02] cursor-pointer"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{inq.attachmentName}</span>
                    </button>
                  )}
                </div>
                
                {inq.subject && (
                  <div className="text-xs font-black text-zinc-800 dark:text-zinc-250 tracking-tight">
                    Subject: {inq.subject}
                  </div>
                )}
                
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap select-text line-clamp-4">
                  {inq.message}
                </p>

                <div className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Received {formatDate(inq.createdAt)}</span>
                </div>
              </div>

              {/* Status Select and Actions */}
              <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-850 shrink-0">
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

                <div className="flex md:flex-col gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenDetails(inq)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-550 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDelete(inq)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-550 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-650 hover:border-red-500/25 transition cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedInquiry && (
        <Portal>
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Overlay Close Click */}
            <div className="absolute inset-0" onClick={() => setSelectedInquiry(null)} />

            <div className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between animate-slideInRight z-10">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-20">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Inbound Client Lead Profile
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 mt-0.5 leading-none">
                    Review lead message details, attachment previews, and status classifications.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin select-text">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Client Name</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{selectedInquiry.name}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Email Address</span>
                    <a 
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-sm font-bold text-brand-primary hover:underline break-all"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Submission Date</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatDate(selectedInquiry.createdAt)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Inquiry Status</span>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value as "PENDING" | "CONTACTED" | "RESOLVED")}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold focus:outline-none cursor-pointer mt-1 ${
                        selectedInquiry.status === "PENDING"
                          ? "bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400"
                          : selectedInquiry.status === "CONTACTED"
                          ? "bg-blue-50 border-blue-250 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400"
                          : "bg-green-50 border-green-250 text-green-700 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400"
                      }`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Subject and Message */}
                <div className="p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Subject</span>
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-250 leading-tight block">
                      {selectedInquiry.subject || "(No Subject)"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Message Content</span>
                    <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </div>

                {/* Uploaded attachment section */}
                {selectedInquiry.attachmentUrl ? (
                  <div className="p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 overflow-hidden">
                        <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Uploaded Document Attachment</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <FileText className="w-5 h-5 text-purple-650 shrink-0" />
                          <div className="overflow-hidden leading-none">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate block">
                              {selectedInquiry.attachmentName}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-400 mt-1 block">
                              {(Number(selectedInquiry.attachmentSize || 0) / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attachment controls */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {getFilePreviewType(selectedInquiry.attachmentName) !== "unsupported" && (
                          <button
                            onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-350 cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{isPreviewExpanded ? "Hide Preview" : "Preview"}</span>
                          </button>
                        )}
                        <a
                          href={selectedInquiry.attachmentUrl}
                          download={selectedInquiry.attachmentName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-350 cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-450" />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(selectedInquiry)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200/50 hover:bg-red-500/10 text-xs font-bold text-red-650 hover:border-red-500/20 cursor-pointer transition shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete file</span>
                        </button>
                      </div>
                    </div>

                    {/* Preview Area container */}
                    {isPreviewExpanded && (
                      <div className="mt-4 border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-bg-sub/30">
                        {getFilePreviewType(selectedInquiry.attachmentName) === "image" ? (
                          <div className="flex justify-center p-4 bg-zinc-950/5">
                            <img
                              src={selectedInquiry.attachmentUrl}
                              alt={selectedInquiry.attachmentName}
                              className="max-h-[350px] object-contain rounded-lg border border-zinc-200/60 dark:border-zinc-800 shadow"
                            />
                          </div>
                        ) : getFilePreviewType(selectedInquiry.attachmentName) === "pdf" ? (
                          <iframe
                            src={selectedInquiry.attachmentUrl}
                            title="PDF Document Preview"
                            className="w-full h-[450px]"
                          />
                        ) : (
                          <div className="p-8 text-center text-xs font-semibold text-zinc-450 dark:text-zinc-500">
                            Natively previewing this document extension is not supported in the browser. Please use the download option.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950/5 text-center text-xs font-semibold text-zinc-400">
                    No files or supporting documents attached to this inquiry.
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800 px-6 py-4 flex gap-3 justify-between z-20">
                <button
                  onClick={() => handleDelete(selectedInquiry)}
                  className="px-5 py-2.5 rounded-xl border border-red-200/40 text-xs font-bold text-red-650 hover:bg-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                >
                  Delete Inquiry
                </button>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
