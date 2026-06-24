"use client";

import React, { useState, useMemo } from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Folder, FolderPlus, X, Star, ExternalLink, Layers } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Toaster } from "sonner";

import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { ProjectPayload } from "@/services/projects";
import { DataGrid, DataGridColumn } from "@/components/datagrid/DataGrid";
import { Project } from "@/types";
import DataGridToolbar from "@/components/datagrid/DataGridToolbar";
import DataGridRowActions from "@/components/datagrid/DataGridRowActions";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import FormSelect from "@/components/forms/FormSelect";
import FormCheckbox from "@/components/forms/FormCheckbox";
import FormMultiSelect from "@/components/forms/FormMultiSelect";
import FormImageUpload from "@/components/forms/FormImageUpload";
import FormMarkdownEditor from "@/components/forms/FormMarkdownEditor";
import Portal from "@/components/ui/Portal";

// Form validation schema
const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Short summary is required").trim(),
  content: z.string().min(1, "Full content details are required").trim(),
  imageUrl: z.string().min(1, "Cover image banner is required").url("Must be a valid URL"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean(),
  order: z.coerce.number().default(0),
  category: z.string().optional().or(z.literal("")),
  shortDescription: z.string().optional().or(z.literal("")),
  fullDescription: z.string().optional().or(z.literal("")),
  projectType: z.string().optional().or(z.literal("")),
  clientName: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  status: z.enum(["Completed", "In Progress"]),
  technologies: z.array(z.string()),
  featuresText: z.string().optional().or(z.literal("")),
  challengesText: z.string().optional().or(z.literal("")),
  solutionsText: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function AdminProjects() {
  const [search, setSearch] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<string[]>([
    "project",
    "category",
    "status",
    "featured",
    "order",
    "actions",
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Hook integrations
  const { data: projects = [], loading, error, refetch } = useProjects([isFormOpen]);

  const createMutation = useCreateProject(() => {
    setIsFormOpen(false);
    refetch();
  });

  const updateMutation = useUpdateProject(() => {
    setIsFormOpen(false);
    setEditingId(null);
    refetch();
  });

  const deleteMutation = useDeleteProject(() => {
    refetch();
  });

  const formMethods = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema) as unknown as Resolver<ProjectFormData>,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    formMethods.reset({
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      tags: [],
      demoUrl: "",
      githubUrl: "",
      featured: false,
      order: 0,
      category: "Engineering",
      shortDescription: "",
      fullDescription: "",
      projectType: "Full-Stack",
      clientName: "",
      industry: "",
      duration: "",
      status: "Completed",
      technologies: [],
      featuresText: "",
      challengesText: "",
      solutionsText: "",
      metaTitle: "",
      metaDescription: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingId(project._id);
    formMethods.reset({
      title: project.title,
      description: project.description,
      content: project.content,
      imageUrl: project.imageUrl,
      tags: project.tags || [],
      demoUrl: project.demoUrl || "",
      githubUrl: project.githubUrl || "",
      featured: project.featured || false,
      order: project.order || 0,
      category: project.category || "",
      shortDescription: project.shortDescription || "",
      fullDescription: project.fullDescription || "",
      projectType: project.projectType || "",
      clientName: project.clientName || "",
      industry: project.industry || "",
      duration: project.duration || "",
      status: project.status || "Completed",
      technologies: project.technologies || [],
      featuresText: (project.features || []).join("\n"),
      challengesText: (project.challenges || []).join("\n"),
      solutionsText: (project.solutions || []).join("\n"),
      metaTitle: project.seo?.metaTitle || "",
      metaDescription: project.seo?.metaDescription || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (confirm(`Are you sure you want to delete project: ${project.title}?`)) {
      deleteMutation.mutate(project._id);
    }
  };

  const handleFormSubmit = async (values: ProjectFormData) => {
    const features = (values.featuresText || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const challenges = (values.challengesText || "")
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    const solutions = (values.solutionsText || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: values.title,
      description: values.description,
      content: values.content,
      imageUrl: values.imageUrl,
      tags: values.tags,
      demoUrl: values.demoUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      featured: values.featured,
      order: Number(values.order),
      category: values.category || undefined,
      shortDescription: values.shortDescription || undefined,
      fullDescription: values.fullDescription || undefined,
      projectType: values.projectType || undefined,
      clientName: values.clientName || undefined,
      industry: values.industry || undefined,
      duration: values.duration || undefined,
      status: values.status,
      technologies: values.technologies,
      features,
      challenges,
      solutions,
      seo: {
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
      },
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload as ProjectPayload });
    } else {
      createMutation.mutate(payload as ProjectPayload);
    }
  };

  // Filter local data
  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [projects, search]);

  const columns = useMemo<DataGridColumn<Project>[]>(
    () => [
      {
        key: "project",
        label: "Project",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.title}
                className="w-10 h-7 rounded bg-zinc-100 dark:bg-zinc-800 object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-7 rounded bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center border shrink-0">
                <Folder className="w-4 h-4 text-zinc-400" />
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
            {row.category || "General"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              row.status === "Completed"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450"
            }`}
          >
            {row.status || "Completed"}
          </span>
        ),
      },
      {
        key: "featured",
        label: "Featured",
        render: (row) =>
          row.featured ? (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ) : (
            <span className="text-zinc-350">—</span>
          ),
      },
      {
        key: "order",
        label: "Sort Order",
        render: (row) => <span className="font-mono text-zinc-500 text-xs">{row.order || 0}</span>,
      },
      {
        key: "actions",
        label: "Actions",
        className: "text-right",
        render: (row) => (
          <DataGridRowActions
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDelete(row)}
            extraActions={[
              ...(row.demoUrl
                ? [
                    {
                      label: "Demo Link",
                      icon: <ExternalLink className="w-3 h-3" />,
                      onClick: () => window.open(row.demoUrl, "_blank"),
                    },
                  ]
                : []),
              ...(row.githubUrl
                ? [
                    {
                      label: "GitHub Link",
                      icon: <FaGithub className="w-3 h-3" />,
                      onClick: () => window.open(row.githubUrl, "_blank"),
                    },
                  ]
                : []),
            ]}
          />
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
            <Layers className="text-brand-primary w-7 h-7" />
            <span>Portfolio Projects</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Publish portfolio articles, link code repositories, and arrange display orders.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-brand-primary/10 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Grid Toolbar */}
      <DataGridToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects by name..."
        columns={columns}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        data={filteredProjects}
        exportFilename="projects_export"
      />

      {/* Grid Data */}
      <DataGrid
        columns={columns}
        data={filteredProjects}
        loading={loading}
        error={error}
        emptyMessage="No showcase projects stored matching searches."
        visibleKeys={visibleKeys}
      />

      {/* CREATE/EDIT MODAL */}
      {isFormOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Overlay Click Target to Close */}
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-scaleUp z-10">
            {/* Sticky Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-25 select-none">
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {editingId ? "Modify Portfolio Project" : "Create Portfolio Project"}
                </h2>
                <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-none">
                  Define detailed case study parameters, client scope metrics, and SEO metadata.
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
                  
                  {/* Section: Basic Specs */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">1. Basic Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="title" label="Project Title" placeholder="Next-Gen SaaS Analytics" required />
                      <FormInput name="category" label="Category" placeholder="Web Development / FinTech" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormSelect
                        name="status"
                        label="Project Status"
                        options={[
                          { value: "Completed", label: "Completed" },
                          { value: "In Progress", label: "In Progress" },
                        ]}
                      />
                      <FormInput name="order" type="number" label="Display Order Priority" placeholder="0" />
                      <div className="flex items-center pt-5">
                        <FormCheckbox name="featured" label="Pin as Featured" description="Show on homepage head" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Client & Scope */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">2. Client Specifications & Scope</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="demoUrl" label="Live Demo URL" placeholder="https://demo.example.com" />
                      <FormInput name="githubUrl" label="GitHub Repository URL" placeholder="https://github.com/..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="clientName" label="Client Name" placeholder="Stripe Inc." />
                      <FormInput name="industry" label="Industry" placeholder="Financial Tech" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="projectType" label="Project Type" placeholder="E-Commerce Client" />
                      <FormInput name="duration" label="Project Duration" placeholder="3 Months" />
                    </div>
                  </div>

                  {/* Section: Tags & Visuals */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">3. Tags & Visual Cover</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormMultiSelect name="tags" label="Tag Labels (Type & press Enter)" />
                      <FormMultiSelect name="technologies" label="Technologies Used (Type & press Enter)" />
                    </div>
                    <FormImageUpload name="imageUrl" label="Cover Banner Image" folder="projects" />
                  </div>

                  {/* Section: Elevator Pitch Description */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">4. Elevator Pitch Summary</h3>
                    <FormTextarea 
                      name="description" 
                      label="Short Pitch Summary" 
                      placeholder="Brief elevator pitch of the project..." 
                      required 
                      showCounter={true}
                      maxCharacters={300}
                      autoResize={true}
                    />
                  </div>

                  {/* Section: Case Study rich content */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">5. Case Study Analysis Content</h3>
                    <FormMarkdownEditor 
                      name="content" 
                      label="Full Case Study content body" 
                      placeholder="Describe goals, challenges, and implementation workflows in Markdown..." 
                      rows={12}
                    />
                  </div>

                  {/* Section: Detailed Lists */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">6. Key Case Lists (one item per line)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormTextarea name="featuresText" label="Key Features" placeholder="Billing system&#10;Dark Mode&#10;Server API" rows={4} autoResize={true} />
                      <FormTextarea name="challengesText" label="Challenges Met" placeholder="High latency api&#10;Schema mutations" rows={4} autoResize={true} />
                      <FormTextarea name="solutionsText" label="Solutions Developed" placeholder="Edge caching layer&#10;Strict validation schemas" rows={4} autoResize={true} />
                    </div>
                  </div>

                  {/* Section: SEO Metas */}
                  <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-450 tracking-wider">7. Search Engine Optimization</h3>
                    <div className="space-y-4">
                      <FormInput name="metaTitle" label="SEO Meta Title" placeholder="Stripe Client Showcase - Portfolio" />
                      <FormTextarea 
                        name="metaDescription" 
                        label="SEO Meta Description" 
                        placeholder="Short description for Google Search engines..." 
                        rows={2} 
                        showCounter={true} 
                        maxCharacters={160}
                        autoResize={true}
                      />
                    </div>
                  </div>

                </div>

                {/* Sticky Footer Actions */}
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
                      "Save Project"
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
