import Navbar from "../components/Navbar";
import type { ReactNode } from "react";
import { useWallet } from "../contexts/WalletContext";
import Landing from "../components/Landing";
import { useLocation } from "react-router-dom";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const { isLoggedIn } = useWallet();
  const location = useLocation();
  const isPublicDemoRoute = location.pathname === "/demo";

  if (isLoggedIn || isPublicDemoRoute) {
    return (
      <div className="min-h-screen bg-transparent text-white">
        {isLoggedIn && <Navbar />}
        <main className="px-2 md:px-6 py-4 md:py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return <Landing />;
}
