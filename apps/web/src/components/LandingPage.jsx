import { useState, useEffect } from "react";

export default function LandingPage() {
  const [cigars, setCigars] = useState([]);
  const [cigarLoading, setCigarLoading] = useState(true);

  useEffect(() => {
    fetchCigars();
  }, []);

  const fetchCigars = async () => {
    try {
      const response = await fetch('/api/cigars');
      if (response.ok) {
        const data = await response.json();
        setCigars(data.cigars || []);
      }
    } catch (error) {
      console.error('Error fetching cigars:', error);
      setCigars([]);
    } finally {
      setCigarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1012] text-white">
      {/* Header */}
      <header className="bg-[#1A1C1F] border-b border-[#2A2D32]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#C6A15B] rounded-lg flex items-center justify-center">
              <span className="text-[#0F1012] font-bold text-lg">🚬</span>
            </div>
            <h1 className="text-2xl font-bold text-white">CigarTracker</h1>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/account/signin"
              className="text-[#C7CBD1] hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="bg-[#C6A15B] text-[#0F1012] px-4 py-2 rounded-lg font-medium hover:bg-[#D4B36A] transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Track Your Cigar Journey
        </h2>
        <p className="text-xl text-[#C7CBD1] mb-8 max-w-2xl mx-auto">
          Discover new cigars, manage your humidor, connect with fellow
          enthusiasts, and never forget a great smoke again.
        </p>

        <div className="flex justify-center space-x-4">
          <a
            href="/account/signup"
            className="bg-[#C6A15B] text-[#0F1012] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#D4B36A] transition-colors"
          >
            Get Started Free
          </a>
          <a
            href="/account/signin"
            className="border border-[#C6A15B] text-[#C6A15B] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#C6A15B] hover:text-[#0F1012] transition-colors"
          >
            Sign In
          </a>
        </div>
      </section>

      {/* Featured Cigars */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          Popular Cigars in Our Database
        </h3>

        {cigarLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#1A1C1F] rounded-xl p-6 animate-pulse"
              >
                <div className="h-32 bg-[#2A2D32] rounded-lg mb-4" />
                <div className="h-4 bg-[#2A2D32] rounded mb-2" />
                <div className="h-3 bg-[#2A2D32] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cigars.slice(0, 8).map((cigar) => (
              <div
                key={cigar.id}
                className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6 hover:border-[#C6A15B] transition-colors"
              >
                <div className="h-32 bg-[#2A2D32] rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🚬</span>
                </div>
                <h4 className="font-semibold text-white mb-1">{cigar.brand}</h4>
                <p className="text-[#C7CBD1] text-sm mb-2">
                  {cigar.line} - {cigar.vitola}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      cigar.strength === "mild"
                        ? "bg-green-900 text-green-300"
                        : cigar.strength === "medium"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-red-900 text-red-300"
                    }`}
                  >
                    {cigar.strength?.toUpperCase()}
                  </span>
                  {cigar.average_rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-[#C6A15B] text-sm">
                        ★ {cigar.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-[#1A1C1F] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">
            Everything You Need to Track Your Cigars
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#C6A15B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Mobile App
              </h4>
              <p className="text-[#C7CBD1]">
                Track your cigars on the go with our beautiful mobile app. Scan,
                review, and manage your collection anywhere.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#C6A15B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Digital Humidor
              </h4>
              <p className="text-[#C7CBD1]">
                Keep track of your entire collection, purchase dates, aging, and
                estimated values in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#C6A15B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Reviews & Ratings
              </h4>
              <p className="text-[#C7CBD1]">
                Rate and review every cigar you smoke. Build your personal
                tasting notes and discover new favorites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1012] border-t border-[#2A2D32] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#9CA3AF]">
            © 2024 CigarTracker. Built for cigar enthusiasts, by cigar
            enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}