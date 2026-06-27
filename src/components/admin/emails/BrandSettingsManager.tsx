"use client";

import React, { useState, useEffect } from "react";
import emailsService, { BrandSettingsPayload } from "@/services/emails";
import { toast } from "sonner";
import { Save, RefreshCw, Globe, Mail, MapPin, Phone, Shield } from "lucide-react";

export default function BrandSettingsManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BrandSettingsPayload>({
    brandName: "",
    logoUrl: "",
    lightLogoUrl: "",
    darkLogoUrl: "",
    primaryColor: "#4f46e5",
    secondaryColor: "#475569",
    accentColor: "#2563eb",
    supportEmail: "",
    replyEmail: "",
    website: "",
    address: "",
    phone: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: "",
    },
    footerText: "",
    copyright: "",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await emailsService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load brand settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await emailsService.saveSettings(settings);
      if (res.success) {
        toast.success("Brand configuration saved successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-850">
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Brand Identity</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Customize your brand colors, logo, and core company configuration.</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
              required
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Website URL</span>
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
              required
            />
          </div>
        </div>

        {/* Color Palette Settings */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Brand Color Scheme
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-10 h-10 border border-zinc-250 dark:border-zinc-800 rounded-xl cursor-pointer p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-10 h-10 border border-zinc-250 dark:border-zinc-800 rounded-xl cursor-pointer p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-10 h-10 border border-zinc-250 dark:border-zinc-800 rounded-xl cursor-pointer p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Assets */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Brand Logos (Cloudinary URLs)
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Default Brand Logo</label>
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="https://cloudinary-url.com/logo.png"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Light Mode Logo (Optional)</label>
                <input
                  type="text"
                  value={settings.lightLogoUrl}
                  onChange={(e) => setSettings({ ...settings, lightLogoUrl: e.target.value })}
                  placeholder="https://cloudinary-url.com/logo-light.png"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Dark Mode Logo (Optional)</label>
                <input
                  type="text"
                  value={settings.darkLogoUrl}
                  onChange={(e) => setSettings({ ...settings, darkLogoUrl: e.target.value })}
                  placeholder="https://cloudinary-url.com/logo-dark.png"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email settings */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Support & Replies Configurations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Support Email Address</span>
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reply-To Email Address</span>
              </label>
              <input
                type="email"
                value={settings.replyEmail}
                onChange={(e) => setSettings({ ...settings, replyEmail: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Company Physical Details (For Anti-Spam laws compliance)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Physical Address</span>
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Street address, City, Country"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Phone (Optional)</span>
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social media connections */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Social Networks (Injected into footers)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450 block">Twitter / X URL</label>
              <input
                type="url"
                value={settings.socialLinks.twitter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450 block">LinkedIn URL</label>
              <input
                type="url"
                value={settings.socialLinks.linkedin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-450 block">GitHub URL</label>
              <input
                type="url"
                value={settings.socialLinks.github}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, github: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-850">
            Email Legal Footer
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Opt-In Consent / Footer Text</label>
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copyright text</span>
              </label>
              <input
                type="text"
                value={settings.copyright}
                onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
