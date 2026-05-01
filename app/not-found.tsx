import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found - AirportMatrix",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fa] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#6366f1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-[#6366f1]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
          Try searching for an airport or browsing our parking directory.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/airports"
            className="inline-block px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Airports
          </Link>
        </div>
      </div>
    </div>
  );
}
