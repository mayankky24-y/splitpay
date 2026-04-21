import React, { createContext, useContext, useEffect, useState } from "react";
import { WalletService } from "../services/walletService";
import { UserService } from "../services/userService";
import { useNavigate } from "react-router-dom";

interface WalletContextType {
  accountId: string | null;
  balance: { hbars: string } | null;
  isLoggedIn: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isAuthLoading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  accountId: null,
  balance: null,
  isLoggedIn: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isAuthLoading: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<{ hbars: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("wallet_account_id") !== null
  );
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && location.pathname === "/") {
      navigate("/new-bill");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    const initializeWallet = async () => {
      const storedAccountId = localStorage.getItem("wallet_account_id");

      if (storedAccountId) {
        setIsAuthLoading(true);
        try {
          await WalletService.init();

          if (WalletService.isConnected()) {
            const currentId = WalletService.getAccountId();

            if (currentId === storedAccountId) {
              setAccountId(currentId);
              setIsLoggedIn(true);

              const balanceRes = await WalletService.checkBalance();
              setBalance(balanceRes);
            } else {
              localStorage.removeItem("wallet_account_id");
            }
          } else {
            localStorage.removeItem("wallet_account_id");
          }
        } catch (error) {
          console.error("Error initializing wallet:", error);
          localStorage.removeItem("wallet_account_id");
        } finally {
          setIsAuthLoading(false);
        }
      }
    };

    initializeWallet();
  }, []);

  const connectWallet = async () => {
    setIsAuthLoading(true);

    try {
      await WalletService.init();

      let retry = 0;
      const maxRetries = 10;

      const checkConnected = setInterval(async () => {
        if (WalletService.isConnected()) {
          const id = WalletService.getAccountId();

          if (id) {
            setAccountId(id);
            setIsLoggedIn(true);
            try {
              const balanceRes = await WalletService.checkBalance();
              setBalance(balanceRes);
            } catch (error) {
              console.error("Error fetching balancesss:", error);
            }

            try {
              await UserService.registerUser({
                wallet_address: id,
              });
            } catch (err) {
              console.log("User register failed:", err);
            }

            navigate("/new-bill");
          }

          clearInterval(checkConnected);
          setIsAuthLoading(false);
        } else {
          retry++;
          if (retry >= maxRetries) {
            console.error("Wallet connection timeout.");
            clearInterval(checkConnected);
            setIsAuthLoading(false);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsAuthLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsAuthLoading(true);

    try {
      await WalletService.disconnect();

      setAccountId(null);
      setBalance(null);
      setIsLoggedIn(false);
      localStorage.removeItem("wallet_account_id");

      navigate("/");
    } catch (err) {
      console.error("Error disconnecting wallet:", err);

      setAccountId(null);
      setBalance(null);
      setIsLoggedIn(false);
      localStorage.removeItem("wallet_account_id");

      navigate("/");
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accountId,
        balance,
        isLoggedIn,
        connectWallet,
        disconnectWallet,
        isAuthLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
