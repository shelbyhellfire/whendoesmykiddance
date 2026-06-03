"use client";

import { useState } from "react";

interface CopyLinkButtonProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function CopyLinkButton({
  variant = "default",
  className = "",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all whitespace-nowrap ${
          copied
            ? "bg-green-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
        } ${className}`}
      >
        {copied ? (
          <>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
        copied
          ? "bg-green-500 text-white"
          : "bg-purple-600 text-white hover:bg-purple-700"
      } ${className}`}
    >
      {copied ? (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy Link
        </>
      )}
    </button>
  );
}
