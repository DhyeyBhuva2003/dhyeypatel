import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, UploadCloud, Trash2, Loader2, Link } from "lucide-react";
import uploadService from "@/services/upload";
import { toast } from "sonner";

interface FormFileUploadProps {
  name: string;
  publicIdName?: string;
  label?: string;
  folder?: string;
  description?: string;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  name,
  publicIdName,
  label,
  folder = "documents",
  description = "Supports PDF documents (Max 10MB)",
  allowedTypes = ["application/pdf"],
  allowedExtensions = [".pdf"],
}) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const currentUrl = watch(name);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  const processFile = async (file: File) => {
    // 1. Validate type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error(`Only these file formats are allowed: ${allowedExtensions.join(", ")}`);
      return;
    }

    // 2. Validate size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("File exceeds the maximum limit of 10MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadService.upload(file, folder);
      if (result.success) {
        setValue(name, result.data.url, { shouldValidate: true, shouldDirty: true });
        if (publicIdName) {
          setValue(publicIdName, result.data.public_id, { shouldDirty: true });
        }
        toast.success("Document uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload file");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Network communication error during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setValue(name, "", { shouldValidate: true, shouldDirty: true });
    if (publicIdName) {
      setValue(publicIdName, "", { shouldDirty: true });
    }
    toast.success("File removed.");
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <span className="block text-[11px] font-bold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Preview Frame */}
        <div className="relative group shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-36 h-28 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden p-3 text-center">
          {currentUrl ? (
            <>
              <FileText className="w-8 h-8 text-brand-primary mb-1 animate-pulse" />
              <span className="text-[9px] font-bold text-zinc-650 dark:text-zinc-350 truncate w-full max-w-[100px]">
                {currentUrl.split("/").pop() || "Uploaded File"}
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="View Document"
                >
                  <Link className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-650 transition cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 p-2">
              <FileText className="w-6 h-6 mb-1 text-zinc-300 dark:text-zinc-700" />
              <span className="text-[9px] font-semibold">No Document</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Uploading</span>
            </div>
          )}
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex-1 w-full border-2 border-dashed rounded-2xl p-5 text-center transition flex flex-col items-center justify-center gap-1.5 select-none ${
            dragActive
              ? "border-brand-primary bg-primary-glow"
              : "border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:bg-zinc-50/20 dark:hover:bg-zinc-950/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedExtensions.join(",")}
            className="hidden"
            disabled={uploading}
          />
          <UploadCloud className="w-6 h-6 text-zinc-400" />
          <div className="text-xs font-semibold text-zinc-500">
            Drag & drop document, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-brand-primary hover:underline font-bold cursor-pointer disabled:opacity-50"
            >
              browse
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            {description}
          </p>
        </div>
      </div>

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-bold tracking-tight animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormFileUpload;
