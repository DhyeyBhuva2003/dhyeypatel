"use client";

import React, { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

interface MarkdownRendererProps {
  content: string;
}

interface BlockToken {
  type: "h1" | "h2" | "h3" | "h4" | "code" | "blockquote" | "list" | "paragraph" | "hr";
  text?: string;
  code?: string;
  language?: string;
  items?: string[];
  ordered?: boolean;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const tokens = tokenizeMarkdown(content);

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-800 dark:text-zinc-200 leading-relaxed">
      {tokens.map((token, index) => {
        switch (token.type) {
          case "h1":
            return (
              <h1
                key={index}
                className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-10 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2"
              >
                {renderInline(token.text || "")}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={index}
                className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-8 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-1"
              >
                {renderInline(token.text || "")}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={index}
                className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mt-6 mb-3"
              >
                {renderInline(token.text || "")}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={index}
                className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mt-5 mb-2"
              >
                {renderInline(token.text || "")}
              </h4>
            );
          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 px-6 py-4 my-6 rounded-r-lg italic text-zinc-700 dark:text-zinc-300"
              >
                {renderInline(token.text || "")}
              </blockquote>
            );
          case "code":
            return (
              <CodeBlock
                key={index}
                code={token.code || ""}
                language={token.language || "text"}
              />
            );
          case "list":
            const ListTag = token.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`list-outside pl-6 my-4 space-y-2 ${
                  token.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {token.items?.map((item, idx) => (
                  <li key={idx} className="text-zinc-700 dark:text-zinc-300">
                    {renderInline(item)}
                  </li>
                ))}
              </ListTag>
            );
          case "hr":
            return (
              <hr
                key={index}
                className="my-8 border-zinc-200 dark:border-zinc-800"
              />
            );
          case "paragraph":
          default:
            // Don't render empty paragraphs
            if (!token.text?.trim()) return null;
            return (
              <p
                key={index}
                className="text-zinc-700 dark:text-zinc-300 leading-8 text-base md:text-lg"
              >
                {renderInline(token.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// CodeBlock Client component with copy-paste functionality
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="relative group my-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-sm shadow-md">
      {/* Codeblock header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-400">
        <span className="font-sans uppercase font-semibold text-purple-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded bg-zinc-800 px-2.5 py-1 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          {copied ? (
            <>
              <FaCheck className="text-green-400" /> Copied
            </>
          ) : (
            <>
              <FaCopy /> Copy
            </>
          )}
        </button>
      </div>

      {/* Code scroll area */}
      <pre className="overflow-x-auto p-4 leading-6 whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Tokenize markdown string into block tokens
 */
function tokenizeMarkdown(md: string): BlockToken[] {
  const lines = md.split(/\r?\n/);
  const tokens: BlockToken[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Blocks
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({
        type: "code",
        code: codeLines.join("\n"),
        language: language || "text",
      });
      i++;
      continue;
    }

    // 2. Horizontal Rules
    if (line.trim() === "---" || line.trim() === "___" || line.trim() === "***") {
      tokens.push({ type: "hr" });
      i++;
      continue;
    }

    // 3. Headers
    if (line.startsWith("# ")) {
      tokens.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      tokens.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      tokens.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("#### ")) {
      tokens.push({ type: "h4", text: line.slice(5).trim() });
      i++;
      continue;
    }

    // 4. Blockquotes
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [line.trim().slice(1).trim()];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().slice(1).trim());
        i++;
      }
      tokens.push({
        type: "blockquote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    // 5. Lists (unordered starts with *, -, +; ordered starts with numbers)
    const ulMatch = line.match(/^(\s*)([\*\-\+])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (ulMatch || olMatch) {
      const isOrdered = !!olMatch;
      const items: string[] = [];

      while (i < lines.length) {
        const itemLine = lines[i];
        const nextUlMatch = itemLine.match(/^(\s*)([\*\-\+])\s+(.*)$/);
        const nextOlMatch = itemLine.match(/^(\s*)(\d+)\.\s+(.*)$/);

        if (isOrdered && nextOlMatch) {
          items.push(nextOlMatch[3].trim());
        } else if (!isOrdered && nextUlMatch) {
          items.push(nextUlMatch[3].trim());
        } else if (itemLine.trim() === "") {
          // Allow single blank line in lists, but check if next line is a list item
          if (i + 1 < lines.length) {
            const lookaheadLine = lines[i + 1];
            const lookaheadUl = lookaheadLine.match(/^(\s*)([\*\-\+])\s+(.*)$/);
            const lookaheadOl = lookaheadLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
            if ((isOrdered && lookaheadOl) || (!isOrdered && lookaheadUl)) {
              i++;
              continue;
            }
          }
          break;
        } else {
          break;
        }
        i++;
      }

      tokens.push({
        type: "list",
        items,
        ordered: isOrdered,
      });
      continue;
    }

    // 6. Default: Paragraph (accumulate lines until blank line or other block element)
    if (line.trim() !== "") {
      const paragraphLines: string[] = [line];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (
          nextLine.trim() === "" ||
          nextLine.trim().startsWith("```") ||
          nextLine.trim().startsWith("#") ||
          nextLine.trim().startsWith(">") ||
          nextLine.trim().startsWith("-") ||
          nextLine.trim().startsWith("*") ||
          nextLine.match(/^(\s*)(\d+)\.\s+(.*)$/)
        ) {
          break;
        }
        paragraphLines.push(nextLine);
        i++;
      }
      tokens.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Render inline elements recursively
 * Bold: **bold**
 * Italic: *italic*
 * Inline code: `code`
 * Links: [text](href)
 */
function renderInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  // Regex patterns
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const boldRegex = /\*\*([^*]+)\*\*/;
  const italicRegex = /\*([^*]+)\*/;
  const codeRegex = /`([^`]+)`/;

  let workingText = text;

  while (workingText.length > 0) {
    // Find first occurrence of any pattern
    const linkMatch = workingText.match(linkRegex);
    const boldMatch = workingText.match(boldRegex);
    const italicMatch = workingText.match(italicRegex);
    const codeMatch = workingText.match(codeRegex);

    const matches = [
      { type: "link", match: linkMatch },
      { type: "bold", match: boldMatch },
      { type: "italic", match: italicMatch },
      { type: "code", match: codeMatch },
    ].filter((m) => m.match && m.match.index !== undefined);

    if (matches.length === 0) {
      elements.push(<span key={keyIdx++}>{workingText}</span>);
      break;
    }

    // Sort by earliest match index
    matches.sort((a, b) => (a.match!.index || 0) - (b.match!.index || 0));
    const first = matches[0];
    const matchIndex = first.match!.index || 0;

    // Push preceding text
    if (matchIndex > 0) {
      elements.push(<span key={keyIdx++}>{workingText.slice(0, matchIndex)}</span>);
    }

    // Push matched element
    const fullMatchText = first.match![0];
    if (first.type === "link") {
      const linkText = first.match![1];
      const linkHref = first.match![2];
      elements.push(
        <a
          key={keyIdx++}
          href={linkHref}
          target={linkHref.startsWith("http") ? "_blank" : "_self"}
          rel={linkHref.startsWith("http") ? "noopener noreferrer" : ""}
          className="text-purple-600 dark:text-purple-400 font-medium hover:underline hover:text-purple-700 dark:hover:text-purple-300"
        >
          {linkText}
        </a>
      );
    } else if (first.type === "bold") {
      const boldText = first.match![1];
      elements.push(
        <strong key={keyIdx++} className="font-bold text-zinc-950 dark:text-white">
          {boldText}
        </strong>
      );
    } else if (first.type === "italic") {
      const italicText = first.match![1];
      elements.push(
        <em key={keyIdx++} className="italic">
          {italicText}
        </em>
      );
    } else if (first.type === "code") {
      const codeText = first.match![1];
      elements.push(
        <code
          key={keyIdx++}
          className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 font-mono text-sm text-purple-600 dark:text-purple-400 font-semibold"
        >
          {codeText}
        </code>
      );
    }

    workingText = workingText.slice(matchIndex + fullMatchText.length);
  }

  return elements;
}
