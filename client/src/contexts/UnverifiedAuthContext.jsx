import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useUnverifiedAuth = () => useContext(AuthContext);

export const UnverifiedAuthProvider = ({ children }) => {
    const [isUnverified, setIsUnverified] = useState(false);
    const [loading, setLoading] = useState(true);  // Track loading state

    // Check authentication status
    const checkAuth = async () => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;  // Use your environment variable here

            // Use Axios to send the request
            const response = await fetch(`${serverUrl}/api/auth/isVerified`, {
                method: "GET",
                credentials: "include",  // Ensure credentials are included in the request
            });

            if (response.status === 200) {
                setIsUnverified(true);  // User is logged in
            } else {
                setIsUnverified(false);  // User is not logged in
            }
        } catch (error) {
            setIsUnverified(false);  // User is not logged in
        } finally {
            setLoading(false);  // Authentication check is done
        }
    };

    useEffect(() => {
        checkAuth();  // Check authentication status when app loads
    }, []);

    return (
        <AuthContext.Provider value={{ isUnverified, checkAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
