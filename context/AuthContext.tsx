
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getSession, loginUser, logoutUser, registerUser } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const session = getSession();
        if (session) setUser(session);
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const u = await loginUser(email, pass);
        setUser(u);
    };

    const register = async (email: string, pass: string, name: string) => {
        const u = await registerUser(email, pass, name);
        setUser(u);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
