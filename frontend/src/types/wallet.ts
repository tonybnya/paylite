export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface WalletResponse {
  data: Wallet;
  status: string;
}
