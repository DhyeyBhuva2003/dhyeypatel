"use client";

import React, { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, UserPlus, X, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { UserPayload } from "@/services/users";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import { User } from "@/types";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridPagination from "@/components/datagrid/DataGridPagination";
import DataGridBulkActions from "@/components/datagrid/DataGridBulkActions";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import FormPasswordInput from "@/components/forms/FormPasswordInput";
import UserAvatar from "@/components/admin/UserAvatar";
import StatusBadge from "@/components/admin/StatusBadge";
import Portal from "@/components/ui/Portal";

// Zod schemas for user validations
const createUserFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

const updateUserFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;
type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

export default function UserManagementPage() {
  // Query states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Modals toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Column Visibility Keys state
  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "user",
    "role",
    "status",
    "createdAt",
    "lastLogin",
    "actions",
  ]);

  // Hook integrations
  const {
    data: queryResult,
    loading,
    error,
    refetch,
  } = useUsers(
    {
      search,
      role: roleFilter,
      status: statusFilter,
      page,
      limit,
    },
    [page, limit, search, roleFilter, statusFilter]
  );

  const users = queryResult?.users || [];
  const pagination = queryResult?.pagination || { totalPages: 1, totalUsers: 0 };

  const createUserMutation = useCreateUser(() => {
    setIsFormOpen(false);
    refetch();
  });

  const updateUserMutation = useUpdateUser(() => {
    setIsFormOpen(false);
    setEditingUser(null);
    refetch();
  });

  const deleteUserMutation = useDeleteUser(() => {
    refetch();
  });

  // Setup Form Providers
  const formMethods = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(editingUser ? updateUserFormSchema : createUserFormSchema),
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    formMethods.reset({
      name: "",
      email: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    formMethods.reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status as "ACTIVE" | "INACTIVE" | "PENDING",
    });
    setIsFormOpen(true);
  };

  const handleOpenDetails = (user: User) => {
    setActiveUser(user);
    setIsDetailOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}? This action is permanent.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} selected users? This action is permanent.`
      )
    ) {
      let successCount = 0;
      for (const id of selectedIds) {
        const res = await deleteUserMutation.mutate(id);
        if (res) successCount++;
      }
      setSelectedIds([]);
      toast.success(`Successfully deleted ${successCount} user account(s).`);
      refetch();
    }
  };

  const handleFormSubmit = async (values: CreateUserFormData | UpdateUserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, data: values as UserPayload });
    } else {
      createUserMutation.mutate(values as UserPayload);
    }
  };

  // Define Columns
  const columns = useMemo<DataGridColumn<User>[]>(
    () => [
      {
        key: "user",
        label: "User",
        render: (row) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={row.name} imageUrl={row.profileImage?.secure_url} size="sm" />
            <div className="flex flex-col leading-tight select-none">
              <span className="font-bold text-zinc-900 dark:text-white text-xs">{row.name}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                {row.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        label: "Role",
        render: (row) => <StatusBadge status={row.role} />,
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdAt",
        label: "Joined",
        render: (row) => (
          <span className="text-zinc-450 text-[11px] font-bold">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "lastLogin",
        label: "Last Login",
        render: (row) => (
          <span className="text-zinc-450 text-[11px] font-bold">
            {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : "Never"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        className: "text-right",
        render: (row) => (
          <DataGridRowActions
            onView={() => handleOpenDetails(row)}
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDelete(row)}
          />
        ),
      },
    ],
    [handleOpenDetails, handleOpenEdit, handleDelete]
  );

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-brand-primary w-7 h-7" />
            <span>User Accounts</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Manage client profiles, administrative roles, login logs, and registration states.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-brand-primary/10 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataGridToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email..."
        columns={columns}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        data={users}
        exportFilename="users_list"
      >
        {/* Customized dropdown filters */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-350">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-350">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </DataGridToolbar>

      {/* Grid Shell */}
      <DataGrid
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        emptyMessage="No users matching current filters found in the directory."
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        visibleKeys={visibleKeys}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <DataGridPagination
          page={page}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalUsers}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* Floating Bulk Actions Panel */}
      <DataGridBulkActions
        selectedCount={selectedIds.length}
        actions={[
          {
            label: "Bulk Delete",
            onClick: handleBulkDelete,
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger",
          },
        ]}
      />

      {/* CREATE/EDIT DRAWER */}
      {isFormOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Overlay Click Target to Close */}
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between animate-slideInRight z-10">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-25">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {editingUser ? "Modify User Credentials" : "Create User Account"}
                </h3>
                <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-none">
                  {editingUser ? "Edit administrative permissions and credentials." : "Provision a new dashboard account."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <FormProvider {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
                  
                  {/* Card Section: General details */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">General Information</h4>
                    <div className="space-y-4">
                      <FormInput name="name" label="Name" placeholder="John Doe" required />
                      <FormInput name="email" label="Email Address" placeholder="john@example.com" required />
                    </div>
                  </div>

                  {/* Card Section: Security */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Security Credentials</h4>
                    <FormPasswordInput
                      name="password"
                      label={editingUser ? "Change Password (optional)" : "Password"}
                      placeholder="••••••••"
                      showStrength={!editingUser}
                      required={!editingUser}
                    />
                  </div>

                  {/* Card Section: Access & Status */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Permissions & Lifecycle</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect
                        name="role"
                        label="Access Level"
                        options={[
                          { value: "USER", label: "USER" },
                          { value: "ADMIN", label: "ADMIN" },
                        ]}
                      />
                      <FormSelect
                        name="status"
                        label="Account Status"
                        options={[
                          { value: "ACTIVE", label: "ACTIVE" },
                          { value: "INACTIVE", label: "INACTIVE" },
                          { value: "PENDING", label: "PENDING" },
                        ]}
                      />
                    </div>
                  </div>

                </div>

                {/* Sticky Drawer Footer */}
                <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800 px-6 py-4 flex gap-3 justify-end z-25">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-zinc-700 dark:text-zinc-350 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.loading || updateUserMutation.loading}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-primary-hover transition cursor-pointer disabled:opacity-60 flex items-center justify-center min-w-[100px]"
                  >
                    {createUserMutation.loading || updateUserMutation.loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : editingUser ? (
                      "Save Changes"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
        </Portal>
      )}

      {/* VIEW DETAILS DRAWER */}
      {isDetailOpen && activeUser && (
        <Portal>
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Overlay Click Target to Close */}
          <div className="absolute inset-0" onClick={() => setIsDetailOpen(false)} />

          <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between animate-slideInRight z-10">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-25">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  User Details Overview
                </h3>
                <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-none">
                  Detailed inspection of user administrative record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                <UserAvatar
                  name={activeUser.name}
                  imageUrl={activeUser.profileImage?.secure_url}
                  size="xl"
                />
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
                    {activeUser.name}
                  </h4>
                  <p className="text-xs font-bold text-zinc-450 dark:text-zinc-500">{activeUser.email}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <StatusBadge status={activeUser.role} />
                  <StatusBadge status={activeUser.status} />
                </div>
              </div>

              {/* Data Specifications Section */}
              <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">System Metadata</h4>
                <div className="space-y-3 text-xs leading-none">
                  <div className="flex justify-between font-semibold">
                    <span className="text-zinc-400">Account ID:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[10px] select-all">
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
                    <span className="text-zinc-400">Last Login:</span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {activeUser.lastLogin ? new Date(activeUser.lastLogin).toLocaleString() : "Never"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Sticky Footer */}
            <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800 px-6 py-4 flex gap-3 justify-end z-25">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="w-full py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer text-center"
              >
                Close Details Panel
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
