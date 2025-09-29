import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0F0F0F] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-[#1A1A1A] p-8 shadow-2xl border border-[#242424]"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Join the Community
          </h1>
          <p className="text-[#B0B0B0] text-sm">
            Create your cigar enthusiast account
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#B0B0B0]">
              Email
            </label>
            <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0F0F0F] px-4 py-3 focus-within:border-[#D4B896] focus-within:ring-1 focus-within:ring-[#D4B896]">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg outline-none text-white placeholder-[#6B7280]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#B0B0B0]">
              Password
            </label>
            <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0F0F0F] px-4 py-3 focus-within:border-[#D4B896] focus-within:ring-1 focus-within:ring-[#D4B896]">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg outline-none text-white placeholder-[#6B7280]"
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#D4B896] px-4 py-3 text-base font-semibold text-[#0F0F0F] transition-all hover:bg-[#E4C8A6] focus:outline-none focus:ring-2 focus:ring-[#D4B896] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-[#D4B896] hover:text-[#E4C8A6] font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
