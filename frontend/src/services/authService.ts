import api from "./api";

// Define types for clarity
interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

const AuthService = {
  // 🔑 Login
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);

    // Save token
    localStorage.setItem("token", data.access_token);

    // Fetch profile
    const profile = await this.getProfile();
    localStorage.setItem("user", JSON.stringify(profile));

    return data;
  },

  // 👤 Get current profile
  async getProfile() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // 🚪 Logout
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // 🔍 Helper to check if logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  // 🔍 Get stored user
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default AuthService;
