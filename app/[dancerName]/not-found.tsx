import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Dancer Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find any dances for this dancer. Please check the name
              and try again.
            </p>
            <div className="inline-block">
              <Breadcrumb
                href="/search"
                label="Back to Search"
                icon="back"
                className="text-base px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 no-underline"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
