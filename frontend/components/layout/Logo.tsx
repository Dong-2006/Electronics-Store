import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Dùng khi header đang ở chế độ trong suốt (nền tối) */
  light?: boolean;
  className?: string;
  iconSize?: number;
}

/**
 * ElectroHub Logo
 * Icon: bolt/circuit hình học + wordmark "ElectroHub"
 */
export function Logo({ light = false, className, iconSize = 36 }: LogoProps) {
  return (
    <Link href="/" className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}>
      {/* ── Icon mark ── */}
      <LogoIcon size={iconSize} />

      {/* ── Wordmark ── */}
      <span
        className={cn(
          "text-xl font-black tracking-tight transition-colors duration-200",
          light
            ? "text-white group-hover:text-blue-300"
            : "text-slate-900 group-hover:text-blue-700"
        )}
      >
        Electro
        <span
          className={cn(
            "transition-colors duration-200",
            light ? "text-blue-400" : "text-blue-600"
          )}
        >
          Hub
        </span>
      </span>
    </Link>
  );
}

/** Standalone SVG icon — reusable */
export function LogoIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 group-hover:scale-105", className)}
      aria-hidden="true"
    >
      {/* ── Defs: gradients ── */}
      <defs>
        <linearGradient id="logoGradBg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="logoGradBolt" x1="12" y1="3" x2="24" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="60%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id="logoGradAccent" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" />
          <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background rounded square ── */}
      <rect width="36" height="36" rx="10" fill="url(#logoGradBg)" />

      {/* ── Subtle inner shine ── */}
      <rect x="0" y="0" width="36" height="18" rx="10" fill="white" fillOpacity="0.07" />

      {/* ── Circuit dots (decorative) ── */}
      <circle cx="6"  cy="6"  r="1.2" fill="#60A5FA" fillOpacity="0.6" />
      <circle cx="30" cy="6"  r="1.2" fill="#60A5FA" fillOpacity="0.6" />
      <circle cx="6"  cy="30" r="1.2" fill="#60A5FA" fillOpacity="0.4" />
      <circle cx="30" cy="30" r="1.2" fill="#60A5FA" fillOpacity="0.4" />

      {/* ── Horizontal circuit lines (subtle) ── */}
      <line x1="7.2" y1="6" x2="11" y2="6" stroke="#60A5FA" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="25" y1="6" x2="28.8" y2="6" stroke="#60A5FA" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* ── Bolt / lightning ── */}
      {/*
        Bolt path: đi từ trên phải → giữa → dưới trái
        Thiết kế 2 phần: thân trên và thân dưới với offset ngang
      */}
      <path
        d="M21 4L11.5 19H18L15 32L25.5 17H19L21 4Z"
        fill="url(#logoGradBolt)"
        filter="url(#logoGlow)"
      />
    </svg>
  );
}
