"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import * as z from "zod";
import axios from "axios";
import { toast, Toaster } from "sonner";
import {
  FaPaperPlane,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaPhoneAlt,
  FaCloudUploadAlt,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
  FaFile
} from "react-icons/fa";

// Zod Validation Schema for Text Fields
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  subject: z.string().max(100, "Subject is too long").trim().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters").trim(),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // File Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const searchParams = useSearchParams();
  const subjectParam = searchParams ? searchParams.get("subject") : "";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (subjectParam) {
      setValue("subject", subjectParam);
    }
  }, [subjectParam, setValue]);

  const handleFile = (file: File) => {
    setFileError(null);

    // Validate File Size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError("File size exceeds 10MB limit.");
      return;
    }

    // Validate Extension
    const allowedExtensions = [
      "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "jpg", "jpeg", "png", "webp"
    ];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      setFileError("Supported formats: PDF, DOC, XLS, PPT, TXT, JPG, PNG, WEBP.");
      return;
    }

    setSelectedFile(file);

    // Create image preview URL if it is an image
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setUploadProgress(0);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FaFilePdf className="w-8 h-8 text-red-500 shrink-0" />;
      case "doc":
      case "docx":
        return <FaFileWord className="w-8 h-8 text-blue-500 shrink-0" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="w-8 h-8 text-emerald-500 shrink-0" />;
      case "ppt":
      case "pptx":
        return <FaFilePowerpoint className="w-8 h-8 text-orange-500 shrink-0" />;
      case "txt":
        return <FaFileAlt className="w-8 h-8 text-zinc-400 shrink-0" />;
      default:
        return <FaFile className="w-8 h-8 text-purple-500 shrink-0" />;
    }
  };

  const onSubmit = async (data: ContactFormInputs) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("subject", data.subject || "");
      formData.append("message", data.message);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post("/api/inquiries", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.status === 201 && response.data.success) {
        toast.success("Inquiry submitted successfully!");
        setIsSuccess(true);
        setSelectedFile(null);
        setPreviewUrl(null);
        reset();
      } else {
        toast.error(response.data.message || "Failed to submit inquiry.");
      }
    } catch (err: any) {
      console.error("Contact form submit error:", err);
      const errMsg = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16">
      {/* Toast provider */}
      <Toaster position="top-right" richColors />

      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Let&apos;s Build Something Great
        </h1>
        <p className="text-lg text-zinc-650 dark:text-zinc-400 leading-relaxed">
          Have an inquiry, project proposal, or technical consultation? Fill out the form below to get started.
        </p>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Contact Info (left column) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Connect With Me
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">
              If you prefer traditional channels or want to check out my professional credentials, feel free to use the reference details below.
            </p>

            {/* Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/30">
                <FaEnvelope className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email</h4>
                  <a
                    href="mailto:dhyeybhuva2003@gmail.com"
                    className="text-sm text-zinc-700 dark:text-zinc-300 font-medium hover:underline hover:text-purple-600"
                  >
                    dhyeybhuva2003@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/30">
                <FaPhoneAlt className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Phone</h4>
                  <a
                    href="tel:+916355830394"
                    className="text-sm text-zinc-700 dark:text-zinc-300 font-medium hover:underline hover:text-purple-600"
                  >
                    +91 6355830394
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/30">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Location</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Ahmedabad, Gujarat, India (Remote Available Globally)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social connections */}
          <div className="space-y-4 pt-6 lg:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Social Portals
            </h3>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com/in/dhyeybhuva/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
              >
                <FaLinkedin className="text-[#0077b5]" /> LinkedIn
              </a>
              <a
                href="https://github.com/dhyeybhuva2003"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
              >
                <FaGithub /> GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (right column) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-850 h-full flex flex-col justify-center">
            {isSuccess ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-900/30 flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-2xl text-green-600 dark:text-green-450">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Message Transmitted!
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for your message. Your inquiry has been registered in the database, and Dhyey will get back to you shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-purple-650 dark:text-purple-400 hover:underline pt-2"
                >
                  Submit another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      {...register("name")}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 ${errors.name ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                        }`}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...register("email")}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 ${errors.email ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                        }`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject field */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Enter inquiry subject"
                    {...register("subject")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 ${errors.subject ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                  />
                  {errors.subject && (
                    <p className="text-[10px] text-red-500 font-semibold">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Enter your message here..."
                    {...register("message")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y ${errors.message ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-[10px] text-red-500 font-semibold">{errors.message.message}</p>
                  )}
                </div>

                {/* Document Upload field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Document Upload
                  </label>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${dragActive
                      ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/5 hover:border-zinc-350 dark:hover:border-zinc-700"
                      }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
                    />

                    {!selectedFile ? (
                      <div className="text-center space-y-2.5">
                        <FaCloudUploadAlt className="w-10 h-10 text-zinc-400 dark:text-zinc-550 mx-auto" />
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          Drag &amp; Drop your document here, or
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById("file-upload")?.click()}
                          className="px-4 py-2 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-350 cursor-pointer shadow-sm"
                        >
                          Browse File
                        </button>
                        <p className="text-[9px] font-medium text-zinc-450 dark:text-zinc-550 pt-1 leading-none">
                          PDF, DOC, XLS, PPT, TXT or Images up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Upload preview"
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-150 dark:border-zinc-800 shrink-0"
                            />
                          ) : (
                            getFileIcon(selectedFile.name)
                          )}
                          <div className="overflow-hidden leading-tight">
                            <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Remove File"
                        >
                          <FaTimes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-[10px] text-red-500 font-semibold">{fileError}</p>
                  )}

                  {/* Submission Upload Progress */}
                  {isSubmitting && selectedFile && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-450">
                        <span>Uploading File Attachment</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-850 overflow-hidden">
                        <div
                          className="h-full bg-purple-650 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 transition cursor-pointer shadow-md shadow-purple-600/10"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={11} />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Contact() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-650 border-t-transparent animate-spin"></div>
          <span className="text-xs text-zinc-450 font-bold uppercase tracking-wider">Loading form...</span>
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
