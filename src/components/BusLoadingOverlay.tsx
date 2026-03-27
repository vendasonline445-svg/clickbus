import { useEffect, useState } from "react";

interface BusLoadingOverlayProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export default function BusLoadingOverlay({
  message = "Reservando seu assento",
  duration = 2200,
  onComplete,
}: BusLoadingOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-12 py-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Purple bus SVG */}
        <div className="animate-bounce">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="10" width="80" height="40" rx="12" fill="#8629cc" />
            <path d="M30 10 Q30 0 50 0 L70 0 Q90 0 90 10" fill="#8629cc" />
            <rect x="75" y="15" width="20" height="18" rx="4" fill="#e9d5ff" opacity="0.7" />
            <rect x="30" y="15" width="12" height="12" rx="3" fill="#e9d5ff" opacity="0.5" />
            <rect x="48" y="15" width="12" height="12" rx="3" fill="#e9d5ff" opacity="0.5" />
            <rect x="18" y="48" width="84" height="6" rx="3" fill="#6b1fb3" />
            <circle cx="40" cy="58" r="10" fill="#333" />
            <circle cx="40" cy="58" r="5" fill="#666" />
            <circle cx="40" cy="58" r="2" fill="#999" />
            <circle cx="80" cy="58" r="10" fill="#333" />
            <circle cx="80" cy="58" r="5" fill="#666" />
            <circle cx="80" cy="58" r="2" fill="#999" />
            <rect x="96" y="35" width="6" height="8" rx="2" fill="#fbbf24" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-800">{message}</p>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#8629cc] animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-[#8629cc] animate-pulse" style={{ animationDelay: "200ms" }} />
          <span className="h-2 w-2 rounded-full bg-[#8629cc] animate-pulse" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}