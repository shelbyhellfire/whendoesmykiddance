import Link from "next/link";

interface BreadcrumbProps {
  href: string;
  label: string;
  icon?: "back" | "forward";
  className?: string;
}

export default function Breadcrumb({
  href,
  label,
  icon,
  className = "",
}: BreadcrumbProps) {
  const renderIcon = () => {
    if (icon === "back") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      );
    }
    if (icon === "forward") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <Link
      href={href}
      className={`text-xs md:text-sm font-semibold text-purple-600 hover:text-purple-800 underline decoration-2 underline-offset-2 flex items-center gap-1 transition-colors ${className}`}
    >
      {icon === "back" && renderIcon()}
      {label}
      {icon === "forward" && renderIcon()}
    </Link>
  );
}
