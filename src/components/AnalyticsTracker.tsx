"use client";

import { useEffect } from "react";
import {
  trackPortfolioView,
  trackProjectView,
  trackBlogView,
  trackServiceView,
} from "@/lib/analytics";

interface AnalyticsTrackerProps {
  type: "portfolio" | "project" | "blog" | "service";
  params?: {
    slug?: string;
    name?: string;
  };
}

export default function AnalyticsTracker({ type, params }: AnalyticsTrackerProps) {
  useEffect(() => {
    if (type === "portfolio") {
      trackPortfolioView();
    } else if (type === "project" && params?.slug && params?.name) {
      trackProjectView(params.slug, params.name);
    } else if (type === "blog" && params?.slug && params?.name) {
      trackBlogView(params.slug, params.name);
    } else if (type === "service" && params?.slug && params?.name) {
      trackServiceView(params.slug, params.name);
    }
  }, [type, params]);

  return null;
}
