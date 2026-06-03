import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-start justify-center md:pt-8">
      <div className="max-w-2xl w-full bg-white md:rounded-lg shadow-2xl p-6 md:p-12 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
          When Does My Kid Dance?
        </h1>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 flex flex-col">
            <Link
              href="/search"
              className="text-xl font-bold text-purple-700 hover:text-purple-900 underline decoration-2 underline-offset-4 transition duration-200 text-center mb-4 cursor-pointer"
            >
              Search for Dancers
            </Link>
            <p className="text-sm text-gray-700 text-center">
              Find all performances for specific dancers. See their schedule
              with day, time, room, and awards. Perfect for tracking multiple
              kids!
            </p>
          </div>
          <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 flex flex-col">
            <Link
              href="/schedule"
              className="text-xl font-bold text-pink-700 hover:text-pink-900 underline decoration-2 underline-offset-4 transition duration-200 text-center mb-4 cursor-pointer"
            >
              Browse Full Schedule
            </Link>
            <p className="text-sm text-gray-700 text-center">
              View all routines filtered by day, room, or age group. Great for
              studios to see their full lineup or plan your day.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Features:
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Color-coded dancers when searching multiple kids</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Awards ceremony times shown with each routine</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Filter by day, room, age group, and category</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>View routine details, dancer lists, and more</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600">
            ⚠️ Schedule information is provided as-is. Please verify all times,
            locations, and routine details with official competition materials.
            We are not responsible for schedule changes, errors, or omissions.
          </p>
        </div>
      </div>
    </div>
  );
}
