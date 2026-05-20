export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-start md:items-center justify-center p-4 pt-4 md:p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-6 md:p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          When Does My Kid Dance? 💃
        </h1>
        <p className="text-l text-gray-600 mb-8">
          Quickly find your dancer's schedule at the competition
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/search"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
          >
            Search for a Dancer
          </a>
          <a
            href="/schedule"
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
          >
            Browse Full Schedule
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-left">
            <h3 className="text-base font-bold text-purple-800 mb-2">
              🔍 Search for a Dancer
            </h3>
            <p className="text-sm text-gray-700">
              Find all performances for specific dancers. See their schedule
              with day, time, room, and awards. Perfect for tracking multiple
              kids!
            </p>
          </div>
          <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4 text-left">
            <h3 className="text-base font-bold text-pink-800 mb-2">
              📅 Browse Full Schedule
            </h3>
            <p className="text-sm text-gray-700">
              View all routines filtered by day, room, or age group. Great for
              studios to see their full lineup or plan your day.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left">
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
      </div>
    </div>
  );
}
