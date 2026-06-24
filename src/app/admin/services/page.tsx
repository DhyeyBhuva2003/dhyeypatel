"use client";

import React, { useState, useMemo } from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConciergeBell, Plus, X, Code, Rocket, Server, Database } from "lucide-react";
import { Toaster } from "sonner";

import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import { Service } from "@/types";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import FormSelect from "@/components/forms/FormSelect";
import Portal from "@/components/ui/Portal";

const serviceFormSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  icon: z.string().min(1, "Icon name is required"),
  price: z.string().min(1, "Price is required").trim(),
  order: z.coerce.number().default(0),
  featuresText: z.string().optional().or(z.literal("")),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

function getIcon(iconName: string) {
  switch (iconName) {
    case "FaCode":
    case "Code":
      return <Code className="w-4 h-4 text-brand-primary" />;
    case "FaRocket":
    case "Rocket":
      return <Rocket className="w-4 h-4 text-brand-primary" />;
    case "FaServer":
    case "Server":
      return <Server className="w-4 h-4 text-brand-primary" />;
    default:
      return <Database className="w-4 h-4 text-brand-primary" />;
  }
}

export default function AdminServices() {
  const [search, setSearch] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "title",
    "price",
    "order",
    "featuresCount",
    "actions",
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Hook integrations
  const { data: services = [], loading, error, refetch } = useServices([isFormOpen]);

  const createMutation = useCreateService(() => {
    setIsFormOpen(false);
    refetch();
  });

  const updateMutation = useUpdateService(() => {
    setIsFormOpen(false);
    setEditingId(null);
    refetch();
  });

  const deleteMutation = useDeleteService(() => {
    refetch();
  });

  const formMethods = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema) as unknown as Resolver<ServiceFormData>,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    formMethods.reset({
      title: "",
      description: "",
      icon: "Code",
      price: "",
      order: 0,
      featuresText: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingId(service._id);
    formMethods.reset({
      title: service.title,
      description: service.description,
      icon: service.icon || "Code",
      price: service.price ? String(service.price) : "",
      order: service.order || 0,
      featuresText: (service.features || []).join("\n"),
    });
    setIsFormOpen(true);
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Are you sure you want to delete service tier: ${service.title}?`)) {
      deleteMutation.mutate(service._id);
    }
  };

  const handleFormSubmit = async (values: ServiceFormData) => {
    const features = (values.featuresText || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: values.title,
      description: values.description,
      icon: values.icon,
      price: values.price,
      order: Number(values.order),
      features,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  }, [services, search]);

  const columns = useMemo<DataGridColumn<Service>[]>(
    () => [
      {
        key: "title",
        label: "Service tier",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
              {getIcon(row.icon)}
            </div>
            <div className="flex flex-col leading-tight select-none">
              <span className="font-bold text-zinc-900 dark:text-white text-xs">{row.title}</span>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-550 font-semibold mt-0.5 truncate max-w-[280px]">
                {row.description}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "price",
        label: "Pricing Rate",
        render: (row) => (
          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
            {row.price}
          </span>
        ),
      },
      {
        key: "order",
        label: "Sort Order",
        render: (row) => <span className="font-mono text-zinc-450 text-xs">{row.order || 0}</span>,
      },
      {
        key: "featuresCount",
        label: "Scope Features",
        render: (row) => (
          <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
            {(row.features || []).length} items defined
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        className: "text-right",
        render: (row) => (
          <DataGridRowActions onEdit={() => handleOpenEdit(row)} onDelete={() => handleDelete(row)} />
        ),
      },
    ],
    [handleDelete, handleOpenEdit]
  );

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ConciergeBell className="text-brand-primary w-7 h-7" />
            <span>Service Tiers</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Configure available package tiers, pricing estimates, and features deliverables.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-brand-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataGridToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search service tier name..."
        columns={columns}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        data={filteredServices}
        exportFilename="services_export"
      />

      {/* Grid Table */}
      <DataGrid
        columns={columns}
        data={filteredServices}
        loading={loading}
        error={error}
        emptyMessage="No freelance service tiers configured."
        visibleKeys={visibleKeys}
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
                  {editingId ? "Modify Service Package" : "Create Service Package"}
                </h3>
                <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-none">
                  Define service pricing deliverables and descriptions.
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
                  
                  {/* Card Section: Basic Info */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Basic Tier Specifications</h4>
                    <div className="space-y-4">
                      <FormInput name="title" label="Service Title" placeholder="Mobile Development" required />
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          name="icon"
                          label="Display Icon name"
                          placeholder="Code, Rocket, Server, FaCode..."
                          required
                        />
                        <FormInput name="price" label="Pricing Estimate" placeholder="Starting at $2,000" required />
                      </div>
                    </div>
                  </div>

                  {/* Card Section: Order priority */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Ranking Position</h4>
                    <FormInput name="order" type="number" label="Display Order priority" placeholder="0" />
                  </div>

                  {/* Card Section: Description */}
                  <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Pitch & deliverables</h4>
                    <div className="space-y-4">
                      <FormTextarea 
                        name="description" 
                        label="Elevator Description" 
                        placeholder="Explain value proposition..." 
                        required 
                        autoResize={true}
                      />
                      <FormTextarea 
                        name="featuresText" 
                        label="Scope Deliverables (one per line)" 
                        placeholder="iOS App Development&#10;App Store Deploy&#10;Push Notifications" 
                        rows={5}
                        autoResize={true}
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
                    disabled={createMutation.loading || updateMutation.loading}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-primary-hover transition cursor-pointer disabled:opacity-60 flex items-center justify-center min-w-[100px]"
                  >
                    {createMutation.loading || updateMutation.loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Save Service"
                    )}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
