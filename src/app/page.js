import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="w-full border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-sky-900">TripCraft</span>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/login" className="text-sky-700 hover:text-sky-900">Sign In</Link>
            <Link href="/signup" className="bg-sky-600 text-white px-4 py-1.5 rounded-lg hover:bg-sky-700 transition-colors">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-sky-900 mb-6 leading-tight">
            Plan your adventures.
            <br />
            <span className="text-sky-600">Travel with confidence.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            TripCraft helps you organize every detail of your trip — itineraries,
            flights, budgets, maps, and more — all in one beautiful place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-sky-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200">
              Get Started
            </Link>
            <Link href="/login" className="border-2 border-sky-200 text-sky-700 px-8 py-3 rounded-lg text-base font-semibold hover:bg-sky-50 transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-sky-900 mb-2">Day-by-Day Itineraries</h3>
            <p className="text-sm text-slate-500">
              Plan every day of your trip with timed activities, themed days, and
              a calendar overview.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-sky-900 mb-2">Budget Tracking</h3>
            <p className="text-sm text-slate-500">
              Track costs across flights, lodging, food, and activities with
              multi-currency support.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-sky-900 mb-2">AI Trip Insights</h3>
            <p className="text-sm text-slate-500">
              Get smart suggestions for activities, schedule optimization, and
              local tips powered by AI.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-sky-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          © 2026 TripCraft — Plan your adventures. Track every detail. Travel with confidence.
        </div>
      </footer>
    </div>
  );
}
