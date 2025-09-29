import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0F1012] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1A1C1F] p-8 shadow-2xl border border-[#2A2D32]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Sign Out
          </h1>
          <p className="text-[#C7CBD1] text-sm">Are you sure you want to leave?</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-[#C6A15B] px-4 py-3 text-base font-semibold text-[#0F1012] transition-all hover:bg-[#D4B36A] focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:ring-offset-2 focus:ring-offset-[#1A1C1F]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;