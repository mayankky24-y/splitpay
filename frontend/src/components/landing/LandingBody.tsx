import { useState } from "react";
import { WalletService } from "../../services/walletService";
import { UserService } from "../../services/userService";

function LandingBody() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<{
    hbars: string;
  }>();

  const connectWallet = async () => {
    await WalletService.init();

    const checkConnected = setInterval(async () => {
      console.log("Checking connection...", WalletService.isConnected());
      if (WalletService.isConnected()) {
        const id = WalletService.getAccountId();
        setAccountId(id);
        WalletService.checkBalance().then((res) => setBalance(res));

        try {
          const res = await UserService.registerUser({
            wallet_address: id!,
          });
          console.log("Registered: ", res.message);
        } catch (err) {
          console.log("Register Failed: ", err);
        }
        clearInterval(checkConnected);
      }
    }, 500);
  };

  const disconnect = async () => {
    await WalletService.disconnect();
    if (!WalletService.isConnected()) {
      setAccountId(null);
    }
  };

  const transfer = async () => {
    WalletService.checkBalance().then((res) => setBalance(res));
  };

  return (
    <div>
      <h1>test</h1>
      {accountId ? (
        <p>
          Wallet Connected: <strong>{accountId}</strong>
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={transfer}>Transfer</button>
          {balance && <>Balance: {balance.hbars}</>}
        </p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default LandingBody;
