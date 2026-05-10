"use client";

import {
  useCallback,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import api, { SOCKET_BASE_URL } from "../services/api";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  department?: string;
  bio?: string;
  skills?: string[];
}

interface AuthContextType {
  userToken: string | null;
  user: UserProfile | null;
  userId: string | null;
  inviteCount: number;
  authReady: boolean;
  login: (token: string, userData: UserProfile) => void;
  logout: () => Promise<void>;
  refreshInviteCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

let socket: Socket | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  const disconnectSocket = useCallback(() => {
    socket?.disconnect();
    socket = null;
  }, []);

  const connectSocket = useCallback((token: string) => {
    disconnectSocket();

    socket = io(SOCKET_BASE_URL, {
      auth: { token },
    });

    socket.on("newInvite", () => {
      setInviteCount((prev) => prev + 1);
    });
  }, [disconnectSocket]);

  const refreshInviteCount = useCallback(async () => {
    try {
      const response = await api.get("/invitations/received");
      setInviteCount(response.data.length || 0);
    } catch {
      setInviteCount(0);
    }
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (!storedToken) {
        setAuthReady(true);
        return;
      }

      try {
        setUserToken(storedToken);
        connectSocket(storedToken);

        const response = await api.get("/auth/me");
        setUser(response.data.user);
        await refreshInviteCount();
      } catch {
        localStorage.removeItem("accessToken");
        setUserToken(null);
        setUser(null);
        setInviteCount(0);
        disconnectSocket();
      } finally {
        setAuthReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, refreshInviteCount]);

  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem("accessToken", token);
    setUserToken(token);
    setUser(userData);
    connectSocket(token);
    refreshInviteCount();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local session even if server logout fails.
    }

    localStorage.removeItem("accessToken");
    setUserToken(null);
    setUser(null);
    setInviteCount(0);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        userId: user?._id || null,
        inviteCount,
        authReady,
        login,
        logout,
        refreshInviteCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
