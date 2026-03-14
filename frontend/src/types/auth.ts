export interface User {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  is_active: boolean;
  role: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    user: User;
  };
  status: string;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Opting for optional if needed by some specific mock cases, but typically required
}

export interface RegisterCredentials {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password?: string;
}
