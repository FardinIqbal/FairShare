"use client";

import { useState } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
}

// Simple QR code display using a free API
export function QRCode({ value, size = 128 }: QRCodeProps) {
  const [showModal, setShowModal] = useState(false);

  // Use QR Server API (free, no rate limits)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000`;
  const largeQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="block p-2 bg-white rounded-lg hover:shadow-md transition-shadow"
        title="Click to enlarge"
      >
        <img
          src={qrUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded"
        />
      </button>

      {/* Modal for large QR code */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--background-elevated)] rounded-xl p-8 shadow-2xl max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-2">
                Scan to Join
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Point your camera at this QR code
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg mx-auto w-fit">
              <img
                src={largeQrUrl}
                alt="QR Code"
                width={300}
                height={300}
                className="rounded"
              />
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface InviteQRCodeProps {
  inviteCode: string;
  baseUrl?: string;
}

export function InviteQRCode({ inviteCode, baseUrl }: InviteQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${baseUrl || "https://fairshare.vercel.app"}/invite/${inviteCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = inviteUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <QRCode value={inviteUrl} size={100} />
      </div>

      <div className="bg-[var(--background)] rounded-md p-3 border border-[var(--border)]">
        <code className="text-xs text-[var(--foreground-secondary)] break-all block">
          {inviteUrl}
        </code>
      </div>

      <button
        onClick={copyLink}
        className="w-full py-2 text-sm border border-[var(--border)] rounded-md hover:border-[var(--accent)] transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[var(--success)]">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[var(--foreground-secondary)]">Copy invite link</span>
          </>
        )}
      </button>
    </div>
  );
}
