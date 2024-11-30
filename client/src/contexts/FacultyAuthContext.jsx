import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useFacultyAuth = () => useContext(AuthContext);

export const FacultyAuthProvider = ({ children }) => {
    const [isFaculty, setIsFaculty] = useState(false);
    const [loading, setLoading] = useState(true);  // Track loading state

    // Check authentication status
    const checkAuth = async () => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;  // Use your environment variable here

            const response = await fetch(`${serverUrl}/api/auth/isFaculty`, {
                method: "GET",
                credentials: "include",  // Ensure credentials are included in the request
            });

            if (response.status === 200) {
                setIsFaculty(true);  // User is logged in
            } else {
                setIsFaculty(false);  // User is not logged in
            }
        } catch (error) {
            setIsFaculty(false);  // User is not logged in
        } finally {
            setLoading(false);  // Authentication check is done
        }
    };

    useEffect(() => {
        checkAuth();  // Check authentication status when app loads
    }, []);

    return (
        <AuthContext.Provider value={{ isFaculty: isFaculty, checkAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
