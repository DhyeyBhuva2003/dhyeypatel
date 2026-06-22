# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This project may use a newer version of Next.js with breaking changes.

Before generating, modifying, or refactoring code:

1. Read the relevant documentation from:

   ```
   node_modules/next/dist/docs/
   ```

2. Verify:

   * App Router conventions
   * Server Components behavior
   * Route Handlers
   * Metadata API
   * Middleware API
   * Server Actions
   * Caching and Revalidation
   * Dynamic Routes
   * File-based routing

3. Never assume APIs from previous Next.js versions.

4. Check for:

   * Deprecated APIs
   * Experimental features
   * Breaking changes
   * Migration guides

5. Follow the project's installed Next.js version, not training data.

<!-- END:nextjs-agent-rules -->

# Project Overview

Personal Brand + Freelance Services Platform

Owner: Dhyey Bhuva

Purpose:

* Showcase portfolio
* Generate freelance leads
* Publish technical blogs
* Display case studies
* Manage project inquiries
* Provide admin dashboard

Tech Stack:

* Next.js
* TypeScript
* Tailwind CSS
* MongoDB
* Mongoose
* Cloudinary
* JWT Authentication
* Zod Validation
* React Hook Form

# Development Principles

## Architecture

Follow:

* Clean Architecture
* Modular Design
* Reusable Components
* Feature-based Folder Structure

Avoid:

* Monolithic files
* Duplicate logic
* Business logic inside UI components

## Code Standards

Use:

* TypeScript strict mode
* Async/await
* Functional components
* Server Components where possible

Avoid:

* any type
* Nested callbacks
* Unused code
* Console logs in production

## Naming Convention

Components:

```tsx
ProjectCard.tsx
ServiceCard.tsx
HeroSection.tsx
```

Hooks:

```tsx
useAuth.ts
useProjects.ts
```

Utils:

```tsx
formatDate.ts
generateSlug.ts
```

Models:

```tsx
User.ts
Project.ts
Blog.ts
Inquiry.ts
```

# Folder Structure

```text
src/
├── app/
├── components/
├── lib/
├── models/
├── services/
├── hooks/
├── types/
├── constants/
├── actions/
└── middleware.ts
```

# UI Rules

Design Style:

* Modern SaaS
* Clean whitespace
* Mobile-first
* Accessible
* Responsive

Preferred Libraries:

* Tailwind CSS
* Framer Motion
* React Icons
* Shadcn UI

# Database Rules

MongoDB + Mongoose

Requirements:

* Schema validation
* Indexes where needed
* Timestamps enabled
* Proper references

Example:

```ts
timestamps: true
```

Never:

* Query database directly in components
* Expose sensitive fields

# API Rules

Every API endpoint must:

* Validate input using Zod
* Handle errors properly
* Return consistent responses
* Use proper HTTP status codes

Response Format:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error Format:

```json
{
  "success": false,
  "message": "Validation Error"
}
```

# Authentication Rules

JWT Authentication

Requirements:

* HttpOnly Cookies
* Secure Cookies
* Token Verification
* Role-based Authorization

Roles:

```text
ADMIN
USER
```

Never:

* Store JWT in localStorage
* Expose secrets

# Cloudinary Rules

Used For:

* Project Images
* Blog Images
* Profile Images

Requirements:

* Validate file type
* Validate file size
* Optimize uploads
* Store public_id

Allowed Types:

```text
jpg
jpeg
png
webp
svg
```

# Forms

Use:

* React Hook Form
* Zod Resolver

Requirements:

* Client validation
* Server validation
* Error handling
* Loading states

# Performance Rules

Always:

* Use Next.js Image
* Use Dynamic Imports
* Use Server Components
* Optimize Queries

Avoid:

* Unnecessary re-renders
* Large client bundles

# SEO Rules

Every page must include:

* Title
* Description
* Open Graph
* Canonical URL

Use Next.js Metadata API.

# Security Rules

Always:

* Validate inputs
* Sanitize outputs
* Verify authentication
* Use environment variables

Never:

* Hardcode secrets
* Trust client data
* Expose database credentials

# Git Commit Format

Examples:

```bash
feat: add project management module

fix: resolve cloudinary upload issue

refactor: optimize inquiry service

docs: update project documentation
```

# Output Expectations For AI Agents

When generating code:

1. Provide production-ready code.
2. Use TypeScript.
3. Include validation.
4. Include error handling.
5. Follow project structure.
6. Follow security best practices.
7. Avoid placeholder implementations.
8. Prefer reusable and scalable solutions.

The goal is to maintain enterprise-grade code quality across the entire application.
