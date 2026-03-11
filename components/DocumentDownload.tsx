"use client";

type DocumentDownloadProps = {
  href: string;
  label: string;
  type?: "pdf" | "excel";
};

export function DocumentDownload({
  href,
  label,
  type = "pdf",
}: DocumentDownloadProps) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-md border border-[#0a192f]/12 bg-[#0a192f] px-4 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-emerald hover:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:ring-offset-2 focus:ring-offset-[#faf9f7]"
    >
      {type === "pdf" && (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 9h6M9 13h6M9 17h4"
          />
        </svg>
      )}
      {type === "excel" && (
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <span>{label}</span>
    </a>
  );
}
