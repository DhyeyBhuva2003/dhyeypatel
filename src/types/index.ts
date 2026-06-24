export interface Blog {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedAt?: string;
  readTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  imageUrl: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  category?: string;
  shortDescription?: string;
  fullDescription?: string;
  thumbnail?: string;
  gallery?: { image: string; alt: string }[];
  technologies?: string[];
  features?: string[];
  challenges?: string[];
  solutions?: string[];
  projectType?: string;
  clientName?: string;
  industry?: string;
  duration?: string;
  status: "Completed" | "In Progress";
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "CONTACTED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  profileImage?: {
    public_id: string;
    secure_url: string;
  };
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  newUsers: number;
  totalProjects: number;
  totalServices: number;
  totalBlogs: number;
  totalInquiries: number;
  recentLeads: Inquiry[];
}

export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}
