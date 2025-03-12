"use client";

import { Toaster } from "sonner";

export default function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #F3F4F6",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
          borderRadius: "0.5rem",
        },
        success: {
          style: {
            borderLeft: "4px solid #10B981",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid #EF4444",
          },
        },
        warning: {
          style: {
            borderLeft: "4px solid #F59E0B",
          },
        },
        info: {
          style: {
            borderLeft: "4px solid #3B82F6",
          },
        },
      }}
      closeButton
      richColors
    />
  );
}
