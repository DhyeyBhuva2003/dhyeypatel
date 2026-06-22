"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaPaperPlane, FaEnvelope, FaMapMarkerAlt, FaClock, FaLinkedin, FaGithub, FaPhoneAlt } from "react-icons/fa";

interface ContactFormInputs {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>();

  const onSubmit = async (data: ContactFormInputs) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Inquiry submitted successfully!");
        setIsSuccess(true);
        reset();
      } else {
        toast.error(resData.message || "Failed to submit inquiry.");
      }
    } catch (err) {
      console.error("Contact form submit error:", err);
      toast.error("An unexpected error occurred. Please try again.");
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

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/30">
                <FaClock className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Average Response Time</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Within 24 Hours
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
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-900/30 flex items-center justify-center mx-auto">
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
                  className="text-xs font-semibold text-purple-600 hover:underline pt-2"
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
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      {...register("name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 ${
                        errors.name ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Your Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
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
                    Subject (Optional)
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Project Inquiry / Consultation Request"
                    {...register("subject")}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell me about your product requirements, deadlines, or tech stack..."
                    {...register("message", {
                      required: "Message content is required",
                      minLength: { value: 10, message: "Message must be at least 10 characters" },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 resize-y ${
                      errors.message ? "border-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-[10px] text-red-500 font-semibold">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 transition"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Submitting...</span>
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
