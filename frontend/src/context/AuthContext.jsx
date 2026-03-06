import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Inject token into API headers
                    marketAPI.setToken(token);
                    // Fetch user profile to validate token
                    const userData = await marketAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error("Invalid or expired session:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await marketAPI.login(email, password);
            localStorage.setItem('token', data.access_token);
            marketAPI.setToken(data.access_token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Failed to login. Please check credentials."
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            await marketAPI.register(name, email, password);
            // Auto login after successful registration
            return await login(email, password);
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Registration failed. Email might be in use."
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        marketAPI.clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
