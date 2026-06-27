"use client";

import React, { useState, useEffect } from "react";
import emailsService, { CampaignPayload } from "@/services/emails";
import { toast } from "sonner";
import {
  RefreshCw,
  Plus,
  Mail,
  Send,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  Pause,
  Play,
  Clock,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react";

export default function CampaignsManager() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);

  // Campaign Form State
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [campaignType, setCampaignType] = useState<any>("NEWSLETTER");
  const [audienceType, setAudienceType] = useState<any>("ALL");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [manualEmailsText, setManualEmailsText] = useState("");
  const [priority, setPriority] = useState<any>("MEDIUM");

  // Scheduling
  const [sendNow, setSendNow] = useState(true);
  const [scheduledAtDate, setScheduledAtDate] = useState("");
  const [scheduledAtTime, setScheduledAtTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, tempRes, tagsRes, groupsRes] = await Promise.all([
        emailsService.getCampaigns(),
        emailsService.getTemplates({ status: "PUBLISHED" }),
        emailsService.getTags(),
        emailsService.getGroups(),
      ]);

      if (campRes.success) setCampaigns(campRes.data);
      if (tempRes.success) setTemplates(tempRes.data);
      if (tagsRes.success) setTags(tagsRes.data);
      if (groupsRes.success) setGroups(groupsRes.data);

      // Prepopulate sender info if settings exist
      const settingsRes = await emailsService.getSettings();
      if (settingsRes.success && settingsRes.data) {
        setSenderName(settingsRes.data.brandName);
        setReplyTo(settingsRes.data.replyEmail);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load campaigns details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async () => {
    setCreating(true);
    try {
      let scheduledAt: string | undefined = undefined;
      if (!sendNow && scheduledAtDate && scheduledAtTime) {
        scheduledAt = new Date(`${scheduledAtDate}T${scheduledAtTime}`).toISOString();
      }

      const manualEmails = manualEmailsText
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      const payload: CampaignPayload = {
        name,
        subject,
        template: templateId,
        senderName,
        replyTo,
        campaignType,
        audience: {
          type: audienceType,
          groupIds: audienceType === "GROUPS" ? selectedGroups : undefined,
          tagIds: audienceType === "TAGS" ? selectedTags : undefined,
          manualEmails: audienceType === "MANUAL" ? manualEmails : undefined,
        },
        schedule: {
          sendNow,
          scheduledAt,
          timezone,
        },
        priority,
      };

      const res = await emailsService.createCampaign(payload);
      if (res.success) {
        toast.success(sendNow ? "Campaign launched and queued!" : "Campaign scheduled successfully");
        setShowWizard(false);
        // Clear fields
        setName("");
        setSubject("");
        setTemplateId("");
        setSendNow(true);
        setScheduledAtDate("");
        setScheduledAtTime("");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await emailsService.deleteCampaign(id);
      if (res.success) {
        toast.success("Campaign deleted successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign");
    }
  };

  const handlePauseToggle = async (campaign: any) => {
    const nextStatus = campaign.status === "PAUSED" ? "SCHEDULED" : "PAUSED";
    try {
      const res = await emailsService.patchCampaignStatus(campaign._id, nextStatus);
      if (res.success) {
        toast.success(`Campaign ${campaign.status === "PAUSED" ? "resumed" : "paused"}`);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Campaign Manager</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Draft, execute, and inspect your email dispatches.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setStep(1);
              setShowWizard(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Audience</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Scheduled</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
              {loading && campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-primary mx-auto" />
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400 font-semibold italic">
                    No campaigns created yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 font-medium">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{camp.name}</div>
                        <div className="text-[10px] text-zinc-450 mt-0.5 truncate max-w-xs">{camp.subject}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold uppercase text-[10px] text-zinc-600 dark:text-zinc-400">
                        {camp.audience.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        camp.priority === "HIGH" 
                          ? "bg-red-500/10 text-red-600" 
                          : camp.priority === "MEDIUM" 
                          ? "bg-blue-500/10 text-blue-600" 
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}>
                        {camp.priority}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">
                      {camp.schedule.sendNow ? (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3 text-emerald-500" />
                          <span>Immediate</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-primary" />
                          <span>{new Date(camp.schedule.scheduledAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        camp.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
                          : camp.status === "SCHEDULED"
                          ? "bg-blue-500/10 text-blue-650 dark:text-blue-400"
                          : camp.status === "PROCESSING"
                          ? "bg-amber-500/10 text-amber-650 dark:text-amber-450 animate-pulse"
                          : camp.status === "PAUSED"
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          : "bg-red-500/10 text-red-650 dark:text-red-400"
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {camp.status === "SCHEDULED" || camp.status === "PAUSED" ? (
                        <button
                          onClick={() => handlePauseToggle(camp)}
                          className="p-1.5 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 rounded-lg transition cursor-pointer"
                          title={camp.status === "PAUSED" ? "Resume Campaign" : "Pause Campaign"}
                        >
                          {camp.status === "PAUSED" ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(camp._id)}
                        className="p-1.5 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign wizard modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-850">
              <div>
                <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider">
                  New Campaign Wizard
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">Step {step} of 3</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wizard step contents */}
            <div className="p-6 space-y-4">
              {step === 1 ? (
                /* Step 1: Basic Campaign Meta Info */
                <div className="space-y-4 animate-scaleUp">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Campaign Name</label>
                    <input
                      type="text"
                      placeholder="e.g. June Newsletter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Exclusive updates inside! {{subscriber.firstName}}"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      required
                    />
                    <span className="text-[9px] text-zinc-450 block font-semibold">
                      Pro-tip: Include merge tag properties like <code>{"{{subscriber.firstName}}"}</code> to personalize the subject.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sender Name</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Reply To Email</label>
                      <input
                        type="email"
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Type</label>
                      <select
                        value={campaignType}
                        onChange={(e: any) => setCampaignType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer"
                      >
                        <option value="NEWSLETTER">Newsletter</option>
                        <option value="PROMOTION">Promotion</option>
                        <option value="ANNOUNCEMENT">Announcement</option>
                        <option value="FOLLOW_UP">Follow Up</option>
                        <option value="CUSTOM">Custom Campaign</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Priority</label>
                      <select
                        value={priority}
                        onChange={(e: any) => setPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High (High speed dispatch)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <span>Choose Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : step === 2 ? (
                /* Step 2: Choose template */
                <div className="space-y-4 animate-scaleUp">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Choose Published Template Layout
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar-thin">
                      {templates.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400 text-xs italic">
                          No published templates available. Go design one first.
                        </div>
                      ) : (
                        templates.map((t) => (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => setTemplateId(t._id)}
                            className={`w-full flex justify-between items-center p-3.5 border rounded-xl text-left cursor-pointer transition ${
                              templateId === t._id
                                ? "border-brand-primary bg-indigo-500/5 text-brand-primary"
                                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs">{t.name}</div>
                              <div className="text-[9px] text-zinc-400 font-mono mt-0.5">Category: {t.category} | Version {t.version}</div>
                            </div>
                            {templateId === t._id && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!templateId) {
                          toast.error("Please select a template to continue");
                          return;
                        }
                        setStep(3);
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <span>Audience & Schedule</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 3: Audience & Schedule details */
                <div className="space-y-4 animate-scaleUp">
                  {/* Segment Select */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Audience Segment</label>
                    <select
                      value={audienceType}
                      onChange={(e: any) => setAudienceType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="ALL">All Subscribers</option>
                      <option value="GROUPS">Target mailing list / Groups</option>
                      <option value="TAGS">Target contacts by label Tags</option>
                      <option value="MANUAL">Specify manual emails list</option>
                    </select>
                  </div>

                  {audienceType === "GROUPS" && (
                    <div className="space-y-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-500 font-bold">Select Groups</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {groups.map((g) => {
                          const active = selectedGroups.includes(g._id);
                          return (
                            <button
                              type="button"
                              key={g._id}
                              onClick={() =>
                                setSelectedGroups(
                                  active ? selectedGroups.filter((id) => id !== g._id) : [...selectedGroups, g._id]
                                )
                              }
                              className={`px-2.5 py-1 border rounded text-[9px] font-bold transition cursor-pointer ${
                                active
                                  ? "bg-brand-primary text-white border-brand-primary"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650"
                              }`}
                            >
                              {g.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {audienceType === "TAGS" && (
                    <div className="space-y-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-500 font-bold">Select Tags</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((t) => {
                          const active = selectedTags.includes(t._id);
                          return (
                            <button
                              type="button"
                              key={t._id}
                              onClick={() =>
                                setSelectedTags(
                                  active ? selectedTags.filter((id) => id !== t._id) : [...selectedTags, t._id]
                                )
                              }
                              className={`px-2.5 py-1 border rounded text-[9px] font-bold transition cursor-pointer ${
                                active
                                  ? "bg-zinc-850 dark:bg-zinc-100 text-white dark:text-black border-zinc-850 dark:border-zinc-100"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650"
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {audienceType === "MANUAL" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold">Enter manual emails (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="john@example.com, alice@example.com"
                        value={manualEmailsText}
                        onChange={(e) => setManualEmailsText(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                      />
                    </div>
                  )}

                  {/* Scheduling fields */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendNow}
                          onChange={(e) => setSendNow(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 accent-brand-primary"
                        />
                        <span>Send Campaign Immediately</span>
                      </label>
                    </div>

                    {!sendNow && (
                      <div className="space-y-3 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-xl animate-scaleUp">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold">Date</label>
                            <input
                              type="date"
                              value={scheduledAtDate}
                              onChange={(e) => setScheduledAtDate(e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold">Time</label>
                            <input
                              type="time"
                              value={scheduledAtTime}
                              onChange={(e) => setScheduledAtTime(e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 font-bold">Timezone</label>
                          <input
                            type="text"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            placeholder="e.g. UTC, Asia/Kolkata"
                            className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={creating}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{sendNow ? "Enqueue & Send Now" : "Schedule Campaign"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icons
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
