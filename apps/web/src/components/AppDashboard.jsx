import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function AppDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [cigars, setCigars] = useState([]);
  const [cigarLoading, setCigarLoading] = useState(true);
  const [humidor, setHumidor] = useState([]);
  const [humidorLoading, setHumidorLoading] = useState(true);

  useEffect(() => {
    fetchCigars();
    fetchHumidor();
  }, []);

  const fetchCigars = async () => {
    try {
      const response = await fetch("/api/cigars?limit=6");
      if (response.ok) {
        const data = await response.json();
        setCigars(data.cigars || []);
      }
    } catch (error) {
      console.error("Error fetching cigars:", error);
    } finally {
      setCigarLoading(false);
    }
  };

  const fetchHumidor = async () => {
    try {
      const response = await fetch("/api/humidor");
      if (response.ok) {
        const data = await response.json();
        setHumidor(data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching humidor:", error);
    } finally {
      setHumidorLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

          <div className="flex items-center space-x-4">
            <span className="text-[#C7CBD1]">Welcome back, {user?.name}!</span>
            <a
              href="/account/logout"
              className="bg-[#C6A15B] text-[#0F1012] px-4 py-2 rounded-lg font-medium hover:bg-[#D4B36A] transition-colors"
            >
              Sign Out
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#C7CBD1] text-sm">My Humidor</p>
                <p className="text-2xl font-bold text-white">
                  {humidor.reduce(
                    (sum, entry) => sum + (entry.quantity || 0),
                    0,
                  )}
                </p>
                <p className="text-[#9CA3AF] text-xs">
                  {humidor.length} different cigars
                </p>
              </div>
              <div className="w-12 h-12 bg-[#C6A15B] bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#C7CBD1] text-sm">Total Cigars</p>
                <p className="text-2xl font-bold text-white">{cigars.length}</p>
                <p className="text-[#9CA3AF] text-xs">in database</p>
              </div>
              <div className="w-12 h-12 bg-[#C6A15B] bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚬</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#C7CBD1] text-sm">Reviews Written</p>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-[#9CA3AF] text-xs">this month</p>
              </div>
              <div className="w-12 h-12 bg-[#C6A15B] bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Humidor */}
          <div className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Humidor</h2>
              <button className="text-[#C6A15B] hover:text-[#D4B36A] text-sm font-medium">
                View All
              </button>
            </div>

            {humidorLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg animate-pulse"
                  >
                    <div className="w-12 h-12 bg-[#2A2D32] rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#2A2D32] rounded mb-2"></div>
                      <div className="h-3 bg-[#2A2D32] rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : humidor.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#2A2D32] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-[#C7CBD1] mb-2">Your humidor is empty</p>
                <p className="text-[#9CA3AF] text-sm">
                  Add some cigars to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {humidor.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center space-x-3 p-3 hover:bg-[#2A2D32] rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#2A2D32] rounded-lg flex items-center justify-center">
                      <span className="text-lg">🚬</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {entry.cigar?.brand}
                      </p>
                      <p className="text-[#C7CBD1] text-sm">
                        {entry.cigar?.vitola} • Qty: {entry.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Cigars */}
          <div className="bg-[#1A1C1F] border border-[#2A2D32] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Popular Cigars</h2>
              <button className="text-[#C6A15B] hover:text-[#D4B36A] text-sm font-medium">
                Browse All
              </button>
            </div>

            {cigarLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg animate-pulse"
                  >
                    <div className="w-12 h-12 bg-[#2A2D32] rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#2A2D32] rounded mb-2"></div>
                      <div className="h-3 bg-[#2A2D32] rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {cigars.slice(0, 5).map((cigar) => (
                  <div
                    key={cigar.id}
                    className="flex items-center space-x-3 p-3 hover:bg-[#2A2D32] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-[#2A2D32] rounded-lg flex items-center justify-center">
                      <span className="text-lg">🚬</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{cigar.brand}</p>
                      <p className="text-[#C7CBD1] text-sm">
                        {cigar.line} • {cigar.vitola}
                      </p>
                    </div>
                    {cigar.average_rating > 0 && (
                      <div className="text-[#C6A15B] text-sm">
                        ★ {Number(cigar.average_rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-[#C6A15B] text-[#0F1012] p-4 rounded-xl font-medium hover:bg-[#D4B36A] transition-colors">
            <div className="text-2xl mb-2">📱</div>
            Scan Cigar
          </button>
          <button className="bg-[#1A1C1F] border border-[#2A2D32] text-white p-4 rounded-xl font-medium hover:border-[#C6A15B] transition-colors">
            <div className="text-2xl mb-2">✍️</div>
            Write Review
          </button>
          <button className="bg-[#1A1C1F] border border-[#2A2D32] text-white p-4 rounded-xl font-medium hover:border-[#C6A15B] transition-colors">
            <div className="text-2xl mb-2">📦</div>
            Add to Humidor
          </button>
          <button
            onClick={() =>
              alert(
                "Use the mobile app to search for nearby cigar lounges and shops!",
              )
            }
            className="bg-[#1A1C1F] border border-[#2A2D32] text-white p-4 rounded-xl font-medium hover:border-[#C6A15B] transition-colors hover:bg-[#2A2D32]"
          >
            <div className="text-2xl mb-2">🗺️</div>
            Find Cigar Venues
          </button>
        </div>
      </div>
    </div>
  );
}
