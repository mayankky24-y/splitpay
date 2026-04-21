import Navbar from "../components/Navbar";
import type { ReactNode } from "react";
import { useWallet } from "../contexts/WalletContext";
import Landing from "../components/Landing";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const { isLoggedIn } = useWallet();

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-transparent text-white">
        <Navbar />
        <main className="px-2 md:px-6 py-4 md:py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return <Landing />;
}
