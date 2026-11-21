# Dhyey Bhuva — Personal Brand & Freelance Services Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)

**High-performance, modern portfolio and freelance services platform showcasing custom SaaS MVPs, enterprise software architectures, technical case studies, and engineering blogs.**

[Live Website](https://dhyeybhuva.tech) • [Explore Services](https://dhyeybhuva.tech/services) • [View Portfolio](https://dhyeybhuva.tech/portfolio) • [Get in Touch](https://dhyeybhuva.tech/contact)

</div>

---

## 📌 Overview

This platform serves as the central hub for **Dhyey Bhuva**'s personal brand and software consulting services. Designed with a clean SaaS aesthetic, mobile-first responsiveness, and smooth micro-interactions, it empowers potential clients and recruiters to explore case studies, inspect technical competencies, read engineering blogs, and initiate direct project inquiries.

### Key Objectives
* **Portfolio Showcase**: Interactive, filterable gallery highlighting enterprise-grade web applications, cross-platform apps, and SaaS platforms.
* **Service Lead Generation**: Tailored freelance packages (ERP/CRM development, E-commerce, AI automation) with direct consultation scheduling.
* **Technical Publication**: High-performance developer blog with reading time metrics, category filtering, and SEO optimization.
* **Inquiry & Lead Management**: Contact workflow supporting multi-part file attachments, automated notifications, and newsletter integrations.

---

## 🚀 Key Features

### 🎨 UI & UX Design
* **Floating Island Navbar**: A dynamic, pill-shaped floating header (`rounded-full`) with glassmorphism backdrop blur. Equipped with smart scroll detection that hides when scrolling down and smoothly reappears upon scrolling up.
* **Micro-Interactions & Animations**: Powered by **Framer Motion** and **GSAP** for magnetic button effects, staggered card entrances, and smooth viewport transitions.
* **Theme Switching**: Dark and Light mode support utilizing `next-themes` and custom CSS design tokens.
* **Mobile-First Responsiveness**: Tailored layout scaling seamlessly across ultra-wide monitors, tablets, and handheld devices.

### 💼 Portfolio & Case Studies
* Detailed slug-based project pages (`/portfolio/[slug]`) featuring challenges, architecture solutions, technology stacks, image galleries, and live demo links.
* Category-based filtering and instant search capabilities with **TanStack React Query**.

### 🛠️ Freelance Services
* Transparent presentation of service tiers, feature breakdowns, and pricing structures.
* Direct integration with Calendly booking for discovery calls.

### 📝 Engineering Blog
* Categorized technical articles with estimated read times, publication dates, and related tags.
* Fully accessible markdown rendering with code highlights.

### 📬 Contact & Newsletter Engine
* Validated contact form using **React Hook Form** + **Zod**.
* Supports multi-format attachments (PDF, DOCX, ZIP, images) with size limits.
* Asynchronous newsletter management and automated email delivery powered by **BullMQ**, **Redis**, and **Nodemailer**.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/) |
| **State & Cache**| [TanStack React Query v5](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Queues & Cache**| [BullMQ](https://bullmq.io/) & [Redis](https://redis.io/) (ioredis) |
| **Form & Schema**| [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Media Hosting**| [Cloudinary](https://cloudinary.com/) (`next-cloudinary`) |
| **Email Service**| [Nodemailer](https://nodemailer.com/) |
| **Analytics** | Google Analytics 4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) |

---

## 📁 Project Structure

```text
src/
├── api/                   # Axios client instance and centralized error interceptor
│   └── client.ts
├── app/                   # Next.js App Router routes & API handlers
│   ├── (public)/          # Public route group (home, about, services, portfolio, blog, contact)
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── portfolio/
│   │   ├── pricing/
│   │   ├── privacy/
│   │   ├── services/
│   │   └── terms/
│   ├── api/               # Secure backend Route Handlers
│   │   ├── admin/         # Protected administrative endpoints
│   │   ├── auth/          # Authentication & OAuth flows
│   │   ├── blogs/         # Blog retrieval and query endpoints
│   │   ├── emails/        # Tracking & newsletter routes
│   │   ├── inquiries/     # Lead capture endpoint
│   │   ├── projects/      # Portfolio API
│   │   └── services/      # Services API
│   ├── globals.css        # Tailwind v4 theme definitions and design tokens
│   ├── layout.tsx         # Root layout with theme and query providers
│   ├── robots.ts          # Automated robots.txt generator
│   └── sitemap.ts         # Dynamic sitemap indexer
├── components/            # Reusable UI & presentation components
│   ├── ui/                # Skeletons, error boundaries, portal roots
│   ├── Navbar.tsx         # Floating island scroll-aware navigation
│   ├── Footer.tsx         # Comprehensive footer with local time sync & socials
│   ├── Magnetic.tsx       # Physics-based magnetic button wrapper
│   ├── ThemeToggle.tsx    # Dark/light theme switcher
│   └── ...
├── constants/             # React Query cache keys and application constants
├── hooks/                 # Custom React and TanStack query hooks
├── lib/                   # Database connectors, email helpers, queue instances, SEO & auth
│   ├── db.ts              # Mongoose cached connection pool
│   ├── queue/             # BullMQ Redis worker and email queues
│   ├── analytics.ts       # GA4 event tracking helpers
│   ├── cloudinary.ts      # Asset upload configurations
│   ├── jwt.ts             # JWT signing and verification
│   └── seo.ts             # Metadata and JSON-LD structured schema generators
├── models/                # Mongoose database models
│   ├── Blog.ts
│   ├── Inquiry.ts
│   ├── Project.ts
│   ├── Service.ts
│   ├── Subscriber.ts
│   └── User.ts
├── proxy.ts               # Next.js route proxy / middleware protection
└── types/                 # Shared TypeScript interfaces & types
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **MongoDB**: A running local or MongoDB Atlas instance
* **Redis**: Local Redis server or Upstash instance (for email queuing)

### 1. Clone the Repository
```bash
git clone https://github.com/dhyeybhuva2003/dhyeypatel.git
cd dhyeypatel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and configure the required variables:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=https://calendly.com/your-username/30min

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/dhyeypatel

# Redis (Queues & Cache)
REDIS_URL=redis://127.0.0.1:6379

# Security & Tokens
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
OAUTH_ENCRYPTION_KEY=your_encryption_key_for_oauth

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Services (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_RECEIVER_EMAIL=your-email@gmail.com

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# OAuth (Google & LinkedIn)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 4. Seed Database (Optional)
To populate the database with initial portfolio projects, services, and blogs:
```bash
npm run seed:all
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds optimized production bundle and generates static pages |
| `npm run start` | Starts Next.js production server |
| `npm run lint` | Runs ESLint analysis across the project |
| `npm run seed:all` | Executes database seeder scripts |

---

## 📈 SEO & Performance Highlights
* **Core Web Vitals**: Minimal client bundles, server-side data loading, and efficient CSS utility tree-shaking via Tailwind v4.
* **Search Engine Optimization**: OpenGraph tags, dynamic XML sitemaps (`/sitemap.xml`), and robots configuration (`/robots.txt`).
* **Structured Data**: JSON-LD schemas embedded for `Person`, `ProfessionalService`, `Article`, and `WebSite`.

---

## 👤 Author

**Dhyey Bhuva**
* **Portfolio**: [dhyeybhuva.tech](https://dhyeybhuva.tech)
* **GitHub**: [@dhyeybhuva2003](https://github.com/dhyeybhuva2003)
* **LinkedIn**: [in/dhyeybhuva](https://linkedin.com/in/dhyeybhuva/)
* **Upwork**: [Dhyey Bhuva Profile](https://www.upwork.com/freelancers/~01d4c44951f41c2c1d)
* **Email**: [dhyeybhuva2003@gmail.com](mailto:dhyeybhuva2003@gmail.com)

---

## 📄 License

This project is proprietary and maintained by [Dhyey Bhuva](https://dhyeybhuva.tech). All rights reserved.
