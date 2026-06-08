"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface WhatsAppShareButtonProps {
  recordType: "challan" | "cash-memo" | "entry" | "summary" | "delivery-statement" | "shipment" | "invoice";
  recordId: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function WhatsAppShareButton({
  recordType,
  recordId,
  label = "Share",
  className = "",
  size = "sm",
}: WhatsAppShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<{ publicUrl: string; message: string } | null>(null);

  const handleGenerate = async () => {
    if (!recordId) {
      toast.error("No record ID provided");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/share/generate-link", { recordType, recordId });
      if (data.success) {
        setShareData(data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate share link");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    setShareData(null);
    setPhone("");
    await handleGenerate();
  };

  const handleSend = () => {
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const withCC = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    const msg = shareData?.message || "";
    const waUrl = `https://wa.me/${withCC}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyLink = () => {
    if (shareData?.publicUrl) {
      navigator.clipboard.writeText(shareData.publicUrl);
      toast.success("Link copied!");
    }
  };

  const sizeClasses = size === "sm"
    ? "h-8 px-2.5 text-xs gap-1.5"
    : "h-9 px-3 text-sm gap-2";

  return (
    <>
      {/* WhatsApp Button */}
      <button
        onClick={handleOpen}
        className={`inline-flex items-center font-semibold rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-all duration-200 shadow-md hover:shadow-[#25D366]/30 ${sizeClasses} ${className}`}
        title="Share via WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {label}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-10">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-[#25D366]/10 to-transparent">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Share via WhatsApp</h3>
                <p className="text-slate-400 text-xs mt-0.5">Send document directly to a contact</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-6 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#25D366]" />
                  <span className="text-sm">Generating secure document link...</span>
                </div>
              )}

              {/* Document link preview */}
              {!loading && shareData && (
                <>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Document Link</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#25D366] font-mono flex-1 truncate">{shareData.publicUrl}</p>
                      <button
                        onClick={handleCopyLink}
                        className="shrink-0 text-[10px] px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">WhatsApp Message Preview</p>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {shareData.message}
                    </pre>
                  </div>

                  {/* Phone input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-[#25D366]/50 transition-colors">
                      <span className="text-slate-400 text-sm font-mono">+91</span>
                      <div className="w-px h-4 bg-slate-700" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600 font-mono"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors border border-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      className="flex-1 h-10 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Open WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
