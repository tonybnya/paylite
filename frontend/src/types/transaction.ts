export interface Transaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT";
  created_at: string;
  wallet_id?: string;
}

export interface TransferRequest {
  to_user_id: string;
  amount: number;
}

export interface SearchUser {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}
