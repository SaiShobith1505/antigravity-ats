"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumeTemplatePdf } from "./ResumeTemplatePdf";
import { ResumeData } from "@/lib/db";
import { Download } from "lucide-react";

interface PDFDownloadButtonProps {
  data: ResumeData;
  isPaid: boolean;
  userEmail?: string | null;
  template?: "classic" | "minimal" | "technical";
  resumeId: string;
  onDownloadConsumed: () => void;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  data, 
  isPaid, 
  userEmail, 
  template = "classic",
  resumeId,
  onDownloadConsumed
}) => {
  const isAdmin = userEmail === "admin@cvboost.co";

  const handleDownloadClick = async () => {
    if (isAdmin) return;
    try {
      await fetch("/api/payment/consume-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId }),
      });
      // Allow 2 seconds for browser download buffer to spin up before re-locking UI
      setTimeout(() => {
        onDownloadConsumed();
      }, 2000);
    } catch (err) {
      console.error("[DOWNLOAD] Error invalidating payment session:", err);
    }
  };

  if (!isPaid && !isAdmin) {
    return (
      <div className="p-3.5 bg-red-950/20 border border-red-800/40 text-red-400 rounded-xl text-xs font-bold font-mono tracking-wide uppercase flex items-center space-x-2">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span>Bypass Scan Error: Unpaid PDF compilation blocked.</span>
      </div>
    );
  }
  return (
    <div className="inline-block">
      <PDFDownloadLink
        document={<ResumeTemplatePdf data={data} template={template} />}
        fileName={`${data.personal.fullName.replace(/\s+/g, "_")}_ATS_Resume.pdf`}
      >
        {({ loading }) => (
          <button
            disabled={loading}
            onClick={handleDownloadClick}
            className="px-6 py-3 text-xs font-black rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
                <span>Download Selectable PDF</span>
              </>
            )}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
};
export default PDFDownloadButton;
