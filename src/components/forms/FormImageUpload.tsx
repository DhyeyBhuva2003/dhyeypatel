import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Image, UploadCloud, Trash2, Loader2 } from "lucide-react";
import uploadService from "@/services/upload";
import { toast } from "sonner";

interface FormImageUploadProps {
  name: string; // Form field key for secure_url
  publicIdName?: string; // Optional field key for public_id
  label?: string;
  folder?: string;
  description?: string;
}

export const FormImageUpload: React.FC<FormImageUploadProps> = ({
  name,
  publicIdName,
  label,
  folder = "portfolio",
  description = "Supports JPG, JPEG, PNG, WEBP (Max 5MB)",
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
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP formats are supported");
      return;
    }

    // 2. Validate size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("File exceeds the maximum limit of 5MB");
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
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
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
    toast.success("Image removed.");
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
        <div className="relative group shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-36 aspect-square flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
          {currentUrl ? (
            <>
              <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 rounded-xl bg-red-600/90 text-white hover:bg-red-650 transition cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-650 p-4 text-center">
              <Image className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold">No Image</span>
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
          className={`flex-1 w-full border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 select-none ${
            dragActive
              ? "border-brand-primary bg-primary-glow"
              : "border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:bg-zinc-50/20 dark:hover:bg-zinc-950/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
          <UploadCloud className="w-6 h-6 text-zinc-400" />
          <div className="text-xs font-semibold text-zinc-500">
            Drag and drop your image, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-brand-primary hover:underline font-bold cursor-pointer disabled:opacity-50"
            >
              browse files
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

export default FormImageUpload;
