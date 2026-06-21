"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaTrash, FaEdit, FaPlus, FaExternalLinkAlt, FaGithub, FaImage } from "react-icons/fa";

interface Project {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  imageUrl: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
}

interface ProjectFormInputs {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  tagsText: string; // Comma separated tags
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInputs>();

  const currentImageUrl = watch("imageUrl");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.data);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Network error fetching projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    reset({
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      tagsText: "",
      demoUrl: "",
      githubUrl: "",
      featured: false,
      order: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project._id);
    reset({
      title: project.title,
      description: project.description,
      content: project.content,
      imageUrl: project.imageUrl,
      tagsText: project.tags.join(", "),
      demoUrl: project.demoUrl || "",
      githubUrl: project.githubUrl || "",
      featured: project.featured,
      order: project.order,
    });
    setShowModal(true);
  };

  // Image Upload Trigger
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "projects");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setValue("imageUrl", data.data.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Image upload request error:", err);
      toast.error("Network error during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProjectFormInputs) => {
    // Parse tags text
    const tags = data.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: data.title,
      description: data.description,
      content: data.content,
      imageUrl: data.imageUrl,
      tags,
      demoUrl: data.demoUrl || undefined,
      githubUrl: data.githubUrl || undefined,
      featured: data.featured,
      order: Number(data.order),
    };

    const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success(editingId ? "Project updated successfully" : "Project created successfully");
        setShowModal(false);
        fetchProjects();
      } else {
        toast.error(resData.message || "Failed to save project");
      }
    } catch (err) {
      console.error("Save project error:", err);
      toast.error("Network error saving project.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Project deleted successfully.");
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error("Failed to delete project.");
      }
    } catch (err) {
      console.error("Delete project error:", err);
      toast.error("Network error deleting project.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-850">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Project Portfolio Management
          </h1>
          <p className="text-sm text-zinc-500">
            Create, edit, and organize featured projects for your public portfolio.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm"
        >
          <FaPlus size={11} /> Add New Project
        </button>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></span>
          <span className="text-xs text-zinc-400">Syncing portfolio items...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 text-zinc-450 text-sm">
          No projects registered. Create one to populate your portfolio.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-850 text-xs font-bold text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-sm text-zinc-700 dark:text-zinc-350">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-850">
                      <img src={project.imageUrl} alt={project.title} className="object-cover w-full h-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="font-bold text-zinc-900 dark:text-white">{project.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{project.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      project.featured
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {project.featured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold font-mono">{project.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-purple-650 hover:border-purple-500/20 transition text-xs"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-650 hover:border-red-500/20 transition text-xs"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {editingId ? "Modify Portfolio Project" : "Create Portfolio Project"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Project Title</label>
                  <input
                    type="text"
                    placeholder="SaaS Kanban Board"
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>

                {/* Tags (comma separated) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Next.js, Tailwind, MongoDB"
                    {...register("tagsText", { required: "At least one tag is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="A brief description that will display on the index cards..."
                  {...register("description", { required: "Description is required" })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                ></textarea>
              </div>

              {/* Markdown Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Detailed Markdown Details</label>
                <textarea
                  rows={6}
                  placeholder="## Project Overview&#10;Write descriptions and details in standard markdown..."
                  {...register("content", { required: "Content is required" })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                ></textarea>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-550 block">Project Cover Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Image Picker */}
                  <div className="relative border border-dashed border-zinc-250 dark:border-zinc-800 hover:border-purple-500 bg-zinc-50/50 dark:bg-zinc-950 rounded-2xl w-full sm:w-48 aspect-video flex flex-col items-center justify-center gap-2 overflow-hidden text-center cursor-pointer transition">
                    {currentImageUrl ? (
                      <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <FaImage className="text-zinc-400 w-6 h-6" />
                        <span className="text-[10px] text-zinc-450 font-semibold px-2">
                          {uploading ? "Uploading file..." : "Browse png, jpg, webp"}
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {/* URL fallback input */}
                  <div className="flex-1 w-full space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Image URL (set automatically)</span>
                    <input
                      type="text"
                      placeholder="https://cloudinary.com/..."
                      {...register("imageUrl", { required: "Cover image is required" })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Demo Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Demo URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    {...register("demoUrl")}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>

                {/* Github Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">GitHub URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    {...register("githubUrl")}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                {/* Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Sort Order</label>
                  <input
                    type="number"
                    defaultValue={0}
                    {...register("order", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register("featured")}
                    className="w-4 h-4 rounded text-purple-600 border-zinc-300 focus:ring-purple-550"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-55/10 dark:hover:bg-zinc-950 transition text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 disabled:bg-purple-400 transition"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
