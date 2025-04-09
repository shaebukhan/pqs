import axios from "axios";
import { useState, useContext, createContext, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: Cookies.get("token") || "",  // Get token from cookies
    });

    // Set default Authorization header for axios
    useEffect(() => {
        if (auth.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
        }
    }, [auth.token]);

    useEffect(() => {
        const data = Cookies.get("auth");
        if (data) {
            const parseData = JSON.parse(data);
            setAuth({
                ...auth,
                user: parseData.user,
                token: parseData.token,
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access AuthContext
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
