import apiClient from "@/api/client";

export interface BrandSettingsPayload {
  brandName: string;
  logoUrl?: string;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  supportEmail: string;
  replyEmail: string;
  website: string;
  address: string;
  phone?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
  };
  footerText?: string;
  copyright: string;
}

export interface EmailTemplatePayload {
  name: string;
  slug: string;
  category?: string;
  subject: string;
  jsonLayout: any;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface CampaignPayload {
  name: string;
  subject: string;
  template: string;
  senderName: string;
  replyTo: string;
  campaignType: "NEWSLETTER" | "PROMOTION" | "ANNOUNCEMENT" | "FOLLOW_UP" | "CUSTOM";
  audience: {
    type: "ALL" | "GROUPS" | "TAGS" | "MANUAL" | "CSV";
    groupIds?: string[];
    tagIds?: string[];
    manualEmails?: string[];
    csvUrl?: string;
  };
  attachments?: Array<{ name: string; url: string; size: number }>;
  schedule: {
    sendNow: boolean;
    scheduledAt?: string;
    timezone?: string;
  };
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: string;
}

export interface SubscriberPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED" | "SPAM";
  tags?: string[];
  groups?: string[];
  customFields?: Record<string, string>;
}

export const emailsService = {
  // Brand Settings
  async getSettings() {
    const res = await apiClient.get("/admin/emails/settings");
    return res.data;
  },
  async saveSettings(data: BrandSettingsPayload) {
    const res = await apiClient.post("/admin/emails/settings", data);
    return res.data;
  },

  // Templates CMS
  async getTemplates(params?: { search?: string; status?: string; category?: string }) {
    const res = await apiClient.get("/admin/emails/templates", { params });
    return res.data;
  },
  async getTemplate(id: string) {
    const res = await apiClient.get(`/admin/emails/templates/${id}`);
    return res.data;
  },
  async createTemplate(data: EmailTemplatePayload) {
    const res = await apiClient.post("/admin/emails/templates", data);
    return res.data;
  },
  async updateTemplate(id: string, data: Partial<EmailTemplatePayload>) {
    const res = await apiClient.put(`/admin/emails/templates/${id}`, data);
    return res.data;
  },
  async deleteTemplate(id: string) {
    const res = await apiClient.delete(`/admin/emails/templates/${id}`);
    return res.data;
  },

  // Campaigns CMS
  async getCampaigns() {
    const res = await apiClient.get("/admin/emails/campaigns");
    return res.data;
  },
  async getCampaign(id: string) {
    const res = await apiClient.get(`/admin/emails/campaigns/${id}`);
    return res.data;
  },
  async createCampaign(data: CampaignPayload) {
    const res = await apiClient.post("/admin/emails/campaigns", data);
    return res.data;
  },
  async updateCampaign(id: string, data: Partial<CampaignPayload>) {
    const res = await apiClient.put(`/admin/emails/campaigns/${id}`, data);
    return res.data;
  },
  async patchCampaignStatus(id: string, status: string) {
    const res = await apiClient.patch(`/admin/emails/campaigns/${id}`, { status });
    return res.data;
  },
  async deleteCampaign(id: string) {
    const res = await apiClient.delete(`/admin/emails/campaigns/${id}`);
    return res.data;
  },

  // Subscribers
  async getSubscribers(params?: { search?: string; status?: string; tag?: string; group?: string }) {
    const res = await apiClient.get("/admin/emails/subscribers", { params });
    return res.data;
  },
  async getSubscriber(id: string) {
    const res = await apiClient.get(`/admin/emails/subscribers/${id}`);
    return res.data;
  },
  async createSubscriber(data: SubscriberPayload) {
    const res = await apiClient.post("/admin/emails/subscribers", data);
    return res.data;
  },
  async updateSubscriber(id: string, data: Partial<SubscriberPayload>) {
    const res = await apiClient.put(`/admin/emails/subscribers/${id}`, data);
    return res.data;
  },
  async deleteSubscriber(id: string) {
    const res = await apiClient.delete(`/admin/emails/subscribers/${id}`);
    return res.data;
  },
  async importSubscribers(data: { subscribers: any[]; tagIds: string[]; groupIds: string[] }) {
    const res = await apiClient.post("/admin/emails/subscribers/import", data);
    return res.data;
  },

  // Tags
  async getTags() {
    const res = await apiClient.get("/admin/emails/subscribers/tags");
    return res.data;
  },
  async createTag(data: { name: string; slug: string; description?: string }) {
    const res = await apiClient.post("/admin/emails/subscribers/tags", data);
    return res.data;
  },

  // Groups
  async getGroups() {
    const res = await apiClient.get("/admin/emails/subscribers/groups");
    return res.data;
  },
  async createGroup(data: { name: string; slug: string; description?: string }) {
    const res = await apiClient.post("/admin/emails/subscribers/groups", data);
    return res.data;
  },

  // Analytics
  async getAnalytics(range = "30") {
    const res = await apiClient.get("/admin/emails/analytics", { params: { range } });
    return res.data;
  },

  // Queue Inspector
  async getQueueStats() {
    const res = await apiClient.get("/admin/emails/queue");
    return res.data;
  },
  async clearQueue() {
    const res = await apiClient.delete("/admin/emails/queue");
    return res.data;
  },

  // Automations
  async getAutomations() {
    const res = await apiClient.get("/admin/emails/automations");
    return res.data;
  },
  async createAutomation(data: any) {
    const res = await apiClient.post("/admin/emails/automations", data);
    return res.data;
  },
  async getOauthMetrics() {
    const res = await apiClient.get("/admin/emails/oauth");
    return res.data;
  },
};

export default emailsService;
