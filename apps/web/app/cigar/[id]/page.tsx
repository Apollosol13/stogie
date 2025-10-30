'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, Edit, Star } from 'lucide-react';
import StarRating from '@/components/StarRating';

export default function CigarDetailPage() {
  return (
    <ProtectedRoute>
      <CigarDetailContent />
    </ProtectedRoute>
  );
}

function CigarDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const [cigar, setCigar] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCigarData();
    }
  }, [params.id]);

  const loadCigarData = async () => {
    try {
      setLoading(true);
      const [cigarData, reviewsData] = await Promise.all([
        apiRequest(`/api/cigars?id=${params.id}`, { method: 'GET' }, jwt),
        apiRequest(`/api/reviews/cigar/${params.id}`, { method: 'GET' }, jwt),
      ]);

      if (cigarData.success && cigarData.cigars && cigarData.cigars.length > 0) {
        setCigar(cigarData.cigars[0]);
      }

      if (reviewsData.success) {
        setReviews(reviewsData.reviews || []);
        const myReview = (reviewsData.reviews || []).find(
          (r: any) => r.user_id === jwt
        );
        setUserReview(myReview);
      }
    } catch (error) {
      console.error('Failed to load cigar data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold"></div>
      </div>
    );
  }

  if (!cigar) {
    return (
      <div className="min-h-screen bg-bgPrimary flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Cigar Not Found</h2>
        <p className="text-textSecondary mb-8">This cigar doesn't exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-accentGold text-bgPrimary rounded-full font-semibold hover:bg-opacity-90 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Header */}
      <header className="bg-bgPrimary border-b border-white/[0.08] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-textSecondary hover:text-textPrimary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-textPrimary">Cigar Details</h1>
            <button className="text-textSecondary hover:text-textPrimary transition-colors">
              <Edit size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Cigar Image & Basic Info */}
        <div className="bg-surface rounded-2xl overflow-hidden border border-white/[0.08] mb-6">
          <div className="aspect-[16/9] bg-surface2 relative">
            <img
              src={cigar.image_url || 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&fit=crop'}
              alt={`${cigar.brand} ${cigar.line}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-textPrimary mb-1">
                  {cigar.brand}
                </h2>
                {cigar.line && (
                  <p className="text-xl text-textSecondary mb-1">{cigar.line}</p>
                )}
                {cigar.vitola && (
                  <p className="text-lg text-textTertiary">{cigar.vitola}</p>
                )}
              </div>
              
              {cigar.strength && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cigar.strength.toLowerCase() === 'mild' ? 'bg-accentGreen/20 text-accentGreen' :
                  cigar.strength.toLowerCase() === 'medium' ? 'bg-accentGold/20 text-accentGold' :
                  'bg-accentRed/20 text-accentRed'
                }`}>
                  {cigar.strength}
                </span>
              )}
            </div>

            {cigar.average_rating > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={Math.round(cigar.average_rating)} size={20} />
                <span className="text-textSecondary">
                  {cigar.average_rating.toFixed(1)} ({cigar.total_reviews} {cigar.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Specifications */}
            <div className="border-t border-white/[0.08] pt-4">
              <h3 className="text-textPrimary font-semibold mb-3">Specifications</h3>
              <div className="space-y-2">
                {cigar.length_inches && (
                  <InfoRow label="Length" value={`${cigar.length_inches}"`} />
                )}
                {cigar.ring_gauge && (
                  <InfoRow label="Ring Gauge" value={cigar.ring_gauge} />
                )}
                {cigar.wrapper && (
                  <InfoRow label="Wrapper" value={cigar.wrapper} />
                )}
                {cigar.binder && (
                  <InfoRow label="Binder" value={cigar.binder} />
                )}
                {cigar.filler && (
                  <InfoRow label="Filler" value={cigar.filler} />
                )}
                {cigar.origin_country && (
                  <InfoRow label="Origin" value={cigar.origin_country} />
                )}
              </div>
            </div>

            {/* Description */}
            {cigar.description && (
              <div className="border-t border-white/[0.08] pt-4 mt-4">
                <h3 className="text-textPrimary font-semibold mb-2">Description</h3>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {cigar.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Review Section */}
        <div className="bg-surface rounded-2xl p-6 border border-white/[0.08] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-textPrimary font-semibold text-lg">My Review</h3>
            <button className="text-accentGold text-sm font-semibold hover:text-opacity-80 transition-all">
              {userReview ? 'Edit Review' : 'Add Review'}
            </button>
          </div>

          {userReview ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <StarRating rating={userReview.rating} size={16} />
                <span className="text-textSecondary text-sm">
                  {new Date(userReview.created_at).toLocaleDateString()}
                </span>
              </div>
              {userReview.title && (
                <h4 className="text-textPrimary font-semibold mb-2">{userReview.title}</h4>
              )}
              {userReview.review_text && (
                <p className="text-textSecondary text-sm leading-relaxed">
                  {userReview.review_text}
                </p>
              )}
            </div>
          ) : (
            <p className="text-textTertiary text-sm italic">
              You haven't reviewed this cigar yet. Tap "Add Review" to share your thoughts!
            </p>
          )}
        </div>

        {/* Community Reviews */}
        <div className="bg-surface rounded-2xl p-6 border border-white/[0.08]">
          <h3 className="text-textPrimary font-semibold text-lg mb-4">
            Community Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-textTertiary text-center py-8">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className="text-textPrimary font-medium">{value}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  const router = useRouter();
  
  const handleProfileClick = () => {
    if (review.user_id) {
      router.push(`/user/${review.user_id}`);
    }
  };
  
  return (
    <div className="border-b border-white/[0.08] pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={handleProfileClick}
          className="text-textPrimary font-semibold hover:text-accentGold transition-colors"
        >
          {review.display_name || review.user_name || 'Anonymous'}
        </button>
        <StarRating rating={review.rating} size={12} />
      </div>
      
      {review.title && (
        <h4 className="text-textPrimary font-semibold mb-2 text-sm">{review.title}</h4>
      )}
      
      {review.review_text && (
        <p className="text-textSecondary text-sm leading-relaxed mb-2">
          {review.review_text}
        </p>
      )}
      
      <div className="flex items-center gap-2 text-xs text-textTertiary">
        <span>{new Date(review.created_at).toLocaleDateString()}</span>
        {review.pairing && (
          <>
            <span>•</span>
            <span>Paired with {review.pairing}</span>
          </>
        )}
      </div>
    </div>
  );
}

