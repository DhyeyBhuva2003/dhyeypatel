"use client";

import React, { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PenSquare, Plus, X, Eye, EyeOff, BookOpen, Clock, FileText } from "lucide-react";
import { Toaster } from "sonner";

import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/useBlogs";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import { Blog } from "@/types";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import FormCheckbox from "@/components/forms/FormCheckbox";
import FormMultiSelect from "@/components/forms/FormMultiSelect";
import FormImageUpload from "@/components/forms/FormImageUpload";
import FormMarkdownEditor from "@/components/forms/FormMarkdownEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import Portal from "@/components/ui/Portal";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Summary description is required").trim(),
  content: z.string().min(1, "Content body is required").trim(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  category: z.string().min(1, "Category is required").trim(),
  published: z.boolean(),
  readTime: z.string().min(1, "Read time estimation is required").trim(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

export default function AdminBlogs() {
  const [search, setSearch] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "title",
    "category",
    "readTime",
    "published",
    "publishedAt",
    "actions",
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Hook integrations
  const { data: blogs = [], loading, error, refetch } = useBlogs(true, [isFormOpen]);

  const createMutation = useCreateBlog(() => {
    setIsFormOpen(false);
    refetch();
  });

  const updateMutation = useUpdateBlog(() => {
    setIsFormOpen(false);
    setEditingId(null);
    refetch();
  });

  const deleteMutation = useDeleteBlog(() => {
    refetch();
  });

  const formMethods = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
  });



  const handleOpenCreate = () => {
    setEditingId(null);
    formMethods.reset({
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      tags: [],
      category: "Engineering",
      published: false,
      readTime: "5 min read",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setEditingId(blog._id);
    formMethods.reset({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      imageUrl: blog.imageUrl || "",
      tags: blog.tags || [],
      category: blog.category,
      published: blog.published || false,
      readTime: blog.readTime,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    if (confirm(`Are you sure you want to delete blog: ${blog.title}?`)) {
      deleteMutation.mutate(blog._id);
    }
  };

  const handleFormSubmit = async (values: BlogFormData) => {
    const payload = {
      title: values.title,
      description: values.description,
      content: values.content,
      imageUrl: values.imageUrl || undefined,
      tags: values.tags,
      category: values.category,
      published: values.published,
      readTime: values.readTime,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

  const columns = useMemo<DataGridColumn<Blog>[]>(
    () => [
      {
        key: "title",
        label: "Article Title",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.title}
                className="w-10 h-7 rounded bg-zinc-100 dark:bg-zinc-800 object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-7 rounded bg-zinc-150 dark:bg-zinc-850 flex items-center justify-center border shrink-0">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <div className="flex flex-col leading-tight select-none">
              <span className="font-bold text-zinc-900 dark:text-white text-xs">{row.title}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 max-w-[200px] truncate">
                {row.slug}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (row) => (
          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-brand-primary text-[10px] font-bold">
            {row.category}
          </span>
        ),
      },
      {
        key: "readTime",
        label: "Read Time",
        render: (row) => (
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-450 dark:text-zinc-450">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{row.readTime}</span>
          </span>
        ),
      },
      {
        key: "published",
        label: "Status",
        render: (row) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              row.published
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {row.published ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        key: "publishedAt",
        label: "Published Date",
        render: (row) => (
          <span className="text-zinc-450 text-[11px] font-bold">
            {row.publishedAt ? formatDate(row.publishedAt) : "—"}
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
    [handleOpenEdit, handleDelete]
  );

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <PenSquare className="text-brand-primary w-7 h-7" />
            <span>Technical Blogs</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Write guides, write case analyses, verify reading metrics, and publish drafts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-brand-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Article</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataGridToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search blogs by title or category..."
        columns={columns}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        data={filteredBlogs}
        exportFilename="blogs_export"
      />

      {/* Grid List */}
      <DataGrid
        columns={columns}
        data={filteredBlogs}
        loading={loading}
        error={error}
        emptyMessage="No articles matching query found."
        visibleKeys={visibleKeys}
      />

      {/* COMPOSE/EDIT MODAL DRAWER */}
      {/* CREATE/EDIT MODAL */}
      {isFormOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Overlay Click Target to Close */}
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-scaleUp z-10">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-25 select-none">
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-brand-primary" />
                  <span>{editingId ? "Modify Blog Article" : "Compose Blog Article"}</span>
                </h2>
                <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-none">
                  Write Guides, define category keywords, and edit metadata.
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

            {/* Scrollable Content */}
            <FormProvider {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                  
                  {/* Card Section: Article Specs */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-455 tracking-wider">1. Article Specification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FormInput name="title" label="Article Title" placeholder="Mastering State Mutations" required />
                      </div>
                      <FormInput name="category" label="Category" placeholder="Engineering / Web" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FormMultiSelect name="tags" label="Tags (Type & press Enter)" />
                      </div>
                      <FormInput name="readTime" label="Estimated Read Time" placeholder="6 min read" required />
                    </div>
                    <FormImageUpload name="imageUrl" label="Cover Banner Image" folder="blogs" />
                  </div>

                  {/* Card Section: Pitch Description Summary */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-455 dark:text-zinc-455 tracking-wider">2. Elevator Pitch Summary</h3>
                    <FormTextarea 
                      name="description" 
                      label="Short summary pitch" 
                      placeholder="Enter a brief description summarizing this article for main previews..." 
                      required 
                      showCounter={true}
                      maxCharacters={200}
                      autoResize={true}
                    />
                  </div>

                  {/* Card Section: Rich Content Editor */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-455 dark:text-zinc-455 tracking-wider">3. Article Rich Content</h3>
                    <FormMarkdownEditor 
                      name="content" 
                      label="Article Body Content" 
                      placeholder="# Article Title\nWrite content details here..." 
                      rows={14}
                    />
                  </div>

                  {/* Card Section: Lifecycle */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-455 dark:text-zinc-455 tracking-wider">4. Publishing Options</h3>
                    <FormCheckbox name="published" label="Publish immediately" description="Makes the article active and public on save" />
                  </div>

                </div>

                {/* Sticky Footer */}
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
                      "Save Article"
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
