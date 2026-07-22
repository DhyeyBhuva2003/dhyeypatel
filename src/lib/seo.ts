/**
 * Default Base URL for canonical URLs & Structured Data
 */
const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

/**
 * Returns the Google JSON-LD schema for a Person representation (Portfolio Homepage).
 */
export function getPersonSchema() {
  const baseUrl = getBaseUrl();

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
    "jobTitle": "Full Stack Developer & Software Architect",
    "knowsAbout": [
      "Software Architecture",
      "Next.js & React",
      "TypeScript",
      "MongoDB Database Engineering",
      "Cloud Infrastructure",
      "Autonomous AI Agents",
      "REST & GraphQL APIs",
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance Engineering & Technical Consulting",
      "url": baseUrl,
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
  const baseUrl = getBaseUrl();
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
      "name": "Dhyey Bhuva",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/dhyey.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${blog.slug}`,
    },
  };
}

/**
 * Returns Google JSON-LD schema for a Professional Service representation.
 */
export function getServiceSchema(service: {
  title: string;
  description: string;
  slug: string;
  price?: string;
  features?: string[];
  updatedAt?: Date | string;
}) {
  const baseUrl = getBaseUrl();
  const serviceUrl = `${baseUrl}/services/${service.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": serviceUrl,
    "name": service.title,
    "serviceType": service.title,
    "description": service.description,
    "url": serviceUrl,
    "provider": {
      "@type": "Person",
      "name": "Dhyey Bhuva",
      "jobTitle": "Full Stack Developer & Technical Consultant",
      "url": baseUrl,
      "image": `${baseUrl}/dhyey.png`,
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide",
    },
    "offers": service.price
      ? {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": service.price.replace(/[^0-9.]/g, "") || "0",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": service.price.replace(/[^0-9.]/g, "") || "0",
            "priceCurrency": "USD",
            "valueAddedTaxIncluded": "false",
          },
          "description": `Starting investment for ${service.title}: ${service.price}`,
          "url": serviceUrl,
        }
      : undefined,
    "hasOfferCatalog":
      service.features && service.features.length > 0
        ? {
            "@type": "OfferCatalog",
            "name": `${service.title} Deliverables & Included Features`,
            "itemListElement": service.features.map((feature, idx) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": feature,
              },
              "position": idx + 1,
            })),
          }
        : undefined,
  };
}

/**
 * Returns Google JSON-LD schema for a list/catalog of professional services.
 */
export function getServicesListSchema(
  services: Array<{ title: string; description: string; slug: string; price?: string }>
) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Freelance Development & Technical Consulting Services",
    "description": "Custom Next.js web application development, SaaS platform MVP engineering, system architecture, database optimization, and performance audits.",
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "url": `${baseUrl}/services/${service.slug}`,
      },
    })),
  };
}

/**
 * Returns Google JSON-LD schema for a Project case study representation.
 */
export function getProjectSchema(project: {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  technologies?: string[];
  demoUrl?: string;
  githubUrl?: string;
  clientName?: string;
  createdAt?: Date | string;
}) {
  const baseUrl = getBaseUrl();
  const projectUrl = `${baseUrl}/portfolio/${project.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": projectUrl,
    "name": project.title,
    "headline": project.title,
    "description": project.description,
    "url": projectUrl,
    "image": project.imageUrl || `${baseUrl}/dhyey.png`,
    "applicationCategory": project.category || "DeveloperApplication",
    "operatingSystem": "Web Browser, Node.js",
    "author": {
      "@type": "Person",
      "name": "Dhyey Bhuva",
      "url": baseUrl,
    },
    "sameAs": [project.demoUrl, project.githubUrl].filter(Boolean) as string[],
  };
}

/**
 * Returns Google JSON-LD schema for a list/catalog of portfolio projects.
 */
export function getProjectsListSchema(
  projects: Array<{ title: string; description: string; slug: string; category?: string }>
) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Portfolio & Software Engineering Case Studies",
    "description": "Featured full-stack web applications, SaaS platform MVPs, and software engineering case studies shipped by Dhyey Bhuva.",
    "itemListElement": projects.map((project, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": project.title,
        "description": project.description,
        "url": `${baseUrl}/portfolio/${project.slug}`,
      },
    })),
  };
}

/**
 * Returns Google JSON-LD BreadcrumbList schema for SEO rich snippet breadcrumbs.
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${baseUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}


