import {
  AccountBalanceQuery,
  AccountId,
  Client,
  LedgerId,
  TransferTransaction,
} from "@hashgraph/sdk";
import {
  HashConnect,
  HashConnectConnectionState,
  type SessionData,
} from "hashconnect";

const appMetadata = {
  name: "SplitPay",
  description: "Your Split Bills With Crypto",
  icons: [
    "/splitpay.png",
  ],
  url: "http://localhost:5173/",
};

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const adminId = import.meta.env.VITE_ADMIN_ID!;

let hashconnect: HashConnect;
let state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
let pairingData: SessionData | null = null;

export const WalletService = {
  async init() {
    hashconnect = new HashConnect(
      LedgerId.TESTNET,
      projectId,
      appMetadata,
      true
    );

    this.setUpHashConnectEvents();

    await hashconnect.init();

    if (!hashconnect.connectedAccountIds[0]) {
      hashconnect.openPairingModal();
    }
  },

  setUpHashConnectEvents() {
    hashconnect.pairingEvent.on((newPairing) => {
      pairingData = newPairing;
      localStorage.setItem("wallet_account_id", newPairing.accountIds[0]);
    });

    hashconnect.disconnectionEvent.on(() => {
      state = HashConnectConnectionState.Disconnected;
      pairingData = null;
    });

    hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
      state = connectionStatus;
    });
  },

  async disconnect() {
    await hashconnect.disconnect();
  },

  getAccountId(): string | null {
    return pairingData?.accountIds[0] ?? null;
  },

  isConnected(): boolean {
    return state === HashConnectConnectionState.Paired && pairingData !== null;
  },

  async sendTransaction(
    toAddress: string,
    amount: number,
    serviceCharge: number
  ): Promise<string | null> {
    const accountIdStr = this.getAccountId();
    if (accountIdStr !== null) {
      const accountId = AccountId.fromString(accountIdStr);
      const signer = hashconnect.getSigner(accountId);

      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, -(amount + serviceCharge))
        .addHbarTransfer(AccountId.fromString(adminId), serviceCharge)
        .addHbarTransfer(toAddress, amount)
        .freezeWithSigner(signer);

      const response = await transaction.executeWithSigner(signer);
      await response.getReceiptWithSigner(signer);

      return response.transactionId.toString();
    }

    return null;
  },
  async checkBalance() {
    const accountIdStr = this.getAccountId();
    if (accountIdStr !== null) {
      const accountId = AccountId.fromString(accountIdStr);

      const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
      const client = Client.forTestnet();

      const balance = await balanceQuery.execute(client);

      client.close();
      return {
        hbars: balance.hbars.toString(),
      };
    } else {
      throw new Error("Account Id not found!");
    }
  },
};
