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

        <div className="bg-gray-50 rounded-lg p-6 text-left">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            How it works:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Search for your dancer's name</li>
            <li>
              View all their dances with day, time, room, and routine number
            </li>
            <li>Never miss a performance!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
