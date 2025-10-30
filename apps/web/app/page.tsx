'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating';
import { Cigarette, MapPin, Users, Camera, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, signIn, signUp, signOut } = useAuth();

  // Redirect authenticated users to feed
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/feed');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Header */}
      <header className="border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cigarette size={32} className="text-accentGold" />
              <h1 className="text-2xl font-bold text-textPrimary">
                Stogie Social
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-8 text-textSecondary">
                <a href="#" className="hover:text-accentGold transition-colors">Feed</a>
                <a href="#" className="hover:text-accentGold transition-colors">Humidor</a>
                <a href="#" className="hover:text-accentGold transition-colors">Map</a>
                <a href="#" className="hover:text-accentGold transition-colors">Profile</a>
              </nav>
              
              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-textSecondary">
                    <User size={20} />
                    <span className="hidden sm:inline">{user?.username || user?.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] text-textSecondary hover:text-accentGold hover:border-accentGold/30 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={signIn}
                    className="px-4 py-2 text-textPrimary hover:text-accentGold transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={signUp}
                    className="px-6 py-2 bg-accentGold text-bgPrimary rounded-full font-semibold hover:bg-opacity-90 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-textPrimary mb-4">
            Track. Review. Connect.
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            The premier social platform for cigar enthusiasts. Document your collection, 
            discover new cigars, and connect with fellow aficionados.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-surface rounded-2xl p-8 border border-white/[0.08] hover:border-accentGold/30 transition-colors">
            <div className="bg-surface2 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Camera className="text-accentGold" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-3">
              Digital Humidor
            </h3>
            <p className="text-textSecondary">
              Track your entire collection with photos, ratings, and detailed notes. 
              Never forget a great smoke.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-8 border border-white/[0.08] hover:border-accentGold/30 transition-colors">
            <div className="bg-surface2 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="text-accentGold" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-3">
              Find Venues
            </h3>
            <p className="text-textSecondary">
              Discover cigar lounges, shops, and smoking-friendly venues near you. 
              See what others are smoking.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-8 border border-white/[0.08] hover:border-accentGold/30 transition-colors">
            <div className="bg-surface2 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Users className="text-accentGold" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-3">
              Social Feed
            </h3>
            <p className="text-textSecondary">
              Share your experiences, follow friends, and engage with a passionate 
              community of cigar lovers.
            </p>
          </div>
        </div>

        {/* Example Rating Card */}
        <div className="bg-surface rounded-2xl p-8 border border-white/[0.08] max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-textPrimary mb-2">
            Rate Your Cigars
          </h3>
          <p className="text-textSecondary mb-6">
            Share detailed reviews with our intuitive rating system
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">Overall Rating</span>
              <StarRating rating={4} size={24} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">Construction</span>
              <StarRating rating={5} size={20} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">Draw</span>
              <StarRating rating={4} size={20} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">Flavor</span>
              <StarRating rating={5} size={20} />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-textPrimary mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-textSecondary mb-8">
            Download the Stogie Social app and join our community
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/feed">
                <button className="bg-accentGold text-bgPrimary px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all">
                  Open Web App
                </button>
              </Link>
            ) : (
              <>
                <button 
                  onClick={signUp}
                  className="bg-accentGold text-bgPrimary px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all"
                >
                  Get Started
                </button>
                <button className="bg-surface text-textPrimary px-8 py-4 rounded-full font-semibold border border-white/[0.08] hover:border-accentGold/30 transition-all">
                  Download iOS App
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] mt-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-textTertiary text-sm">
              © 2025 Stogie Social. All rights reserved.
            </p>
            <div className="flex gap-6 text-textSecondary text-sm">
              <a href="#" className="hover:text-accentGold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accentGold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accentGold transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
