"use client";

import React, { useState, useEffect } from "react";
import emailsService from "@/services/emails";
import { toast } from "sonner";
import { RefreshCw, Play, Plus, Clock, Mail, ChevronRight, Check } from "lucide-react";

export default function AutomationsManager() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<"SUBSCRIBER_JOIN" | "INQUIRY_SUBMIT">("SUBSCRIBER_JOIN");
  const [steps, setSteps] = useState<any[]>([
    { id: "step_1", type: "SEND_EMAIL", templateId: "", delayDays: 0, delayHours: 0 }
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, tempRes] = await Promise.all([
        emailsService.getAutomations(),
        emailsService.getTemplates({ status: "PUBLISHED" })
      ]);
      if (rulesRes.success) setRules(rulesRes.data);
      if (tempRes.success) setTemplates(tempRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load automations data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStep = () => {
    const nextId = `step_${steps.length + 1}`;
    setSteps([...steps, { id: nextId, type: "SEND_EMAIL", templateId: "", delayDays: 0, delayHours: 0 }]);
  };

  const handleUpdateStep = (id: string, fields: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length === 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await emailsService.createAutomation({ name, triggerType, steps, status: "ACTIVE" });
      if (res.success) {
        toast.success("Automation rule created successfully");
        setName("");
        setSteps([{ id: "step_1", type: "SEND_EMAIL", templateId: "", delayDays: 0, delayHours: 0 }]);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create rule");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Automation Rules</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Design automated workflow sequences triggered by subscriber and user events.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Workflows List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-6 shadow-sm">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-850">
              Active Workflows
            </h4>

            {loading && rules.length === 0 ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" />
              </div>
            ) : rules.length === 0 ? (
              <div className="py-12 text-center text-zinc-450 font-semibold italic">
                No automation rules designed yet.
              </div>
            ) : (
              <div className="space-y-6">
                {rules.map((rule) => (
                  <div key={rule._id} className="border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-indigo-500/10 text-brand-primary uppercase">
                          Trigger: {rule.triggerType === "SUBSCRIBER_JOIN" ? "Subscriber Joined" : "Form Submission"}
                        </span>
                        <h5 className="font-black text-sm text-zinc-900 dark:text-white mt-1.5">{rule.name}</h5>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>

                    {/* Timeline Steps preview */}
                    <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-2 py-2 space-y-4">
                      {rule.steps.map((step: any, idx: number) => (
                        <div key={step._id || idx} className="relative flex items-start gap-3">
                          <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-brand-primary" />
                          <div className="flex flex-wrap items-center gap-2">
                            {step.delayDays > 0 || step.delayHours > 0 ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                                <Clock className="w-3 h-3" />
                                <span>Wait {step.delayDays}d {step.delayHours}h</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            ) : null}
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 font-bold text-[10px] text-zinc-700 dark:text-zinc-350">
                              <Mail className="w-3 h-3 text-brand-primary" />
                              <span>Send: {step.templateId?.name || "Notification"}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Creator Form */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-6 shadow-sm">
          <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Create Workflow
          </h4>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Rule Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450">Workflow Name</label>
              <input
                type="text"
                placeholder="e.g. Welcome Series"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                required
              />
            </div>

            {/* Trigger Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450">Trigger Event</label>
              <select
                value={triggerType}
                onChange={(e: any) => setTriggerType(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="SUBSCRIBER_JOIN">Subscriber Joins mailing list</option>
                <option value="INQUIRY_SUBMIT">Visitor Submits contact form</option>
              </select>
            </div>

            {/* Steps Timeline Builder */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-650 dark:text-zinc-450">Workflow Action Steps</span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center gap-1 text-[10px] font-extrabold text-brand-primary hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={step.id} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-3 relative">
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 font-bold text-[10px]"
                      >
                        Remove
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-zinc-400">Step {idx + 1}</span>

                    {/* Delay */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold">Delay Days</label>
                        <input
                          type="number"
                          min="0"
                          value={step.delayDays}
                          onChange={(e) => handleUpdateStep(step.id, { delayDays: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold">Delay Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={step.delayHours}
                          onChange={(e) => handleUpdateStep(step.id, { delayHours: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold">Dispatch Email Template</label>
                      <select
                        value={step.templateId}
                        onChange={(e) => handleUpdateStep(step.id, { templateId: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="">Select Template...</option>
                        {templates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} (/{t.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Launch Automation Workflow</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
