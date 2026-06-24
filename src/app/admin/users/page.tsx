"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "sonner";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaInfoCircle,
  FaFileCsv,
  FaUsers,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import DataTable from "@/components/admin/DataTable";
import SearchBar from "@/components/admin/SearchBar";
import FilterDropdown from "@/components/admin/FilterDropdown";
import StatusBadge from "@/components/admin/StatusBadge";
import UserAvatar from "@/components/admin/UserAvatar";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Query Filter States
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal / Form toggle states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Active User states for CRUD operations
  const [activeUser, setActiveUser] = useState<any>(null);
  
  // Submit action loading states
  const [actionLoading, setActionLoading] = useState(false);

  // Form input states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    status: "ACTIVE",
  });

  // Fetch users list from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        role,
        status,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const resData = await res.json();

      if (res.ok && resData.success) {
        setUsers(resData.data.users);
        setTotalPages(resData.data.pagination.totalPages);
        setTotalUsers(resData.data.pagination.totalUsers);
      } else {
        toast.error(resData.message || "Failed to load users list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error.");
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    fetchUsers();
    setSelectedIds([]); // Clear selection when filters change
  }, [fetchUsers]);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Handle Role Filter Change
  const handleRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
  };

  // Handle Status Filter Change
  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  // Form Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
    });
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: any) => {
    setActiveUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Optional password edit
      role: user.role,
      status: user.status,
    });
    setIsEditOpen(true);
  };

  // Open Details Modal
  const handleOpenDetails = (user: any) => {
    setActiveUser(user);
    setIsDetailOpen(true);
  };

  // Open Single Delete Warning Modal
  const handleOpenDelete = (user: any) => {
    setActiveUser(user);
    setIsDeleteOpen(true);
  };

  // Submit: Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("User account created successfully!");
        setIsCreateOpen(false);
        fetchUsers();
      } else {
        toast.error(resData.message || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit: Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and email fields are required");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("User account details updated!");
        setIsEditOpen(false);
        fetchUsers();
      } else {
        toast.error(resData.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit: Delete User
  const handleDeleteConfirm = async () => {
    if (!activeUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser._id}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("User deleted successfully!");
        setIsDeleteOpen(false);
        fetchUsers();
      } else {
        toast.error(resData.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Checkbox row toggler
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Checkbox master header toggler
  const handleToggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u._id));
    }
  };

  // Execute Bulk Delete of selected rows
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const confirm = window.confirm(
      `Are you sure you want to delete the ${selectedIds.length} selected users? This action is permanent.`
    );
    if (!confirm) return;

    setActionLoading(true);
    let successCount = 0;
    let failMessage = "";

    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          failMessage = data.message || "Some deletions failed.";
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} user(s).`);
      }
      if (failMessage) {
        toast.error(failMessage);
      }
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete execution failure.");
    } finally {
      setActionLoading(false);
    }
  };

  // Export Users report to CSV file format
  const handleExportCSV = () => {
    try {
      const csvRows = [
        ["Name", "Email", "Role", "Status", "Created Date", "Last Login"],
        ...users.map((u) => [
          u.name,
          u.email,
          u.role,
          u.status,
          new Date(u.createdAt).toLocaleDateString(),
          u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never",
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvRows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "user_management_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV report exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV export.");
    }
  };

  const tableHeaders = [
    { key: "checkbox", label: "" },
    { key: "profile", label: "User" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "created", label: "Created Date" },
    { key: "login", label: "Last Login" },
    { key: "actions", label: "Actions", className: "text-right" },
  ];

  return (
    <div className="space-y-8 select-none">
      <Toaster position="top-right" richColors />

      {/* Header Portal details */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <FaUsers className="text-purple-600 w-7 h-7" />
            <span>User Accounts</span>
          </h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-0.5">
            Administer roles, status logs, logins, and register client access.
          </p>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
          >
            <FaFileCsv size={12} />
            <span>Export CSV</span>
          </button>

          {/* Create User button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/10 cursor-pointer"
          >
            <FaPlus size={10} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Filtering Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
        />

        <div className="flex flex-wrap items-center gap-4">
          <FilterDropdown
            label="Role"
            value={role}
            onChange={handleRoleChange}
            options={[
              { value: "ALL", label: "All Roles" },
              { value: "ADMIN", label: "Admin" },
              { value: "USER", label: "User" },
            ]}
          />

          <FilterDropdown
            label="Status"
            value={status}
            onChange={handleStatusChange}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "PENDING", label: "Pending" },
            ]}
          />
        </div>
      </div>

      {/* Bulk actions status panel */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/15 border border-purple-200/40 flex items-center justify-between text-xs animate-fadeIn font-semibold text-purple-750 dark:text-purple-400">
          <span>{selectedIds.length} user account(s) selected</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <FaTrashAlt size={10} />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* User Records Table */}
      <DataTable
        headers={tableHeaders}
        loading={loading}
        empty={users.length === 0}
        emptyMessage="No user accounts matched the filters."
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange: setPage,
        }}
      >
        {users.map((user) => {
          const isSelected = selectedIds.includes(user._id);
          return (
            <tr
              key={user._id}
              className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 transition-colors ${
                isSelected ? "bg-purple-50/10 dark:bg-purple-950/5" : ""
              }`}
            >
              {/* Row Checkbox */}
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelectRow(user._id)}
                  className="rounded border-zinc-300 dark:border-zinc-800 text-purple-600 focus:ring-purple-600 h-3.5 w-3.5 transition cursor-pointer"
                />
              </td>

              {/* User Avatar, Name and Email */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.profileImage?.secure_url}
                    size="sm"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-zinc-900 dark:text-white text-xs">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">
                      {user.email}
                    </span>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-4">
                <StatusBadge status={user.role} />
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <StatusBadge status={user.status} />
              </td>

              {/* Created Date */}
              <td className="px-6 py-4 text-xs font-semibold text-zinc-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>

              {/* Last Login */}
              <td className="px-6 py-4 text-xs font-semibold text-zinc-500">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "Never"}
              </td>

              {/* Actions row */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {/* View Details */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(user)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition cursor-pointer flex items-center justify-center"
                    title="View Account Details"
                  >
                    <FaInfoCircle size={12} />
                  </button>

                  {/* Edit User */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer flex items-center justify-center"
                    title="Edit User"
                  >
                    <FaEdit size={12} />
                  </button>

                  {/* Delete User */}
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(user)}
                    className="p-2 rounded-lg text-red-550 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer flex items-center justify-center"
                    title="Delete User"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {/* MODAL 1: Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-3xl shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Create New User Account
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 mt-2 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs transition disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer"
              >
                {actionLoading && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
                <span>{actionLoading ? "Creating..." : "Create User Account"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User Modal */}
      {isEditOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-3xl shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Edit User details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500">Password (leave blank to keep unchanged)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 mt-2 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs transition disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer"
              >
                {actionLoading && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
                <span>{actionLoading ? "Updating..." : "Save User Changes"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: User Details Modal */}
      {isDetailOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-3xl shadow-2xl p-6 space-y-6 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Account Details Preview
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <UserAvatar
                name={activeUser.name}
                imageUrl={activeUser.profileImage?.secure_url}
                size="xl"
              />
              <div className="space-y-1">
                <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                  {activeUser.name}
                </h4>
                <p className="text-xs text-zinc-450 font-semibold">{activeUser.email}</p>
              </div>
              <div className="flex gap-2.5">
                <StatusBadge status={activeUser.role} />
                <StatusBadge status={activeUser.status} />
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 space-y-3 text-xs leading-none">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-400">Account ID:</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[10px]">
                  {activeUser._id}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-400">Created Date:</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {new Date(activeUser.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-400">Last Login Stamp:</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {activeUser.lastLogin
                    ? new Date(activeUser.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="w-full py-3 rounded-xl border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-55/10 dark:hover:bg-zinc-950 transition cursor-pointer text-center"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Single Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to delete user ${
          activeUser ? activeUser.name : ""
        }? All associated metadata, settings, and authorization will be permanently removed.`}
        confirmText="Delete Account"
        loading={actionLoading}
      />
    </div>
  );
}
