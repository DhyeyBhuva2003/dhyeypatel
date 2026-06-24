"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Code, 
  List, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff,
  Sparkles,
  FileCode
} from "lucide-react";
import MarkdownRenderer from "../MarkdownRenderer";

interface FormMarkdownEditorProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  rows?: number;
}

export const FormMarkdownEditor: React.FC<FormMarkdownEditorProps> = ({
  name,
  label,
  description,
  placeholder = "Write content details using Markdown...",
  rows = 12
}) => {
  const {
    register,
    control,
    setValue,
    formState: { errors }
  } = useFormContext();

  const value = useWatch({ control, name }) || "";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  const { ref: registerRef, ...registerRest } = register(name);

  const setRefs = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    registerRef(el);
  };

  const handleInsert = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selection = text.substring(start, end);
    const replacement = before + (selection || "text") + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue(name, newValue, { shouldDirty: true, shouldValidate: true });

    // Re-focus and set selection range
    setTimeout(() => {
      textarea.focus();
      const selectionStart = start + before.length;
      const selectionEnd = selectionStart + (selection || "text").length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  };

  // Word count and Character count
  const charCount = value.length;
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const toolbarButtonClass = "p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer select-none";

  const editorContainerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-zinc-950 p-6 flex flex-col space-y-4 animate-fadeIn"
    : "border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/20 flex flex-col";

  return (
    <div className="space-y-1.5 w-full flex flex-col">
      <div className="flex justify-between items-center select-none">
        {label && (
          <label className="block text-[11px] font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          <span>{wordCount} words</span>
          <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          <span>{charCount} chars</span>
        </div>
      </div>

      <div className={editorContainerClass}>
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 select-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleInsert("**", "**")}
              className={toolbarButtonClass}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert("*", "*")}
              className={toolbarButtonClass}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert("[", "](url)")}
              className={toolbarButtonClass}
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert("`", "`")}
              className={toolbarButtonClass}
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert("```\n", "\n```")}
              className={toolbarButtonClass}
              title="Code Block"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert("- ", "")}
              className={toolbarButtonClass}
              title="List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {previewMode ? (
                <>
                  <EyeOff className="w-3 h-3" /> <span>Editor Only</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> <span>Split Preview</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={toolbarButtonClass}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Input/Preview Split Area */}
        <div className={`grid ${previewMode ? "grid-cols-1 md:grid-cols-2 border-t border-transparent" : "grid-cols-1"} flex-1 min-h-[240px]`}>
          <textarea
            id={name}
            ref={setRefs}
            {...registerRest}
            placeholder={placeholder}
            className={`w-full p-4 text-xs font-mono leading-relaxed bg-white/40 dark:bg-zinc-950/40 text-zinc-900 dark:text-white focus:outline-none resize-none ${
              isFullscreen ? "h-full" : ""
            } ${previewMode ? "border-r border-zinc-200 dark:border-zinc-800" : ""}`}
            style={isFullscreen ? { flex: 1 } : { height: `${rows * 20}px` }}
          />

          {previewMode && (
            <div className={`w-full p-6 bg-zinc-50/10 dark:bg-zinc-900/10 overflow-y-auto scrollbar-thin select-text ${
              isFullscreen ? "h-full" : ""
            }`} style={isFullscreen ? {} : { height: `${rows * 20}px` }}>
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 italic text-xs gap-1">
                  <Sparkles className="w-4 h-4 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                  <span>Real-time split rendering preview appears here...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {description && !errorMessage && (
        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold select-none">
          {description}
        </p>
      )}

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-black tracking-tight animate-fadeIn select-none">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormMarkdownEditor;
