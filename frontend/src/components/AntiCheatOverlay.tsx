"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

interface AntiCheatOverlayProps {
  status: "active" | "warning" | "violation";
  message?: string;
}

export default function AntiCheatOverlay({
  status = "active",
  message,
}: AntiCheatOverlayProps) {
  if (status === "active") {
    return (
      <div
        id="proctoring-badge"
        className="absolute top-4 right-4 z-[100] flex items-center gap-2 bg-green-50 border border-green-200 text-success px-3 py-1.5 rounded-sm text-xs font-headline font-semibold pointer-events-none"
      >
        <ShieldCheck className="w-4 h-4" />
        Proctoring Active
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col pt-20 px-4">
      <div
        id="proctoring-alert"
        className={`mx-auto max-w-sm w-full p-4 rounded-sm border ${
          status === "warning"
            ? "bg-yellow-50 border-yellow-300 text-yellow-900"
            : "bg-red-50 border-red-300 text-red-900"
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 shrink-0 ${
              status === "warning" ? "text-warning" : "text-danger"
            }`}
          />
          <div>
            <h4
              className={`font-headline font-bold text-sm ${
                status === "warning" ? "text-warning" : "text-danger"
              }`}
            >
              {status === "warning"
                ? "Proctoring Warning"
                : "Proctoring Violation"}
            </h4>
            <p className="font-body text-xs mt-1 leading-relaxed">
              {message ||
                "No face detected. Please ensure you are visible in the camera frame."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
