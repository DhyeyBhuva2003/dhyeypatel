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

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full border border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
          dragActive
            ? "border-brand-primary bg-brand-primary/5"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950/2 hover:border-brand-primary/40"
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

        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
            <span className="text-xs font-semibold text-zinc-500">Uploading document...</span>
          </div>
        ) : !currentUrl ? (
          <div className="flex flex-col items-center justify-center gap-1.5 text-center py-1">
            <UploadCloud className="w-6 h-6 text-zinc-400 dark:text-zinc-550" />
            <div className="text-xs text-zinc-650 dark:text-zinc-450">
              Drag &amp; drop document, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-primary hover:underline font-bold cursor-pointer"
              >
                browse
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              {description}
            </p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-3 p-1 rounded-lg">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <div className="overflow-hidden leading-tight">
                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate max-w-[150px] sm:max-w-[220px]">
                  {currentUrl.split("/").pop() || "Uploaded File"}
                </span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-brand-primary hover:underline font-semibold flex items-center gap-1 mt-0.5"
                >
                  <span>View file</span>
                  <Link className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-zinc-450 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
              title="Remove File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
