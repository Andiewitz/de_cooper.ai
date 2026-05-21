"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { authApi, type UserResponse, type LoginData, type RegisterData, ApiError } from "@/lib/api";

interface AuthContextType {
    user: UserResponse | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: UserResponse) => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "decooper_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            setToken(savedToken);
            authApi
                .getMe(savedToken)
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (data: LoginData) => {
        setError(null);
        try {
            const response = await authApi.login(data);
            localStorage.setItem(TOKEN_KEY, response.access_token);
            setToken(response.access_token);

            const userData = await authApi.getMe(response.access_token);
            setUser(userData);
        } catch (err) {
            const message = err instanceof ApiError ? err.detail : "Login failed";
            setError(message);
            throw err;
        }
    }, []);

    const googleLogin = useCallback(async (credential: string) => {
        setError(null);
        try {
            const response = await authApi.googleLogin(credential);
            localStorage.setItem(TOKEN_KEY, response.access_token);
            setToken(response.access_token);

            const userData = await authApi.getMe(response.access_token);
            setUser(userData);
        } catch (err) {
            const message = err instanceof ApiError ? err.detail : "Google login failed";
            setError(message);
            throw err;
        }
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setError(null);
        try {
            await authApi.register(data);
            // Auto-login after registration
            await login({ email: data.email, password: data.password });
        } catch (err) {
            const message = err instanceof ApiError ? err.detail : "Registration failed";
            setError(message);
            throw err;
        }
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((updatedUser: UserResponse) => {
        setUser(updatedUser);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                googleLogin,
                logout,
                updateUser,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
