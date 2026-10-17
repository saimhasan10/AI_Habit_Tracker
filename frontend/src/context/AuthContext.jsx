import { createContext, useContext, useEffect, useState } from "react";
import {
    getProfile,
    loginUser,
    logoutUser,
    registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    const isAuthenticated = Boolean(localStorage.getItem("token"));

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const profile = await getProfile();
                setUser(profile);
                localStorage.setItem("user", JSON.stringify(profile));
            } catch {
                logoutUser();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials) => {
        const data = await loginUser(credentials);

        try {
            const profile = await getProfile();
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
        } catch {
            const savedUser = data.user || null;
            setUser(savedUser);

            if (savedUser) {
                localStorage.setItem("user", JSON.stringify(savedUser));
            }
        }

        return data;
    };

    const register = async (data) => {
        return registerUser(data);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);