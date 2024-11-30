import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationButton from "../components/buttons/AuthenticationButton";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // Ensure cookies are sent for session handling
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Login failed. Please try again.");
                return;
            }

            // Fetch user details from session
            const userResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/getUserBySession`, {
                method: "GET",
                credentials: "include",
            });

            try {
                // Check if the response is OK (status 2xx)
                if (!userResponse.ok) {
                    // Log the status code for debugging
                    console.error("Error response status:", userResponse.status);
                    const errorText = await userResponse.text(); // Get the raw text
                    console.error("Error response body:", errorText);
            
                    // Try to parse JSON, otherwise fallback to raw error message
                    const userData = errorText ? JSON.parse(errorText) : {};
                    setErrorMessage(userData.error || `Failed to fetch user details. Status: ${userResponse.status}`);
                    return;
                }
            
                // Attempt to parse JSON if the response is successful
                const userData = await userResponse.json();
            
                // If userData is unexpectedly empty, handle that case
                if (!userData || !userData.user) {
                    setErrorMessage("User data is missing or malformed.");
                    return;
                }
            
                // Continue with the valid user data processing here...
            } catch (error) {
                // Catch any other errors (e.g., network failure, invalid JSON)
                console.error("An error occurred:", error);
                setErrorMessage("An error occurred while fetching user details. Please try again later.");
            }

            // Redirect based on user role
            const { role } = userData.user;
            if (role === 0) {
                window.location.href = "/student/my-courses";
                return;
            };
            if (role === 1) {
                window.location.href = "/faculty/my-courses";
                return;
            };
            if (role === 2) {
                window.location.href = "/admin/user-management";
                return;
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrorMessage("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                <form onSubmit={handleLogin}>
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="border w-full p-2 mb-4 rounded"
                        required
                    />
                    <label className="block mb-2 text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="border w-full p-2 mb-4 rounded"
                        required
                    />
                    <AuthenticationButton label="Login" type="submit" />
                </form>
                {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
                <div className="mt-4 text-sm text-center">
                    <p>
                        Forgot password?{" "}
                        <a href="/password-setup" className="text-blue-500">
                            Reset Password
                        </a>
                    </p>
                    <p className="mt-2 text-gray-500">— OR —</p>
                    <p>
                        First time logging in?{" "}
                        <a href="/verification" className="text-blue-500">
                            Set Up Your Password
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
