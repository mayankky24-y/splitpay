import {
  Zap,
  ArrowRight,
  Upload,
  Sparkles,
  Shield,
  Globe,
  Users,
  Receipt,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";

const BUTTON_GRADIENT =
  "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500";
const BUTTON_BASE =
  "text-white shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95";
const TEXT_GRADIENT =
  "bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent";

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const { connectWallet, isAuthLoading } = useWallet();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async () => {
    await connectWallet();
  };

  const LoadingSpinner = () => (
    <svg
      className="mr-2 size-4 sm:size-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden">
      <header className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <nav
          className={`flex justify-between items-center max-w-7xl mx-auto ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <img
                className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-400 animate-spin"
                style={{ animationDuration: "3s" }}
                src="https://rcxelnfhvbqszzccltry.supabase.co/storage/v1/object/sign/logo/SplitChain.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MDYxNWEyMi0yMDRlLTQzYzMtYjgwNy1lYTllZGI1YjgzMTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL1NwbGl0Q2hhaW4ucG5nIiwiaWF0IjoxNzU0MzczNzA1LCJleHAiOjE4MTc0NDU3MDV9.3w7qGG5bAaOJS4b6aTUc_gR3HutrmWRoXIVIDrgoys0"
                alt=""
              />
              <div className="absolute inset-0 bg-fuchsia-400 blur-md opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-200 to-purple-100 bg-clip-text text-transparent">
              SplitPay
            </h1>
          </div>
          <button
            onClick={connectWallet}
            disabled={isAuthLoading}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base ${BUTTON_BASE} ${BUTTON_GRADIENT} shadow-lg hover:shadow-sm ${
              isAuthLoading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              {isAuthLoading ? (
                <LoadingSpinner />
              ) : (
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">
                {isAuthLoading ? "Connecting..." : "Connect HashPack"}
              </span>
              <span className="sm:hidden">
                {isAuthLoading ? "..." : "Connect"}
              </span>
            </div>
          </button>
        </nav>
      </header>

      <section className="relative z-10 px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className={TEXT_GRADIENT}>Split Bills</span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                with Crypto
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Revolutionary bill splitting powered by Hedera HBAR. Upload
              receipts, let AI handle the OCR, and split payments seamlessly
              with your friends.
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-500 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <button
              onClick={handleLogin}
              disabled={isAuthLoading}
              className={`group px-8 sm:px-12 py-4 sm:py-6 rounded-full font-bold text-lg sm:text-xl hover:shadow-sm hover:shadow-purple-400/30 ${BUTTON_BASE} ${BUTTON_GRADIENT} ${
                isAuthLoading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                {isAuthLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="text-base sm:text-lg">
                      Connecting Wallet...
                    </span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 px-2">
              <span className={TEXT_GRADIENT}>How It Works</span>
            </h3>
            <p className="text-slate-300 text-base sm:text-lg px-4">
              Simple, secure, and seamless bill splitting in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Upload,
                title: "Upload Receipt",
                description:
                  "Snap a photo or upload your bill. Our AI OCR technology instantly reads and processes all items.",
                gradient: "from-purple-800/40 to-purple-700/40",
                iconBg: "from-purple-600 to-purple-700",
                borderColor: "border-purple-500/30",
              },
              {
                icon: Users,
                title: "Assign Items",
                description:
                  "Choose who pays for what with our intuitive interface. Split items among multiple people effortlessly.",
                gradient: "from-purple-800/40 to-purple-700/40",
                iconBg: "from-purple-600 to-purple-700",
                borderColor: "border-purple-500/30",
              },
              {
                icon: Wallet,
                title: "Pay with HBAR",
                description:
                  "Secure payments using Hedera HBAR cryptocurrency through your connected HashPack wallet.",
                gradient: "from-purple-800/40 to-purple-700/40",
                iconBg: "from-purple-600 to-purple-700",
                borderColor: "border-purple-500/30",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${
                    feature.gradient
                  } border ${
                    feature.borderColor
                  } transition-all duration-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <div className="relative mb-6 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.iconBg} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-purple-100 text-center">
                    {feature.title}
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-center text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 px-2">
              <span className={TEXT_GRADIENT}>Why Choose SplitPay?</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Shield,
                title: "Secure",
                desc: "Blockchain-powered security",
                gradient: "from-purple-700/30 to-purple-900/30",
                iconColor: "text-purple-300",
                borderColor: "border-purple-400/20",
              },
              {
                icon: Zap,
                title: "Fast",
                desc: "Instant OCR processing",
                gradient: "from-purple-700/30 to-purple-900/30",
                iconColor: "text-purple-300",
                borderColor: "border-purple-400/20",
              },
              {
                icon: Globe,
                title: "Decentralized",
                desc: "Built on Hedera network",
                gradient: "from-purple-700/30 to-purple-900/30",
                iconColor: "text-purple-300",
                borderColor: "border-purple-400/20",
              },
              {
                icon: Sparkles,
                title: "Smart",
                desc: "AI-powered receipt reading",
                gradient: "from-purple-700/30 to-purple-900/30",
                iconColor: "text-purple-300",
                borderColor: "border-purple-400/20",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className={`group p-4 sm:p-6 rounded-xl bg-gradient-to-br ${
                    benefit.gradient
                  } backdrop-blur-sm border ${
                    benefit.borderColor
                  } text-center transition-all duration-400 hover:scale-105 hover:shadow-xl delay-${
                    1200 + index * 200
                  } ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${benefit.iconColor} mx-auto mb-3 sm:mb-4 group-hover:animate-pulse`}
                  />
                  <h4 className="font-bold text-purple-100 mb-2 text-sm sm:text-base">
                    {benefit.title}
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-1500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-800/30 to-purple-700/30 backdrop-blur-sm border border-purple-400/30 relative overflow-hidden">
            <div className="relative z-10">
              <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-purple-300 mx-auto mb-4 sm:mb-6 animate-bounce" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-200 to-purple-300 bg-clip-text text-transparent px-2">
                Ready to Split Smart?
              </h3>
              <p className="text-slate-200 text-base sm:text-lg mb-6 sm:mb-8 px-4">
                Join the future of bill splitting with cryptocurrency payments
              </p>
              <button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className={`group px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-purple-400/30 ${BUTTON_BASE} ${BUTTON_GRADIENT} ${
                  isAuthLoading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {isAuthLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Splitting Now</span>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
        <div
          className={`max-w-6xl mx-auto text-center transition-all duration-1000 delay-1700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="relative">
              <img
                className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-400 animate-spin"
                style={{ animationDuration: "3s" }}
                src="https://rcxelnfhvbqszzccltry.supabase.co/storage/v1/object/sign/logo/SplitChain.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MDYxNWEyMi0yMDRlLTQzYzMtYjgwNy1lYTllZGI1YjgzMTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL1NwbGl0Q2hhaW4ucG5nIiwiaWF0IjoxNzU0MzczNzA1LCJleHAiOjE4MTc0NDU3MDV9.3w7qGG5bAaOJS4b6aTUc_gR3HutrmWRoXIVIDrgoys0"
                alt=""
              />
              <div className="absolute inset-0 bg-fuchsia-400 blur-md opacity-50 animate-pulse"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-200 to-purple-300 bg-clip-text text-transparent">
              SplitPay
            </span>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">
            Powered by Hedera Network • Built for the Future
          </p>
        </div>
      </footer>
    </div>
  );
}
