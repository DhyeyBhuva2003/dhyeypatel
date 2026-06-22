"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaTrash, FaEdit, FaPlus, FaImage, FaEye, FaEyeSlash } from "react-icons/fa";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Blog {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedAt?: string;
  readTime: string;
}

interface BlogFormInputs {
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  tagsText: string; // Comma separated
  category: string;
  published: boolean;
  readTime: string;
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // Toggle split preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogFormInputs>();

  const currentImageUrl = watch("imageUrl");
  const currentContent = watch("content") || "";

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs?all=true");
      const data = await res.json();
      if (res.ok && data.success) {
        setBlogs(data.data);
      } else {
        toast.error("Failed to load blog posts");
      }
    } catch (err) {
      console.error("Fetch blogs error:", err);
      toast.error("Network error fetching blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const closeModal = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setPreviewMode(false);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    reset({
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      tagsText: "",
      category: "Engineering",
      published: false,
      readTime: "4 min read",
    });
    setShowModal(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingId(blog._id);
    setPreviewMode(false);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    reset({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      imageUrl: blog.imageUrl || "",
      tagsText: blog.tags.join(", "),
      category: blog.category,
      published: blog.published,
      readTime: blog.readTime,
    });
    setShowModal(true);
  };

  // Handle local image selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and format
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Allowed file formats: jpg, jpeg, png, webp");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("File size exceeds the maximum limit of 5MB");
      return;
    }

    setSelectedFile(file);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data: BlogFormInputs) => {
    setUploading(true);
    let finalImageUrl = data.imageUrl;

    // Upload selected file first if it exists
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "blogs");

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await res.json();
        if (res.ok && uploadData.success) {
          finalImageUrl = uploadData.data.url;
        } else {
          toast.error(uploadData.message || "Failed to upload cover.");
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error("Image upload request error:", err);
        toast.error("Network error during file upload.");
        setUploading(false);
        return;
      }
    }

    const tags = data.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: data.title,
      description: data.description,
      content: data.content,
      imageUrl: finalImageUrl || undefined,
      tags,
      category: data.category,
      published: data.published,
      readTime: data.readTime,
    };

    const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success(editingId ? "Article updated successfully" : "Article published successfully");
        closeModal();
        fetchBlogs();
      } else {
        toast.error(resData.message || "Failed to save article");
      }
    } catch (err) {
      console.error("Save blog error:", err);
      toast.error("Network error saving blog.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Blog post deleted successfully.");
        setBlogs((prev) => prev.filter((b) => b._id !== id));
      } else {
        toast.error("Failed to delete blog post.");
      }
    } catch (err) {
      console.error("Delete blog error:", err);
      toast.error("Network error deleting post.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-850">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Blog Post Management
          </h1>
          <p className="text-sm text-zinc-500">
            Write guides, view metrics, and manage live articles.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm"
        >
          <FaPlus size={11} /> Compose Article
        </button>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></span>
          <span className="text-xs text-zinc-400">Syncing blog directory...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 text-zinc-450 text-sm">
          No articles written yet. Click Compose to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-850 text-xs font-bold text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Read Time</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Publish Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-sm text-zinc-700 dark:text-zinc-350">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-zinc-55/50 dark:hover:bg-zinc-950/20 transition">
                  <td className="px-6 py-4 space-y-0.5 max-w-[280px]">
                    <div className="font-bold text-zinc-900 dark:text-white line-clamp-1">{blog.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono line-clamp-1">{blog.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 text-xs font-bold">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-xs">{blog.readTime}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      blog.published
                        ? "bg-green-105 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-450">
                    {blog.publishedAt ? formatDate(blog.publishedAt) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-purple-650 hover:border-purple-500/20 transition text-xs"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
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

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {editingId ? "Modify Blog Article" : "Compose Blog Article"}
              </h2>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition"
              >
                {previewMode ? (
                  <>
                    <FaEyeSlash /> <span>Hide Live Preview</span>
                  </>
                ) : (
                  <>
                    <FaEye /> <span>Show Live Preview</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Article Title</label>
                  <input
                    type="text"
                    placeholder="Mastering Next.js 16 APIs"
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Category</label>
                  <input
                    type="text"
                    placeholder="Engineering / DB"
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tags */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="nextjs, javascript, caching"
                    {...register("tagsText", { required: "At least one tag is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>

                {/* Read Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-550">Read Time Estimation</label>
                  <input
                    type="text"
                    placeholder="4 min read"
                    {...register("readTime", { required: "Read time is required" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core learnings of the post..."
                  {...register("description", { required: "Description is required" })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                ></textarea>
              </div>

              {/* Editor Workspace (Single Textarea or Side-by-Side Split Preview!) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-550">Article Body Content (Markdown supported)</label>
                <div className={`grid ${previewMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
                  {/* Left Side: Editor */}
                  <textarea
                    rows={12}
                    placeholder="# Article Heading&#10;In this article we will discuss..."
                    {...register("content", { required: "Content is required" })}
                    className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y"
                  ></textarea>

                  {/* Right Side: Rendered Preview (only shows in split mode) */}
                  {previewMode && (
                    <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/20 max-h-[300px] md:max-h-[290px] overflow-y-auto scrollbar-thin">
                      {currentContent ? (
                        <MarkdownRenderer content={currentContent} />
                      ) : (
                        <span className="text-xs text-zinc-400">Content preview will show up here as you type...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-555 block">Banner cover image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative border border-dashed border-zinc-250 dark:border-zinc-800 hover:border-purple-500 bg-zinc-50/50 dark:bg-zinc-950 rounded-2xl w-full sm:w-48 aspect-video flex flex-col items-center justify-center gap-2 overflow-hidden text-center cursor-pointer transition">
                    {localPreviewUrl || currentImageUrl ? (
                      <img src={localPreviewUrl || currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <FaImage className="text-zinc-400 w-6 h-6" />
                        <span className="text-[10px] text-zinc-450 font-semibold px-2">
                          Browse banner image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Image File</span>
                    <input type="hidden" {...register("imageUrl")} />
                    <input
                      type="text"
                      placeholder="Selected file will be uploaded on save"
                      value={selectedFile ? `Local: ${selectedFile.name}` : currentImageUrl || ""}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  {...register("published")}
                  className="w-4 h-4 rounded text-purple-600 border-zinc-300 focus:ring-purple-550"
                />
                <label htmlFor="published" className="text-xs font-bold text-zinc-650 dark:text-zinc-450">
                  Publish immediately (Transition from draft to active article)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-55/10 dark:hover:bg-zinc-950 transition text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 disabled:bg-purple-400 transition"
                >
                  {uploading ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
