"use client";

import React, { useState, useEffect } from "react";
import emailsService, { SubscriberPayload } from "@/services/emails";
import { toast } from "sonner";
import {
  RefreshCw,
  Plus,
  Search,
  Upload,
  UserPlus,
  Trash2,
  Tag as TagIcon,
  FolderOpen,
  Filter,
  Check,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function SubscribersManager() {
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

  // New Subscriber state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED" | "SPAM">("SUBSCRIBED");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // New Tag/Group state
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupSlug, setGroupSlug] = useState("");

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({
    email: -1,
    firstName: -1,
    lastName: -1,
    company: -1,
    phone: -1,
  });
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importTagIds, setImportTagIds] = useState<string[]>([]);
  const [importGroupIds, setImportGroupIds] = useState<string[]>([]);
  const [importStep, setImportStep] = useState<"UPLOAD" | "MAP" | "PREVIEW">("UPLOAD");
  const [importReport, setImportReport] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, tagsRes, groupsRes] = await Promise.all([
        emailsService.getSubscribers({
          search,
          status: statusFilter,
          tag: tagFilter,
          group: groupFilter,
        }),
        emailsService.getTags(),
        emailsService.getGroups(),
      ]);

      if (subsRes.success) setSubscribers(subsRes.data);
      if (tagsRes.success) setTags(tagsRes.data);
      if (groupsRes.success) setGroups(groupsRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, tagFilter, groupFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await emailsService.createSubscriber({
        email,
        firstName,
        lastName,
        company,
        phone,
        status,
        tags: selectedTags,
        groups: selectedGroups,
      });

      if (res.success) {
        toast.success("Subscriber added successfully");
        setShowAddModal(false);
        setEmail("");
        setFirstName("");
        setLastName("");
        setCompany("");
        setPhone("");
        setSelectedTags([]);
        setSelectedGroups([]);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add subscriber");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      const res = await emailsService.deleteSubscriber(id);
      if (res.success) {
        toast.success("Subscriber deleted successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subscriber");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await emailsService.createTag({
        name: tagName,
        slug: tagSlug.toLowerCase() || tagName.toLowerCase().replace(/\s+/g, "-"),
      });
      if (res.success) {
        toast.success("Tag created successfully");
        setTagName("");
        setTagSlug("");
        setShowTagModal(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create tag");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await emailsService.createGroup({
        name: groupName,
        slug: groupSlug.toLowerCase() || groupName.toLowerCase().replace(/\s+/g, "-"),
      });
      if (res.success) {
        toast.success("Subscriber group created successfully");
        setGroupName("");
        setGroupSlug("");
        setShowGroupModal(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    }
  };

  // CSV parser inside the wizard client
  const handleParseCsv = () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV text or enter data");
      return;
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) {
      toast.error("CSV must contain headers and at least one row");
      return;
    }

    // Process headers and rows
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) => {
      // Basic comma splitter, stripping quotes
      return line.split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
    });

    setCsvHeaders(headers);
    setCsvRows(rows);

    // Auto-detect mappings based on header text matches
    const newMapping = {
      email: headers.findIndex((h) => h.toLowerCase().includes("email") || h.toLowerCase().includes("mail")),
      firstName: headers.findIndex((h) => h.toLowerCase().includes("first") || h.toLowerCase().includes("name")),
      lastName: headers.findIndex((h) => h.toLowerCase().includes("last")),
      company: headers.findIndex((h) => h.toLowerCase().includes("company") || h.toLowerCase().includes("corp")),
      phone: headers.findIndex((h) => h.toLowerCase().includes("phone") || h.toLowerCase().includes("tel")),
    };

    setMapping(newMapping);
    setImportStep("MAP");
  };

  const handleGeneratePreview = () => {
    if (mapping.email === -1) {
      toast.error("You must map the Email column to import");
      return;
    }

    const preview = csvRows.map((row) => {
      const custom: Record<string, string> = {};
      csvHeaders.forEach((header, index) => {
        // Any column that isn't mapped to standard fields goes into customFields
        const isMapped = Object.values(mapping).includes(index);
        if (!isMapped && row[index]) {
          custom[header] = row[index];
        }
      });

      return {
        email: row[mapping.email] || "",
        firstName: mapping.firstName !== -1 ? row[mapping.firstName] || "" : "",
        lastName: mapping.lastName !== -1 ? row[mapping.lastName] || "" : "",
        company: mapping.company !== -1 ? row[mapping.company] || "" : "",
        phone: mapping.phone !== -1 ? row[mapping.phone] || "" : "",
        customFields: custom,
      };
    });

    setImportPreview(preview.filter((p) => p.email && p.email.includes("@")));
    setImportStep("PREVIEW");
  };

  const handleImportSubmit = async () => {
    setImporting(true);
    try {
      const res = await emailsService.importSubscribers({
        subscribers: importPreview,
        tagIds: importTagIds,
        groupIds: importGroupIds,
      });

      if (res.success) {
        setImportReport(res.data);
        toast.success("CSV Import completed!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Subscriber List</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Manage mailing lists, labels, and import contacts.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Create Tag</span>
          </button>

          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Create Group</span>
          </button>

          <button
            onClick={() => {
              setCsvText("");
              setImportReport(null);
              setImportStep("UPLOAD");
              setImportTagIds([]);
              setImportGroupIds([]);
              setShowImportWizard(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Grid */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm items-end">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Email, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SUBSCRIBED">Subscribed</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
            <option value="BOUNCED">Bounced</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Filter Tag</label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 hover:dark:bg-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Apply Filter</span>
        </button>
      </form>

      {/* 3. Subscribers Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Subscriber</th>
                <th className="p-4">Company</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Groups</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
              {loading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-primary mx-auto" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-400 font-semibold italic">
                    No subscribers found matching filters.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 font-medium">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {sub.firstName || sub.lastName ? `${sub.firstName} ${sub.lastName}`.trim() : "Unnamed contact"}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">{sub.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-500">{sub.company || "-"}</td>
                    <td className="p-4 text-zinc-500">{sub.phone || "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.tags?.map((t: any) => (
                          <span key={t._id} className="inline-block px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-semibold text-[10px] text-zinc-600 dark:text-zinc-400">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.groups?.map((g: any) => (
                          <span key={g._id} className="inline-block px-2 py-0.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded font-semibold text-[10px] text-indigo-650 dark:text-indigo-400">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        sub.status === "SUBSCRIBED"
                          ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
                          : sub.status === "UNSUBSCRIBED"
                          ? "bg-amber-500/10 text-amber-650 dark:text-amber-450"
                          : "bg-red-500/10 text-red-650 dark:text-red-400"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub._id)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-850">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider">Add Subscriber</h4>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Mailing List / Group</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {groups.map((g) => {
                    const active = selectedGroups.includes(g._id);
                    return (
                      <button
                        type="button"
                        key={g._id}
                        onClick={() =>
                          setSelectedGroups(
                            active ? selectedGroups.filter((id) => id !== g._id) : [...selectedGroups, g._id]
                          )
                        }
                        className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          active
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400"
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Labels / Tags</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((t) => {
                    const active = selectedTags.includes(t._id);
                    return (
                      <button
                        type="button"
                        key={t._id}
                        onClick={() =>
                          setSelectedTags(
                            active ? selectedTags.filter((id) => id !== t._id) : [...selectedTags, t._id]
                          )
                        }
                        className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          active
                            ? "bg-zinc-850 dark:bg-zinc-100 text-white dark:text-black border-zinc-850 dark:border-zinc-100"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Save subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-850">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider">Create Label Tag</h4>
              <button onClick={() => setShowTagModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTag} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lead, VIP"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Slug (Optional)</label>
                <input
                  type="text"
                  value={tagSlug}
                  onChange={(e) => setTagSlug(e.target.value)}
                  placeholder="e.g. vip-contacts"
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                />
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-850">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider">Create Segment Group</h4>
              <button onClick={() => setShowGroupModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Newsletter List, Customers"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Slug (Optional)</label>
                <input
                  type="text"
                  value={groupSlug}
                  onChange={(e) => setGroupSlug(e.target.value)}
                  placeholder="e.g. customer-segment"
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                />
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CSV Import Wizard */}
      {showImportWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-850 shrink-0">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-primary" />
                <span>Subscribers CSV Import Wizard</span>
              </h4>
              <button onClick={() => setShowImportWizard(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar-thin">
              {/* Steps indicators */}
              <div className="flex justify-around items-center border-b border-zinc-100 dark:border-zinc-850 pb-4 text-xs font-bold text-zinc-400">
                <span className={importStep === "UPLOAD" ? "text-brand-primary font-black" : ""}>1. Paste Data</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                <span className={importStep === "MAP" ? "text-brand-primary font-black" : ""}>2. Map Columns</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                <span className={importStep === "PREVIEW" ? "text-brand-primary font-black" : ""}>3. Preview & Run</span>
              </div>

              {importReport ? (
                /* Finished Import Summary Report */
                <div className="space-y-4 animate-scaleUp">
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500 text-emerald-650 dark:text-emerald-400 font-bold text-center">
                    Import Processed Successfully!
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="text-lg font-black text-zinc-900 dark:text-white">{importReport.imported}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">New Created</div>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="text-lg font-black text-zinc-900 dark:text-white">{importReport.updated}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">Merged / Updated</div>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="text-lg font-black text-zinc-900 dark:text-white">{importReport.failed}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">Errors</div>
                    </div>
                  </div>

                  {importReport.errors?.length > 0 && (
                    <div className="p-4 bg-red-500/5 border border-red-500/25 rounded-xl space-y-2">
                      <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Error Logs</div>
                      <ul className="text-xs list-disc list-inside text-red-650 dark:text-red-400 font-medium space-y-1">
                        {importReport.errors.slice(0, 10).map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                        {importReport.errors.length > 10 && <li>...and {importReport.errors.length - 10} more errors</li>}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowImportWizard(false)}
                      className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : importStep === "UPLOAD" ? (
                /* Step 1: Upload paste CSV */
                <div className="space-y-4 animate-scaleUp">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450">
                      Paste CSV contacts (including Header Row)
                    </label>
                    <textarea
                      placeholder='email,firstName,lastName,company,phone&#10;john@example.com,John,Doe,Acme Inc,+123456789&#10;alice@example.com,Alice,Smith,Corp,123'
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleParseCsv}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <span>Parse Data</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : importStep === "MAP" ? (
                /* Step 2: Mapping Columns */
                <div className="space-y-6 animate-scaleUp">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">Map headers to system attributes:</div>
                    <p className="text-[10px] text-zinc-400">Map the column indices of your parsed CSV spreadsheet correctly.</p>
                  </div>

                  <div className="space-y-3">
                    {Object.keys(mapping).map((field) => (
                      <div key={field} className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-350 capitalize">
                          {field === "email" ? "Email Address (Required)" : field}
                        </span>
                        <select
                          value={mapping[field]}
                          onChange={(e) => setMapping({ ...mapping, [field]: parseInt(e.target.value, 10) })}
                          className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none w-52 cursor-pointer"
                        >
                          <option value={-1}>-- Ignore column --</option>
                          {csvHeaders.map((header, idx) => (
                            <option key={idx} value={idx}>
                              Column {idx + 1}: {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    <button
                      onClick={() => setImportStep("UPLOAD")}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGeneratePreview}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <span>Preview Import</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 3: Preview list & tags/groups mapper */
                <div className="space-y-6 animate-scaleUp">
                  {/* Select Lists for imported users */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Assign to Group</label>
                      <div className="flex flex-wrap gap-1.5">
                        {groups.map((g) => {
                          const active = importGroupIds.includes(g._id);
                          return (
                            <button
                              type="button"
                              key={g._id}
                              onClick={() =>
                                setImportGroupIds(
                                  active ? importGroupIds.filter((id) => id !== g._id) : [...importGroupIds, g._id]
                                )
                              }
                              className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                active
                                  ? "bg-brand-primary text-white border-brand-primary"
                                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600"
                              }`}
                            >
                              {g.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Assign tags</label>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => {
                          const active = importTagIds.includes(t._id);
                          return (
                            <button
                              type="button"
                              key={t._id}
                              onClick={() =>
                                setImportTagIds(
                                  active ? importTagIds.filter((id) => id !== t._id) : [...importTagIds, t._id]
                                )
                              }
                              className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                active
                                  ? "bg-zinc-850 dark:bg-zinc-100 text-white dark:text-black border-zinc-850 dark:border-zinc-100"
                                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600"
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">
                      Confirm Import Preview ({importPreview.length} contacts found):
                    </div>
                    <div className="max-h-40 overflow-y-auto text-[10px] font-mono divide-y divide-zinc-200 dark:divide-zinc-800 custom-scrollbar-thin">
                      {importPreview.slice(0, 20).map((row, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between">
                          <span>
                            {row.firstName} {row.lastName} &lt;{row.email}&gt;
                          </span>
                          <span className="text-zinc-400">{row.company}</span>
                        </div>
                      ))}
                      {importPreview.length > 20 && <div className="py-2 italic text-zinc-450">...and {importPreview.length - 20} more contacts</div>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    <button
                      onClick={() => setImportStep("MAP")}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImportSubmit}
                      disabled={importing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Execute Import</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
