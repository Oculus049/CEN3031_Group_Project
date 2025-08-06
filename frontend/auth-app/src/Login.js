import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password) {
            setError("Username and password are required");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = new URLSearchParams();
        formDetails.append("username", username);
        formDetails.append("password", password);

        try {
            const response = await fetch("http://localhost:8000/token", {
                method: "POST",
                body: formDetails,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            setLoading(false);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.access_token);
                navigate("/homepage");
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Authentication Error');
            }
        } catch (error) {
            setLoading(false);
            setError("Server connection error.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FFA500" }}>
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">Group-UP</h1>
                <form onSubmit={handleSubmit}>
                    <label className="block text-blue-900 mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <label className="block text-blue-900 mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800 transition"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                    {error && (
                        <p className="text-center text-red-500 mt-4">{error}</p>
                    )}
                    <p className="text-center text-sm text-[#FFA500] mt-4">
                        <a href="#" className="hover:underline">Forgot password?</a>
                    </p>
                    <p className="text-center text-sm text-blue-900 mt-2">
                        Don't have an account? <a href="#" className="hover:underline">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;