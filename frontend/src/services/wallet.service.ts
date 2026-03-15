import api from "@/lib/api";
import { WalletResponse } from "@/types/wallet";

export const walletService = {
  async getMyWallet(): Promise<WalletResponse> {
    const response = await api.get("/wallets/me");
    return response.data;
  },
};
