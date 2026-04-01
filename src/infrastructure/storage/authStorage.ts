/**
 * INFRASTRUCTURE — Auth Storage Adapter
 * Abstrai leitura/escrita de dados de autenticação no localStorage.
 * O restante da aplicação não deve acessar localStorage para auth diretamente.
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";

export interface StoredUser {
  email: string;
  userName: string;
  token: string;
}

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
