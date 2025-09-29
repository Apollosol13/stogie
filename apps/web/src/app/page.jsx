import useUser from "@/utils/useUser";
import AppDashboard from "@/components/AppDashboard";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const { data: user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is authenticated, show the app dashboard
  // If not authenticated, show the marketing landing page
  return user ? <AppDashboard /> : <LandingPage />;
}