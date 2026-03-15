import api from "@/lib/api";
import { TransferRequest, SearchUser } from "@/types/transaction";

export const transactionService = {
  async transfer(data: TransferRequest): Promise<any> {
    const response = await api.post("/transactions/transfer", data);
    return response.data;
  },

  async searchUsers(query: string): Promise<SearchUser[]> {
    if (query.length < 3) return [];
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async getMyTransactions(params?: { type?: string; page?: number; per_page?: number }): Promise<any> {
    const response = await api.get("/transactions/me", { params });
    return response.data.data;
  },
};
