import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authStorage } from "@/infrastructure/storage/authStorage";
import type { StoredUser } from "@/infrastructure/storage/authStorage";

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: StoredUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    const savedUser = authStorage.getUser();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: StoredUser) => {
    authStorage.setToken(userData.token);
    authStorage.setUser(userData);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    authStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
