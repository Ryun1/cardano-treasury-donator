"use client";

export interface Notice {
  id: number;
  message: string;
  createdAt: number;
}

interface NoticeBannerProps {
  notices: Notice[];
  onDismiss: (id: number) => void;
}

export default function NoticeBanner({ notices, onDismiss }: NoticeBannerProps) {
  if (notices.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {notices.map((notice) => (
        <button
          key={notice.id}
          onClick={() => onDismiss(notice.id)}
          className="flex items-start gap-2 border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 animate-in fade-in duration-300 text-left font-mono w-full cursor-pointer hover:bg-yellow-500/15 transition-colors"
        >
          <span className="font-bold shrink-0">[!]</span>
          <span>{notice.message}</span>
        </button>
      ))}
    </div>
  );
}
