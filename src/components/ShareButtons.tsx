"use client";

import React, { useState } from "react";
import { FaTwitter, FaLinkedin, FaLink, FaCheck } from "react-icons/fa";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-text-sub font-bold uppercase tracking-wider pr-1">Share</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl border border-border-main hover:bg-bg-sub text-text-sub hover:text-brand-primary transition flex items-center justify-center cursor-pointer"
        title="Share on Twitter"
      >
        <FaTwitter size={13} />
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl border border-border-main hover:bg-bg-sub text-text-sub hover:text-brand-primary transition flex items-center justify-center cursor-pointer"
        title="Share on LinkedIn"
      >
        <FaLinkedin size={13} />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="p-2 rounded-xl border border-border-main hover:bg-bg-sub text-text-sub hover:text-brand-primary transition flex items-center justify-center cursor-pointer"
        title="Copy Link"
      >
        {copied ? <FaCheck size={13} className="text-brand-success" /> : <FaLink size={13} />}
      </button>
    </div>
  );
}
