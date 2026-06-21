import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

function loadDotenv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    if (line.trim().startsWith("#")) return;
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) return;

    const key = match[1];
    let value = match[2] || "";
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.trim();
  });
}

function parseFrontMatter(markdown) {
  const separator = "---";
  const lines = markdown.split(/\r?\n/);
  if (lines[0].trim() !== separator) {
    return { metadata: {}, content: markdown.trim() };
  }

  let metadata = {};
  let currentKey = null;
  let readingBody = false;
  let bodyLines = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!readingBody && line.trim() === separator) {
      readingBody = true;
      continue;
    }

    if (!readingBody) {
      const keyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (keyMatch) {
        const key = keyMatch[1];
        let value = keyMatch[2].trim();
        if (value === "") {
          metadata[key] = [];
          currentKey = key;
          continue;
        }

        if (value === "true") value = true;
        if (value === "false") value = false;
        metadata[key] = value;
        currentKey = null;
        continue;
      }

      const listMatch = line.match(/^\s*-\s*(.*)$/);
      if (listMatch && currentKey) {
        metadata[currentKey].push(listMatch[1].trim());
      }
      continue;
    }

    bodyLines.push(line);
  }

  const content = bodyLines.join("\n").trim();
  return { metadata, content };
}

function loadBlogPosts() {
  const blogDir = path.join(process.cwd(), "content", "blogs");
  if (!fs.existsSync(blogDir)) {
    console.warn("No blog folder found at content/blogs. Skipping blog seeding.");
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((name) => name.endsWith(".md"));
  return files.map((file) => {
    const markdown = fs.readFileSync(path.join(blogDir, file), "utf8");
    const { metadata, content } = parseFrontMatter(markdown);
    return {
      title: metadata.title || path.basename(file, ".md"),
      description: metadata.description || "",
      slug: metadata.slug || path.basename(file, ".md"),
      content,
      imageUrl: metadata.imageUrl || "",
      tags: Array.isArray(metadata.tags) ? metadata.tags : metadata.tags ? [metadata.tags] : [],
      category: metadata.category || "Blog",
      published: metadata.published === true || metadata.published === "true",
      publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : null,
      readTime: metadata.readTime || "5 min read",
    };
  });
}

function findLocalImageForSlug(slug) {
  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
  for (const ext of extensions) {
    const imagePath = path.join(TEMP_IMAGES_DIR, `${slug}${ext}`);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }
  }
  return null;
}

loadDotenv();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dhyeypatel";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dhyeybhuva.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpassword123";
const TEMP_IMAGES_DIR = path.join(process.cwd(), "scripts", "temp-images");

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "dhyey_cloudinary_cloud" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "123456789012345" &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("Cloudinary credentials are missing or placeholder values; image upload will be skipped.");
}

async function uploadImageBuffer(fileBuffer, folder = "portfolio") {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"] },
      (error, result) => {
        if (error) return reject(error);
        if (!result || !result.secure_url) return reject(new Error("Cloudinary returned empty result."));
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    demoUrl: { type: String },
    githubUrl: { type: String },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    features: { type: [String], default: [] },
    price: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    tags: { type: [String], default: [] },
    category: { type: String, required: true },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    readTime: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const PROJECTS = [
  {
    title: "US Institute of 3D Technology – Full-Stack Educational Platform",
    slug: "us-institute-of-3d-technology-full-stack-educational-platform",
    description: "A comprehensive, responsive learning portal for the US Institute of 3D Technology, featuring student dashboards, course catalog filters, interactive 3D model viewers, and admin coordination modules.",
    tags: ["Next.js", "React", "MongoDB", "Three.js", "WebGL", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
This full-stack educational system was engineered to streamline course registration, student progress tracking, and interactive virtual lab experiences. It integrates WebGL rendering modules to display coursework files directly within browser tabs.

### Core Architecture & Features
- **WebGL Interactive Viewer**: Enables students to rotate, scale, and analyze complex 3D engineering models natively using Three.js and custom shader setups.
- **Dynamic Grading Portal**: Streamlines task submissions and allows instructors to annotate student designs.
- **Admin Workspace**: Manages curriculum details, schedules, admissions pipelines, and handles secure tuition payments via Stripe.
- **Role-Based Workflows**: Separate, protected dashboards for students, instructors, and system administrators.

### Technology Stack
- **Frontend**: Next.js, React 19, Framer Motion, Three.js (WebGL rendering)
- **Database & Services**: MongoDB (Mongoose schemas), Cloudinary (asset hosting)
- **API**: Next.js Route Handlers with robust Zod schemas`,
    demoUrl: "https://usi3dt.com",
    githubUrl: "https://github.com/DhyeyBhuva2003/usi3d-platform",
    featured: true,
    order: 1,
  },
  {
    title: "Neminath Travels – Full-Stack Vehicle&Driver Booking Platform",
    slug: "neminath-travels-full-stack-vehicledriver-booking-platform",
    description: "An end-to-end booking and fleet management platform for Neminath Travels, combining customer reservation modules, real-time driver dispatching, and dynamic route calculations.",
    tags: ["Next.js", "React", "MongoDB", "Google Maps API", "Socket.io", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
A custom logistic dashboard built to manage traveler bookings, driver allocation, and billing calculations. The app supports passenger reservations and helps administrators track fleet performance.

### Key Capabilities
- **Dynamic Booking Form**: Supports passenger route choices, schedule timing, and vehicle capacity preferences.
- **Google Maps Integration**: Calculates distances and suggests routes automatically, enabling accurate fare estimations.
- **Live Notifications**: Keeps passengers and drivers in sync with real-time status changes.
- **Payment Processing**: Integrates regional APIs for secure online and mobile wallets.

### Technology Stack
- **Frontend**: Next.js App Router, Tailwind CSS, Google Maps React SDK
- **Backend Services**: Next.js Server Actions, MongoDB, Mongoose middleware`,
    demoUrl: "https://neminathtravels.com",
    githubUrl: "https://github.com/DhyeyBhuva2003/neminath-booking-system",
    featured: true,
    order: 2,
  },
  {
    title: "Monark University – Full-Stack Website with Deployment",
    slug: "monark-university-full-stack-website-with-deployment",
    description: "A highly performant, SEO-optimized institution website for Monark University, optimized for quick load times and high availability, complete with an interactive notice board and CMS.",
    tags: ["Next.js", "React", "MongoDB", "PM2", "SEO Optimization", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
A complete digital presence overhaul for Monark University. The site functions as a portal for prospective and current students to review departments, browse calendars, check campus notices, and contact department heads.

### Architecture Highlights
- **High-Velocity Rendering**: Leverages Next.js Static Site Generation (SSG) and Incremental Static Regeneration (ISR) to deliver immediate loads.
- **CMS Panel**: Offers university writers a markdown editor to update campus events, notifications, and alerts.
- **Accessibility & SEO**: Semantic markup and Structured Schema markup to ensure search engine rankings and support screen readers.
- **Robust Deployment**: Hosted on virtual servers configured with PM2 clusters and reverse-proxied using Nginx.

### Technology Stack
- **Core**: Next.js, React 19, TypeScript
- **Database**: MongoDB with custom indexing on news/slug indices`,
    demoUrl: "https://monarkuni.edu.in",
    githubUrl: "https://github.com/DhyeyBhuva2003/monark-uni-portal",
    featured: true,
    order: 3,
  },
  {
    title: "The Skyview Reality – Real Estate Showcase Website",
    slug: "the-skyview-reality-real-estate-showcase-website",
    description: "A premium real estate listings catalog featuring high-fidelity property images, advanced filter engines, interactive neighborhood map searches, and direct buyer-agent CRM integration.",
    tags: ["Next.js", "React", "MongoDB", "Framer Motion", "Cloudinary", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
The Skyview Reality platform showcases high-end properties and assists buyers in scheduling virtual tours or physical visits.

### Features
- **Smart Filter Engine**: Fast client-side filters using URL search parameters to sort listings by price, size, locations, and amenities.
- **Interactive Neighborhood Map**: Embeds localized maps showing nearby transit lines, parks, and schools.
- **Agent CRM Inbox**: Connects listing request forms directly to agent dashboards for rapid lead conversion.
- **Media Optimization**: Automatically resizes and compiles property photographs using Cloudinary's dynamic CDN.

### Technology Stack
- **Frontend**: React, Next.js, Framer Motion (page transitions and micro-animations)
- **Backend & Database**: MongoDB, Node.js API handlers, Cloudinary Node SDK`,
    demoUrl: "https://skyviewreality.vercel.app",
    githubUrl: "https://github.com/DhyeyBhuva2003/skyview-real-estate",
    featured: false,
    order: 4,
  },
  {
    title: "Khushinamkeen – Authentic Indian Snack E‑commerce Brand",
    slug: "khushinamkeen-authentic-indian-snack-ecommerce-brand",
    description: "An elegant, high-conversion D2C e-commerce platform for Khushinamkeen, featuring automated shopping carts, secure payment checkout, and backend order fulfillment boards.",
    tags: ["Next.js", "React", "MongoDB", "E-commerce", "Stripe", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
A high-performance e-commerce store built to showcase traditional Indian snacks. The application offers a lightning-fast checkout flow, inventory management, and automated client invoices.

### Core Features
- **Client-Side Cart Logic**: Lightweight react state management to track quantities without page reload.
- **Billing Integration**: Integrated with Stripe and Razorpay to offer dual local and international checkouts.
- **Inventory Monitor**: Automatically decreases stock counts on purchases and notifies admins when counts drop.
- **Order Tracking**: Generates status links for clients to track preparation, shipping, and delivery steps.

### Technology Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes, Mongoose, Nodemailer (automated receipt generation)`,
    demoUrl: "https://khushinamkeen.com",
    githubUrl: "https://github.com/DhyeyBhuva2003/khushinamkeen-store",
    featured: false,
    order: 5,
  },
  {
    title: "Lalatjyotisham – Astrology Platform with Admin Panel & Jotisma API",
    slug: "lalatjyotisham-astrology-platform-with-admin-panel-jotisma-api",
    description: "A specialized astrology platform incorporating birth chart calculation algorithms, consultant scheduler systems, and a custom API for daily transit updates.",
    tags: ["Next.js", "React", "MongoDB", "API Integration", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
Lalatjyotisham is a specialized astrology consult platform that uses coordinate-based math APIs to compute natal birth charts (Kundali), daily transits, and compatibility matches.

### Key Innovations
- **Astronomical Math Integration**: Interfaces math APIs to calculate planetary positions based on birth location coordinates and UTC times.
- **Booking Engine**: Allows clients to schedule consultations with professional astrologers.
- **Jotisma API**: Exposes structured JSON outputs containing Panchang details for integration with external developer systems.
- **Admin Dashboard**: Manages consultant reviews, payment summaries, and appointment statuses.

### Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend & DB**: Node.js, Express, MongoDB (Mongoose)`,
    demoUrl: "https://lalatjyotisham.com",
    githubUrl: "https://github.com/DhyeyBhuva2003/lalatjyotisham-astrology",
    featured: false,
    order: 6,
  },
  {
    title: "Study Mitram International End‑to‑End Study Abroad & Visa Consultancy",
    slug: "study-mitram-international-endtoend-study-abroad-visa-consultancy",
    description: "An educational consulting portal automating country-specific eligibility checks, student visa documentation pipelines, and secure adviser communications.",
    tags: ["Next.js", "React", "MongoDB", "Cloudinary", "Tailwind CSS"],
    fallbackImageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    content: `## Project Overview
Study Mitram International acts as a digital bridge for students seeking study visas and university admissions abroad, organizing applications and documenting updates.

### Key Capabilities
- **Visa Pipeline Tracker**: Visual progress boards letting students monitor document verification stages and visa status.
- **Course Finder Directory**: Aggregates university rankings, course durations, and tuition costs across several countries.
- **Secure File Locker**: Encrypted upload portals for student transcripts, passports, and test scores.
- **Chat Modules**: Connects students with their visa coordinator via custom messaging boards.

### Technology Stack
- **Frontend**: Next.js App Router, Tailwind CSS
- **Backend**: Node.js API handlers, Mongoose schemas, Cloudinary storage`,
    demoUrl: "https://studymitram.com",
    githubUrl: "https://github.com/DhyeyBhuva2003/studymitram-visa-consultancy",
    featured: false,
    order: 7,
  },
];

const SERVICES = [
  {
    title: "Full-Stack Web Development",
    description: "End-to-end custom application development, taking your ideas from Figma mockups to high-performing production deployments.",
    icon: "FaCode",
    features: [
      "Modern Next.js & React Frontend",
      "Robust Node.js & Express REST/GraphQL APIs",
      "Secure MongoDB/PostgreSQL schemas",
      "JWT and Session Authentication",
      "Responsive, mobile-first design",
      "SEO-ready page architectures",
    ],
    price: "$1,500+",
    slug: "full-stack-web-development",
    order: 1,
  },
  {
    title: "SaaS MVP Development",
    description: "Rapid development of a clean, functional Minimum Viable Product so you can validate your SaaS concept with real customers quickly.",
    icon: "FaRocket",
    features: [
      "Interactive wireframes and prototypes",
      "User Registration & Social Auth",
      "Stripe subscription integration",
      "Basic administration dashboard",
      "Email notification templates",
      "Deployment to Vercel/AWS in 4 weeks",
    ],
    price: "$3,000+",
    slug: "saas-mvp-development",
    order: 2,
  },
  {
    title: "Database & Backend Optimization",
    description: "Auditing and refactoring slow server architectures, optimizing queries, caching structures, and ensuring strict security protocols.",
    icon: "FaServer",
    features: [
      "Database indexing & aggregation optimization",
      "Redis caching layer integrations",
      "Zod validation & API security hardening",
      "Serverless functions tuning",
      "Rate limiting & security header configs",
      "Detailed performance profiling reports",
    ],
    price: "$800+",
    slug: "backend-optimization",
    order: 3,
  },
];

async function main() {
  console.log("Starting unified seed script...");
  console.log("Connecting to MongoDB:", MONGODB_URI);

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected.");

  const existingAdmin = await User.findOne({ role: "ADMIN" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: "Dhyey Bhuva",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
  }

  await Service.deleteMany({});
  await Blog.deleteMany({});
  console.log("Cleared existing services and blog entries.");

  let projectCount = 0;
  let uploadCount = 0;

  for (const project of PROJECTS) {
    const existingProject = await Project.findOne({ slug: project.slug });
    let imageUrl = existingProject?.imageUrl || project.fallbackImageUrl;
    const localImagePath = findLocalImageForSlug(project.slug);

    if (localImagePath) {
      if (isCloudinaryConfigured) {
        try {
          const fileBuffer = fs.readFileSync(localImagePath);
          const secureUrl = await uploadImageBuffer(fileBuffer);
          imageUrl = secureUrl;
          uploadCount++;
          console.log(`Uploaded Cloudinary image for slug ${project.slug}`);
        } catch (err) {
          console.error(`Cloudinary upload failed for ${localImagePath}:`, err.message || err);
          if (!imageUrl) {
            imageUrl = project.fallbackImageUrl;
          }
        }
      } else {
        console.warn(`Found local image for ${project.slug} but Cloudinary is not configured. Using existing or fallback URL.`);
      }
    }

    const payload = {
      title: project.title,
      description: project.description,
      slug: project.slug,
      content: project.content,
      imageUrl,
      tags: project.tags,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      order: project.order,
    };

    await Project.updateOne({ slug: project.slug }, { $set: payload }, { upsert: true });
    projectCount++;
  }
  console.log(`Seeded ${projectCount} projects.`);

  let serviceCount = 0;
  for (const service of SERVICES) {
    await Service.updateOne({ slug: service.slug }, { $set: service }, { upsert: true });
    serviceCount++;
  }
  console.log(`Seeded ${serviceCount} services.`);

  const blogs = loadBlogPosts();
  let blogCount = 0;
  for (const blog of blogs) {
    await Blog.updateOne(
      { slug: blog.slug },
      { $set: {
          title: blog.title,
          description: blog.description,
          content: blog.content,
          imageUrl: blog.imageUrl,
          tags: blog.tags,
          category: blog.category,
          published: blog.published,
          publishedAt: blog.publishedAt,
          readTime: blog.readTime,
        } },
      { upsert: true }
    );
    blogCount++;
  }
  console.log(`Seeded ${blogCount} blog posts from content/blogs.`);

  if (!isCloudinaryConfigured && fs.existsSync(TEMP_IMAGES_DIR)) {
    console.warn("Temp image folder exists but Cloudinary is not configured. Local images were not uploaded.");
  }

  console.log("Seed script finished.");
  console.log({ projectCount, serviceCount, blogCount, uploadCount });
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed script failed:", error);
  mongoose.disconnect().finally(() => process.exit(1));
});
