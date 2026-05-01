import Link from "next/link";

interface InfoPageShellProps {
  children: React.ReactNode;
  title?: string;
}

export function InfoPageShell({ children, title }: InfoPageShellProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            {title && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">{title}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </>
  );
}
