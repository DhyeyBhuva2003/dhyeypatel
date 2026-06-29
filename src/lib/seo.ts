/**
 * Returns the Google JSON-LD schema for a Person representation (Portfolio Homepage).
 */
export function getPersonSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dhyey Bhuva",
    "url": baseUrl,
    "image": `${baseUrl}/dhyey.png`,
    "sameAs": [
      "https://github.com/DhyeyBhuva2003",
      "https://www.linkedin.com/in/dhyeybhuva/",
      "https://www.upwork.com/freelancers/~01d4c44951f41c2c1d",
    ],
    "jobTitle": "Staff Software Engineer & Solutions Architect",
    "knowsAbout": [
      "Software Architecture",
      "Next.js",
      "TypeScript",
      "MongoDB Database Design",
      "Cloud Infrastructure",
      "Autonomous AI Agents",
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance Services & Technical Consulting",
    },
  };
}

/**
 * Returns the Google JSON-LD schema for a Blog article representation.
 */
export function getBlogPostingSchema(blog: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | string;
  imageUrl?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.com";
  const publishedDate = new Date(blog.publishedAt).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.description,
    "image": blog.imageUrl || `${baseUrl}/next.svg`,
    "datePublished": publishedDate,
    "author": {
      "@type": "Person",
      "name": "Dhyey Bhuva",
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dhyey Bhuva Portal",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/next.svg`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${blog.slug}`,
    },
  };
}
