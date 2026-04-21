import { LogOut, Plus, Receipt, Users, Menu, X } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import InboxBell from "./InboxBell";

export default function Navbar() {
  const { balance, disconnectWallet, isAuthLoading } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getActiveTab = () => {
    if (location.pathname === "/new-bill") return "new-bill";
    if (
      location.pathname === "/friends" ||
      location.pathname === "/manage-friends"
    )
      return "friends";
    if (
      location.pathname === "/created-bills" ||
      location.pathname === "/assign-participants/:billId"
    )
      return "created-bills";
    if (location.pathname === "/participated-bills")
      return "participated-bills";
    return "";
  };

  const activeTab = getActiveTab();

  const handleLogout = async () => {
    await disconnectWallet();
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToNewBill = () => {
    navigate("/new-bill");
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToFriends = () => {
    navigate("/friends");
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToCreatedBill = () => {
    navigate("/created-bills");
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToParticipatedBills = () => {
    navigate("/participated-bills");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const LoadingSpinner = () => (
    <svg className="mr-2 size-5 animate-spin" viewBox="0 0 24 24" fill="none">
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

  const navItems = [
    {
      id: "new-bill",
      label: "New Bill",
      icon: Plus,
      onClick: handleNavigateToNewBill,
      shortLabel: "New",
    },
    {
      id: "friends",
      label: "Manage Friends",
      icon: Users,
      onClick: handleNavigateToFriends,
      shortLabel: "Friends",
    },
    {
      id: "created-bills",
      label: "Created Bills",
      icon: Receipt,
      onClick: handleNavigateToCreatedBill,
      shortLabel: "Created",
    },
    {
      id: "participated-bills",
      label: "Participated Bills",
      icon: Receipt,
      onClick: handleNavigateToParticipatedBills,
      shortLabel: "Participated",
    },
  ];

  return (
    <>
      <header
        className={`relative z-50 px-4 sm:px-6 py-4 border-purple-700/50 ${
          isMobileMenuOpen ? "" : "backdrop-blur-sm"
        }`}
      >
        <nav
          className={`flex justify-between items-center max-w-7xl mx-auto ${
            isMobileMenuOpen ? "hidden" : ""
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
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

          <div className="hidden xl:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`relative flex items-center space-x-2 px-2 py-3 transition-all duration-300 cursor-pointer group ${
                    activeTab === item.id
                      ? "text-white"
                      : "text-purple-300 hover:text-purple-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <div
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-purple-400 transition-all duration-300 ${
                      activeTab === item.id
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></div>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex xl:hidden items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`relative flex items-center space-x-1 px-2 py-3 transition-all duration-300 cursor-pointer group text-sm whitespace-nowrap ${
                    activeTab === item.id
                      ? "text-white"
                      : "text-purple-300 hover:text-purple-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.shortLabel}</span>
                  <div
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-purple-400 transition-all duration-300 ${
                      activeTab === item.id
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <InboxBell />

            <div className="hidden lg:block text-right cursor-default">
              <div className="text-xs sm:text-sm text-purple-200">Balance</div>
              <div className="font-semibold text-fuchsia-400 flex items-center text-sm sm:text-base">
                {balance?.hbars ? (
                  `${balance.hbars}`
                ) : (
                  <>
                    <svg
                      className="mr-1 sm:mr-2 size-3 sm:size-5 animate-spin"
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
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isAuthLoading}
              className={`hidden lg:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 rounded-lg transition-all duration-300 border border-purple-500/30 cursor-pointer hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 text-sm ${
                isAuthLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isAuthLoading ? (
                <LoadingSpinner />
              ) : (
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden md:inline">
                {isAuthLoading ? "" : "Disconnect"}
              </span>
            </button>

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-purple-300 hover:text-purple-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 animate-in fade-in duration-300"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-purple-900/95 to-slate-900/95 border-l border-purple-500/30 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 animate-in slide-in-from-top duration-500 delay-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-purple-300 hover:text-white transition-colors hover:rotate-90 duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 mb-8">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 animate-in slide-in-from-right delay-${
                        200 + index * 100
                      } ${
                        activeTab === item.id
                          ? "bg-purple-600/40 text-white border border-purple-500/50 scale-105"
                          : "text-purple-300 hover:text-white hover:bg-purple-600/20 hover:scale-105"
                      }`}
                      style={{
                        animationDelay: `${200 + index * 100}ms`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-purple-800/30 rounded-lg p-4 mb-6 border border-purple-500/30 animate-in slide-in-from-bottom delay-700">
                <div className="text-sm text-purple-200 mb-1">
                  Wallet Balance
                </div>
                <div className="font-semibold text-fuchsia-400 flex items-center">
                  {balance?.hbars ? (
                    `${balance.hbars}`
                  ) : (
                    <>
                      <svg
                        className="mr-2 size-4 animate-spin"
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
                      Loading...
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isAuthLoading}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-400/50 hover:scale-105 animate-in slide-in-from-bottom delay-800 ${
                  isAuthLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isAuthLoading ? (
                  <LoadingSpinner />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>
                  {isAuthLoading ? "Disconnecting..." : "Disconnect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
