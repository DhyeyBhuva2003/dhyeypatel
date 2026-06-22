"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaTrash, FaEdit, FaPlus, FaCode, FaRocket, FaServer, FaDatabase } from "react-icons/fa";

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  order: number;
}

interface ServiceFormInputs {
  title: string;
  description: string;
  icon: string;
  featuresText: string; // One feature per line
  price: string;
  order: number;
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "FaCode":
      return <FaCode className="w-5 h-5 text-purple-650" />;
    case "FaRocket":
      return <FaRocket className="w-5 h-5 text-purple-650" />;
    case "FaServer":
      return <FaServer className="w-5 h-5 text-purple-650" />;
    default:
      return <FaDatabase className="w-5 h-5 text-purple-650" />;
  }
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServiceFormInputs>();

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(data.data);
      } else {
        toast.error("Failed to load services");
      }
    } catch (err) {
      console.error("Fetch services error:", err);
      toast.error("Network error fetching services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    reset({
      title: "",
      description: "",
      icon: "FaCode",
      featuresText: "",
      price: "",
      order: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingId(service._id);
    reset({
      title: service.title,
      description: service.description,
      icon: service.icon,
      featuresText: service.features.join("\n"),
      price: service.price,
      order: service.order,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ServiceFormInputs) => {
    // Parse features text line by line
    const features = data.featuresText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      features,
      price: data.price,
      order: Number(data.order),
    };

    const url = editingId ? `/api/services/${editingId}` : "/api/services";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success(editingId ? "Service updated successfully" : "Service created successfully");
        setShowModal(false);
        fetchServices();
      } else {
        toast.error(resData.message || "Failed to save service");
      }
    } catch (err) {
      console.error("Save service error:", err);
      toast.error("Network error saving service.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service tier?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Service deleted.");
        setServices((prev) => prev.filter((s) => s._id !== id));
      } else {
        toast.error("Failed to delete service.");
      }
    } catch (err) {
      console.error("Delete service error:", err);
      toast.error("Network error deleting service.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-850">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Service Management
          </h1>
          <p className="text-sm text-zinc-500">
            Define structural capabilities, prices, and scope features.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm"
        >
          <FaPlus size={11} /> Add Service Tier
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></span>
          <span className="text-xs text-zinc-400">Syncing services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 text-zinc-450 text-sm">
          No services defined. Create one to populate your listings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center border border-purple-100 dark:border-purple-900/30">
                    {getIconComponent(service.icon)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-purple-600 hover:border-purple-500/20 transition text-xs"
                      title="Edit Service"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-650 hover:border-red-500/20 transition text-xs"
                      title="Delete Service"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    {service.title}
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Order: {service.order} | Price: {service.price}
                  </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                <ul className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="text-[10px] text-zinc-450 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {editingId ? "Modify Service Tier" : "Create Service Tier"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Service Title</label>
                <input
                  type="text"
                  placeholder="Full-Stack Web Development"
                  {...register("title", { required: "Title is required" })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Description</label>
                <textarea
                  rows={3}
                  placeholder="End-to-end custom application development..."
                  {...register("description", { required: "Description is required" })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Display Icon</label>
                  <select
                    {...register("icon", { required: "Icon is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  >
                    <option value="FaCode">Code Editor (FaCode)</option>
                    <option value="FaRocket">Rocket Start (FaRocket)</option>
                    <option value="FaServer">Server Stack (FaServer)</option>
                    <option value="FaDatabase">Database Storage (FaDatabase)</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Pricing Text</label>
                  <input
                    type="text"
                    placeholder="$1,500+"
                    {...register("price", { required: "Price is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Sort Order</label>
                  <input
                    type="number"
                    defaultValue={0}
                    {...register("order", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              {/* Features (one per line) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">
                  Scope Features (One item per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Next.js Frontend&#10;Node.js Backend API&#10;MongoDB Database Design"
                  {...register("featuresText")}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-950 transition text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
