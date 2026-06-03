import Link from "next/link";

interface BreadcrumbLink {
  href: string;
  label: string;
  icon?: "back" | "forward";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  leftLink?: BreadcrumbLink;
  rightLink?: BreadcrumbLink;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  leftLink,
  rightLink,
  children,
}: PageHeaderProps) {
  const renderIcon = (icon?: "back" | "forward") => {
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
    <div className="bg-white rounded-lg shadow-xl p-3 mt-4 md:p-8 mb-6">
      {/* Breadcrumb Navigation */}
      {(leftLink || rightLink) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {leftLink ? (
            <Link
              href={leftLink.href}
              className="text-xs md:text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              {renderIcon(leftLink.icon)}
              {leftLink.label}
            </Link>
          ) : (
            <div />
          )}
          {rightLink && (
            <Link
              href={rightLink.href}
              className="text-xs md:text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              {rightLink.label}
              {renderIcon(rightLink.icon)}
            </Link>
          )}
        </div>
      )}

      {/* Title and Description */}
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-3">
        {title}
      </h1>
      {description && <p className="text-gray-600 mb-6">{description}</p>}

      {/* Additional Content */}
      {children}
    </div>
  );
}
