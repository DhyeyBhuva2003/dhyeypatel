"use client";

import React, { useState, useEffect, useRef } from "react";
import emailsService, { EmailTemplatePayload } from "@/services/emails";
import { toast } from "sonner";
import {
  RefreshCw,
  Plus,
  Edit,
  Copy,
  Archive,
  Trash2,
  Eye,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  Trash,
  Sparkles,
  Search,
  Clipboard,
  Check,
  ChevronLeft,
  Settings as SettingsIcon,
  Layout,
} from "lucide-react";
import { compileEmailHtml } from "@/lib/emails/renderer";

// List of available block choices
const BLOCK_TYPES = [
  { type: "header", label: "Header Branding", desc: "Logo and Brand Name" },
  { type: "hero", label: "Hero Banner", desc: "Callout banner with heading and CTA" },
  { type: "text", label: "Rich Text", desc: "Markdown and paragraph elements" },
  { type: "image", label: "Image Block", desc: "Responsive centered banner image" },
  { type: "button", label: "Button Link", desc: "Custom styled button CTA" },
  { type: "divider", label: "Divider Line", desc: "Horizontal rule separator" },
  { type: "table", label: "Data Table", desc: "Grid of rows and values" },
  { type: "quote", label: "Blockquote", desc: "Styled side-bordered blockquote" },
  { type: "alert", label: "Alert Box", desc: "Colored warning or success banner" },
  { type: "cta", label: "CTA Banner", desc: "Large background call to action container" },
  { type: "footer", label: "Footer Info", desc: "Address, unsubscribe, social links" },
];

// Available Merge Tag Placeholders
const MERGE_TAGS = [
  { tag: "{{subscriber.firstName}}", label: "Subscriber First Name", cat: "Subscriber" },
  { tag: "{{subscriber.lastName}}", label: "Subscriber Last Name", cat: "Subscriber" },
  { tag: "{{subscriber.email}}", label: "Subscriber Email Address", cat: "Subscriber" },
  { tag: "{{subscriber.company}}", label: "Subscriber Company", cat: "Subscriber" },
  { tag: "{{subscriber.phone}}", label: "Subscriber Phone Number", cat: "Subscriber" },
  { tag: "{{brand.brandName}}", label: "Brand Name", cat: "Brand" },
  { tag: "{{brand.website}}", label: "Brand Website URL", cat: "Brand" },
  { tag: "{{brand.supportEmail}}", label: "Support Contact Email", cat: "Brand" },
  { tag: "{{brand.replyEmail}}", label: "Reply-To Address", cat: "Brand" },
  { tag: "{{brand.address}}", label: "Brand Physical Address", cat: "Brand" },
  { tag: "{{unsubscribeUrl}}", label: "Unsubscribe Redirection Link", cat: "System" },
  { tag: "{{currentDate}}", label: "Current Date (Long Style)", cat: "System" },
  { tag: "{{currentYear}}", label: "Current Calendar Year", cat: "System" },
];

export default function TemplatesManager() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>(null);

  // Editor View Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [jsonLayout, setJsonLayout] = useState<any[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  // Search Variables State
  const [varSearch, setVarSearch] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Preview Iframe Ref
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tempRes, settingsRes] = await Promise.all([
        emailsService.getTemplates(),
        emailsService.getSettings(),
      ]);

      if (tempRes.success) setTemplates(tempRes.data);
      if (settingsRes.success) setBrand(settingsRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates metadata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Iframe Preview in real-time
  useEffect(() => {
    if (isEditing && iframeRef.current && brand) {
      const dummySubscriber = {
        email: "subscriber@example.com",
        firstName: "John",
        lastName: "Doe",
        company: "Acme Corp",
        phone: "+91 99999 88888",
      };

      const html = compileEmailHtml(
        jsonLayout,
        brand,
        dummySubscriber,
        { subject: subject || "Preview Subject Line", name: name || "Template Preview" },
        { inquiry: { referenceId: "INQ-777888", subject: "Sample Project Inquiry", message: "Hello, this is a mock inquiry text." } }
      );

      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [jsonLayout, brand, subject, name, isEditing]);

  const handleOpenNew = () => {
    setName("");
    setSlug("");
    setCategory("General");
    setSubject("");
    setStatus("DRAFT");
    setJsonLayout([
      { type: "header" },
      { type: "hero", title: "Exciting Updates Ahead!", content: "Discover our new projects and collections here.", buttonText: "Explore More", url: "https://example.com" },
      { type: "footer" },
    ]);
    setSelectedBlockId(null);
    setEditId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (template: any) => {
    setName(template.name);
    setSlug(template.slug);
    setCategory(template.category);
    setSubject(template.subject);
    setStatus(template.status);
    setJsonLayout(template.jsonLayout || []);
    setSelectedBlockId(null);
    setEditId(template._id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name || !slug || !subject) {
      toast.error("Please fill in template name, slug, and subject line");
      return;
    }

    try {
      const payload: EmailTemplatePayload = {
        name,
        slug,
        category,
        subject,
        jsonLayout,
        status,
      };

      let res;
      if (editId) {
        res = await emailsService.updateTemplate(editId, payload);
      } else {
        res = await emailsService.createTemplate(payload);
      }

      if (res.success) {
        toast.success(editId ? "Template updated successfully!" : "Template created successfully!");
        setIsEditing(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      const payload: EmailTemplatePayload = {
        name: `${template.name} (Copy)`,
        slug: `${template.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
        category: template.category,
        subject: template.subject,
        jsonLayout: template.jsonLayout,
        status: "DRAFT",
      };

      const res = await emailsService.createTemplate(payload);
      if (res.success) {
        toast.success("Template duplicated successfully as Draft");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await emailsService.deleteTemplate(id);
      if (res.success) {
        toast.success("Template deleted successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template");
    }
  };

  // Block Manipulation Methods
  const handleAddBlock = (type: string) => {
    const defaultBlock: any = { type };
    if (type === "text") {
      defaultBlock.content = "<p>Pasted default paragraph text here. Customize me in the sidebar settings!</p>";
      defaultBlock.align = "left";
    } else if (type === "button") {
      defaultBlock.buttonText = "Click Link Action";
      defaultBlock.url = "https://example.com";
      defaultBlock.color = brand?.primaryColor || "#4f46e5";
      defaultBlock.textColor = "#ffffff";
      defaultBlock.align = "center";
    } else if (type === "divider") {
      // no options
    } else if (type === "image") {
      defaultBlock.imageUrl = "https://images.unsplash.com/photo-1542831371-29b0f74f9713";
      defaultBlock.altText = "Alt description";
      defaultBlock.align = "center";
      defaultBlock.url = "";
    } else if (type === "table") {
      defaultBlock.title = "Order Items";
      defaultBlock.items = [
        { name: "Website Development", value: "$4,500" },
        { name: "SEO Optimization", value: "$1,200" },
      ];
    } else if (type === "quote") {
      defaultBlock.content = "Working with Dhyey was a absolute pleasure. High quality code and communication.";
      defaultBlock.title = "Client Name, CEO";
    } else if (type === "alert") {
      defaultBlock.title = "Project Launch Details";
      defaultBlock.content = "Deployment has been successfully routed to live production environment.";
      defaultBlock.alertType = "success";
    } else if (type === "cta") {
      defaultBlock.title = "Start Your Journey";
      defaultBlock.content = "Get in touch today for custom development services.";
      defaultBlock.buttonText = "Contact Me";
      defaultBlock.url = "https://dhyeybhuva.tech";
    }

    const footerIndex = jsonLayout.findIndex((b) => b.type === "footer");
    if (footerIndex !== -1) {
      // Insert right before footer to keep structure
      const newLayout = [...jsonLayout];
      newLayout.splice(footerIndex, 0, defaultBlock);
      setJsonLayout(newLayout);
      setSelectedBlockId(footerIndex);
    } else {
      setJsonLayout([...jsonLayout, defaultBlock]);
      setSelectedBlockId(jsonLayout.length);
    }
  };

  const handleRemoveBlock = (index: number) => {
    setJsonLayout(jsonLayout.filter((_, i) => i !== index));
    setSelectedBlockId(null);
  };

  const handleMoveBlock = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === jsonLayout.length - 1) return;

    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const newLayout = [...jsonLayout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIdx];
    newLayout[targetIdx] = temp;

    setJsonLayout(newLayout);
    setSelectedBlockId(targetIdx);
  };

  const handleUpdateBlockConfig = (fields: any) => {
    if (selectedBlockId === null) return;
    setJsonLayout(
      jsonLayout.map((b, i) => (i === selectedBlockId ? { ...b, ...fields } : b))
    );
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    toast.success(`Copied merge tag ${tag}`);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Filtered variables list
  const filteredTags = MERGE_TAGS.filter(
    (t) =>
      t.tag.toLowerCase().includes(varSearch.toLowerCase()) ||
      t.label.toLowerCase().includes(varSearch.toLowerCase()) ||
      t.cat.toLowerCase().includes(varSearch.toLowerCase())
  );

  if (isEditing) {
    /* VISUAL DESIGN BUILDER VIEW */
    const selectedBlock = selectedBlockId !== null ? jsonLayout[selectedBlockId] : null;

    return (
      <div className="space-y-6 h-screen flex flex-col -m-6 md:-m-10 p-6 bg-zinc-50 dark:bg-black overflow-hidden select-none animate-fadeIn">
        {/* Editor Top Bar */}
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-850 p-4 shrink-0 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                Email Builder Editor
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                {name || "Draft Layout"} (/{slug || "new-slug"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish Template</option>
              <option value="ARCHIVED">Archive Template</option>
            </select>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>
        </div>

        {/* Builder Work Area Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0 py-2">
          {/* LEFT: Blocks Stack Hierarchy & Block List */}
          <div className="lg:col-span-3 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-4 overflow-hidden min-h-0 space-y-4 shadow-sm">
            <div className="border-b border-zinc-100 dark:border-zinc-850 pb-2 flex items-center justify-between shrink-0">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                Template Layout Stack
              </h4>
              <span className="text-[9px] uppercase font-bold text-zinc-400">
                {jsonLayout.length} sections
              </span>
            </div>

            {/* Blocks List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar-thin">
              {jsonLayout.map((block, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBlockId(idx)}
                  className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition ${
                    selectedBlockId === idx
                      ? "border-brand-primary bg-indigo-500/5 text-brand-primary"
                      : "border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="leading-none">
                    <span className="text-[10px] text-zinc-400 font-bold block">Section {idx + 1}</span>
                    <span className="text-xs font-extrabold capitalize mt-1.5 inline-block">{block.type}</span>
                  </div>
                  {/* Reordering Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveBlock(idx, "UP");
                      }}
                      className="p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                      disabled={idx === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveBlock(idx, "DOWN");
                      }}
                      className="p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                      disabled={idx === jsonLayout.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBlock(idx);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Blocks Toolbar */}
            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-3 shrink-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                Insert Layout Block
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar-thin pr-1 text-left">
                {BLOCK_TYPES.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => handleAddBlock(b.type)}
                    className="px-2 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-950 text-left rounded-lg border border-zinc-200/60 dark:border-zinc-850 hover:border-brand-primary text-[10px] font-bold text-zinc-700 dark:text-zinc-350 transition cursor-pointer"
                  >
                    + {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: Live Iframe Preview Screen */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 overflow-hidden min-h-0 shadow-sm relative">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider flex justify-between items-center shrink-0">
              <span>Dynamic Live Preview (Desktop view)</span>
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <iframe
              ref={iframeRef}
              title="Template Preview"
              className="flex-1 w-full bg-zinc-100/50 border-none outline-none"
            />
          </div>

          {/* RIGHT: Config Editor Sidebar & Variables tags inspector */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-4 overflow-hidden min-h-0 space-y-5 shadow-sm">
            {/* Block configuration */}
            <div className="border-b border-zinc-100 dark:border-zinc-850 pb-2 shrink-0">
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1">
                <SettingsIcon className="w-3.5 h-3.5 text-brand-primary" />
                <span>{selectedBlock ? `Configure: ${selectedBlock.type}` : "Global Settings"}</span>
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left custom-scrollbar-thin">
              {selectedBlock === null ? (
                /* Global configuration fields (template metadata) */
                <div className="space-y-4 animate-scaleUp">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Template Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Welcome Email Template"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. welcome-email"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Default Subject Line</label>
                    <input
                      type="text"
                      placeholder="e.g. Welcome {{subscriber.firstName}}!"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      required
                    />
                  </div>

                  {/* Search Merge tags */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Search Merge tags
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search variables..."
                        value={varSearch}
                        onChange={(e) => setVarSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px]"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar-thin pr-1">
                      {filteredTags.map((t) => (
                        <div
                          key={t.tag}
                          className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 text-[10px]"
                        >
                          <div>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">{t.tag}</span>
                            <span className="text-zinc-400 font-semibold">{t.label}</span>
                          </div>
                          <button
                            onClick={() => handleCopyTag(t.tag)}
                            className="p-1 text-zinc-400 hover:text-brand-primary rounded hover:bg-zinc-150 transition cursor-pointer"
                          >
                            {copiedTag === t.tag ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Select Block Specific Attributes editing */
                <div className="space-y-4 animate-scaleUp">
                  {selectedBlock.type === "hero" || selectedBlock.type === "cta" ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Headline</label>
                        <input
                          type="text"
                          value={selectedBlock.title || ""}
                          onChange={(e) => handleUpdateBlockConfig({ title: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Body Description</label>
                        <textarea
                          value={selectedBlock.content || ""}
                          onChange={(e) => handleUpdateBlockConfig({ content: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Button Text</label>
                          <input
                            type="text"
                            value={selectedBlock.buttonText || ""}
                            onChange={(e) => handleUpdateBlockConfig({ buttonText: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Button Link URL</label>
                          <input
                            type="text"
                            value={selectedBlock.url || ""}
                            onChange={(e) => handleUpdateBlockConfig({ url: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </>
                  ) : null}

                  {selectedBlock.type === "text" ? (
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase">HTML / Text Content</label>
                      <textarea
                        value={selectedBlock.content || ""}
                        onChange={(e) => handleUpdateBlockConfig({ content: e.target.value })}
                        rows={10}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                  ) : null}

                  {selectedBlock.type === "image" ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Cloudinary Image URL</label>
                        <input
                          type="text"
                          value={selectedBlock.imageUrl || ""}
                          onChange={(e) => handleUpdateBlockConfig({ imageUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Alt Text</label>
                          <input
                            type="text"
                            value={selectedBlock.altText || ""}
                            onChange={(e) => handleUpdateBlockConfig({ altText: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Link URL (Optional)</label>
                          <input
                            type="text"
                            value={selectedBlock.url || ""}
                            onChange={(e) => handleUpdateBlockConfig({ url: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Caption</label>
                        <input
                          type="text"
                          value={selectedBlock.content || ""}
                          onChange={(e) => handleUpdateBlockConfig({ content: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>
                    </>
                  ) : null}

                  {selectedBlock.type === "button" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Button Text</label>
                          <input
                            type="text"
                            value={selectedBlock.buttonText || ""}
                            onChange={(e) => handleUpdateBlockConfig({ buttonText: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">URL Link</label>
                          <input
                            type="text"
                            value={selectedBlock.url || ""}
                            onChange={(e) => handleUpdateBlockConfig({ url: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Button Color</label>
                          <input
                            type="color"
                            value={selectedBlock.color || brand?.primaryColor}
                            onChange={(e) => handleUpdateBlockConfig({ color: e.target.value })}
                            className="w-full h-8 border border-zinc-200 dark:border-zinc-850 rounded cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">Alignment</label>
                          <select
                            value={selectedBlock.align || "center"}
                            onChange={(e: any) => handleUpdateBlockConfig({ align: e.target.value })}
                            className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs cursor-pointer"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {selectedBlock.type === "quote" ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Blockquote Text</label>
                        <textarea
                          value={selectedBlock.content || ""}
                          onChange={(e) => handleUpdateBlockConfig({ content: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Author / Attribution</label>
                        <input
                          type="text"
                          value={selectedBlock.title || ""}
                          onChange={(e) => handleUpdateBlockConfig({ title: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>
                    </>
                  ) : null}

                  {selectedBlock.type === "alert" ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Alert Title</label>
                        <input
                          type="text"
                          value={selectedBlock.title || ""}
                          onChange={(e) => handleUpdateBlockConfig({ title: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Alert Text</label>
                        <textarea
                          value={selectedBlock.content || ""}
                          onChange={(e) => handleUpdateBlockConfig({ content: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">Alert Type</label>
                        <select
                          value={selectedBlock.alertType || "info"}
                          onChange={(e: any) => handleUpdateBlockConfig({ alertType: e.target.value })}
                          className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs cursor-pointer"
                        >
                          <option value="info">Info (Blue)</option>
                          <option value="warning">Warning (Amber)</option>
                          <option value="success">Success (Emerald)</option>
                          <option value="danger">Danger (Red)</option>
                        </select>
                      </div>
                    </>
                  ) : null}

                  {/* Back button to global */}
                  <button
                    type="button"
                    onClick={() => setSelectedBlockId(null)}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer text-center"
                  >
                    Done Editing Block
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* LIST VIEW / GRID VIEW OF SAVED TEMPLATES */
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Email Template CMS</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Create, edit, duplicate, and publish custom mailing layouts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading && templates.length === 0 ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-12 rounded-2xl text-center text-zinc-400 font-semibold italic shadow-sm">
          No email templates created yet. Click Create Template to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((temp) => (
            <div
              key={temp._id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between h-48 card-hover"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-bold text-[9px] text-zinc-500 uppercase">
                    {temp.category}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    temp.status === "PUBLISHED" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : temp.status === "ARCHIVED" 
                      ? "bg-red-500/10 text-red-650"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    {temp.status}
                  </span>
                </div>

                <h4 className="font-extrabold text-zinc-900 dark:text-white mt-3 text-sm">{temp.name}</h4>
                <div className="text-[10px] text-zinc-400 mt-1 font-mono">Slug: /{temp.slug}</div>
                <div className="text-[10px] text-zinc-450 mt-2 truncate font-semibold leading-relaxed">
                  Subject: {temp.subject}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[9px] font-bold uppercase text-zinc-400">
                  Version {temp.version}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleDuplicate(temp)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-brand-primary rounded-lg transition cursor-pointer"
                    title="Duplicate Template"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(temp)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-brand-primary rounded-lg transition cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(temp._id)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline fallback X icon
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
